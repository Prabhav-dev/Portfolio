/* Updated about-tree.js */
const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

let treeData = null;
let animProgress = 0;
let animationFrameId = null;
let activeInfoCard = null;
let currentHoveredNode = null;
let pulseTime = 0;
let lastFrameTime = performance.now();

let isMobile = window.innerWidth <= 768;
let lastWidth = window.innerWidth;
let resizeDebounceId = null;
let isPageVisible = true;

const PORTFOLIO_NODES = [
  { title: "Foundations", detail: "Pursuing a Bachelor's in Computer Engineering with a core focus on Data Structures, Algorithms, and CS fundamentals." },
  { title: "Backend Systems", detail: "Built foundational skills in Rust and the Java Spring framework for building scalable backend services." },
  { title: "Low-Level Infra", detail: "Engineered prototypes for a custom B+ Tree storage engine and a manual database ledger architecture." },
  { title: "Hardware", detail: "Foundational knowledge in Digital Logic, COA, 8086 Microprocessor, Theory of Computation, and Compiler Design." },
  { title: "Space Tech", detail: "Developed a Python pipeline fetching Google Earth Engine satellite imagery for spatial impact analysis." },
  { title: "Conversion", detail: "Contributed to open-source by porting java-diff-utils to Rust while maintaining full test suite compliance." },
  { title: "Systems Prog", detail: "Focused on low-level memory programming, regex engines, and parallel distributed systems." },
  { title: "Cyber Security", detail: "Honours and Minor in Cyber Security; practical experience deploying ASCON-128 and Argon2 cryptography." },
  { title: "Artificial Intelligence", detail: "Minor in Artificial Intelligence; hands-on experience implementing custom algorithms like Myers diff and Union-Find." }
];

function getThemeColors() {
    const isLight = document.body.classList.contains('light-mode');
    return {
        branchColor: isLight ? '#754ef9' : '#b892ff',
        purpleGlow: isLight ? '#a78bfa' : '#754ef9',
        whiteGlow: '#ffffff',
        nodeBg: isLight ? '#754ef9' : '#9333ea',
        nodeBorder: '#ffffff',
        nodeText: '#ffffff'
    };
}

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);

    buildTreeStructure();
}

function buildTreeStructure() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const startX = w * 0.5;
    const startY = h * 0.88;
    
    // Proportional scaling: drastically lower the base scale on mobile 
    // so the naturally wide tree fits without needing vertical distortion.
    const scale = isMobile 
        ? Math.min(w / 750, h / 800) 
        : Math.min(w / 1200, h / 950);

    const groundLine = {
        x1: w * (isMobile ? 0.05 : 0.15),
        y1: startY,
        x2: w * (isMobile ? 0.95 : 0.85),
        y2: startY,
        width: 3 * scale
    };

    function createBranch(x1, y1, angle, length, width, depth, maxDepth, startProg) {
        // Reverted inward steering. Let the tree branch naturally.
        const bend = (Math.random() - 0.5) * 0.25;
        const midAngle = angle + bend;

        const cpX = x1 + (length * 0.5) * Math.cos(midAngle);
        const cpY = y1 - (length * 0.5) * Math.sin(midAngle);

        const endX = x1 + length * Math.cos(angle);
        const endY = y1 - length * Math.sin(angle);

        const duration = 0.22;
        const children = [];

        if (depth < maxDepth) {
            const branchCount = depth === 0 ? 3 : (Math.random() > 0.35 ? 2 : 3);
            // Maintain the same natural spread for both PC and mobile
            const spread = 0.65 + Math.random() * 0.35;

            for (let i = 0; i < branchCount; i++) {
                const angleOffset = ((i / (branchCount - 1 || 1)) - 0.5) * spread * 2 + (Math.random() - 0.5) * 0.1;
                const nextAngle = angle + angleOffset;
                const nextLength = length * 0.72 + (Math.random() * 0.1 * length);
                const nextWidth = Math.max(width * 0.72, 1.8 * scale);
                const nextStartProg = startProg + duration * 0.8;

                children.push(createBranch(endX, endY, nextAngle, nextLength, nextWidth, depth + 1, maxDepth, nextStartProg));
            }
        }

        return {
            x1, y1, cpX, cpY, endX, endY,
            width, depth, maxDepth, children, info: null,
            startProgress: startProg,
            duration: duration
        };
    }

    const stemHeight = 220 * scale;
    const stemWidth = 18 * scale; 
    
    const rootTrunk = createBranch(startX, startY - (stemWidth / 2), Math.PI / 2, stemHeight, stemWidth, 0, 4, 0);

    const leafNodes = [];
    function collectLeaves(node) {
        if (node.children.length === 0) {
            leafNodes.push(node);
        } else {
            node.children.forEach(collectLeaves);
        }
    }
    collectLeaves(rootTrunk);
    leafNodes.sort(() => Math.random() - 0.5);

    const placedBoxCoords = [];
    let infoIndex = 0;
    
    // Slightly smaller font on mobile to prevent pill overlaps
    ctx.font = isMobile ? 'bold 8.5px sans-serif' : 'bold 9.5px sans-serif'; 

    const gap = isMobile ? 3 : 12;
    const topMargin = isMobile ? 50 : 90;
    const sideMargin = isMobile ? 10 : 40;

    leafNodes.forEach(leaf => {
        if (infoIndex >= PORTFOLIO_NODES.length) return; 

        const candidateInfo = PORTFOLIO_NODES[infoIndex];
        const textMetrics = ctx.measureText(candidateInfo.title);
        const btnWidth = textMetrics.width + 16; 
        const btnHeight = 20;

        const btnLeft = leaf.endX - btnWidth / 2;
        const btnRight = leaf.endX + btnWidth / 2;
        const btnTop = leaf.endY - btnHeight / 2;
        const btnBottom = leaf.endY + btnHeight / 2;

        // Ensure target leaf natively fits within bounds
        if (btnLeft < sideMargin || btnRight > w - sideMargin || btnTop < topMargin || btnBottom > h - 40) {
            return; 
        }

        const isOverlapping = placedBoxCoords.some(box => {
            return !(btnRight + gap < box.left || 
                     btnLeft - gap > box.right || 
                     btnBottom + gap < box.top || 
                     btnTop - gap > box.bottom);
        });

        if (!isOverlapping) {
            leaf.info = candidateInfo;
            infoIndex++;
            placedBoxCoords.push({ left: btnLeft, right: btnRight, top: btnTop, bottom: btnBottom });
        }
    });

    // Gentle fallback pass for any remaining nodes if collision was too strict
    if (infoIndex < PORTFOLIO_NODES.length) {
        leafNodes.forEach(leaf => {
            if (infoIndex >= PORTFOLIO_NODES.length || leaf.info) return;
            // Only assign if the leaf isn't blatantly off-screen
            if (leaf.endX > sideMargin && leaf.endX < w - sideMargin) {
                leaf.info = PORTFOLIO_NODES[infoIndex];
                infoIndex++;
            }
        });
    }

    treeData = { groundLine, rootTrunk, scale };
}

function drawTree(progress) {
    if (!treeData) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = getThemeColors();
    const pulseFactor = (Math.sin(pulseTime) + 1) / 2;
    const glowMax = isMobile ? 4 : 18;
    const glowRadius = (isMobile ? 2 : 10) + pulseFactor * glowMax;
    const coreBrightness = 0.5 + pulseFactor * 0.5;

    const gl = treeData.groundLine;
    const currentGroundX2 = gl.x1 + (gl.x2 - gl.x1) * Math.min(1, progress * 2.5);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(gl.x1, gl.y1);
    ctx.lineTo(currentGroundX2, gl.y2);

    if (!isMobile) {
        ctx.shadowColor = pulseFactor > 0.5 ? colors.purpleGlow : colors.whiteGlow;
        ctx.shadowBlur = glowRadius;
    }
    ctx.strokeStyle = colors.branchColor;
    ctx.lineWidth = gl.width;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(gl.x1, gl.y1);
    ctx.lineTo(currentGroundX2, gl.y2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${coreBrightness * 0.7})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    function drawBranch(node) {
        const localProgress = Math.max(0, Math.min(1, (progress - node.startProgress) / node.duration));
        if (localProgress <= 0) return;

        const currentCpX = node.x1 + (node.cpX - node.x1) * localProgress;
        const currentCpY = node.y1 + (node.cpY - node.y1) * localProgress;
        const currentEndX = node.x1 + (node.endX - node.x1) * localProgress;
        const currentEndY = node.y1 + (node.endY - node.y1) * localProgress;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(node.x1, node.y1);
        ctx.quadraticCurveTo(currentCpX, currentCpY, currentEndX, currentEndY);

        if (!isMobile) {
            ctx.shadowColor = pulseFactor > 0.5 ? colors.purpleGlow : colors.whiteGlow;
            ctx.shadowBlur = glowRadius;
        }
        ctx.strokeStyle = colors.branchColor;
        ctx.lineWidth = node.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(node.x1, node.y1);
        ctx.quadraticCurveTo(currentCpX, currentCpY, currentEndX, currentEndY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${coreBrightness * 0.65})`;
        ctx.lineWidth = Math.max(0.8, node.width * 0.22);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();

        if (localProgress > 0.35) {
            node.children.forEach(child => drawBranch(child));
        }

        if (localProgress >= 1 && node.info) {
            drawInteractiveTip(node.endX, node.endY, node.info, colors, pulseFactor);
        }
    }

    drawBranch(treeData.rootTrunk);
}

function drawInteractiveTip(x, y, info, colors, pulseFactor) {
    ctx.save();

    ctx.font = isMobile ? 'bold 8.5px sans-serif' : 'bold 9.5px sans-serif';
    const textMetrics = ctx.measureText(info.title);
    const btnWidth = textMetrics.width + 16; 
    const btnHeight = 20;
    
    // Reverted hard clamping. Text draws exactly at the natural branch end.
    const btnX = x - btnWidth / 2;
    const btnY = y - btnHeight / 2;
    const radius = 10;

    if (!isMobile) {
        ctx.shadowColor = colors.whiteGlow;
        ctx.shadowBlur = 10 + pulseFactor * 8;
    }

    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(btnX, btnY, btnWidth, btnHeight, radius);
    } else {
        ctx.rect(btnX, btnY, btnWidth, btnHeight);
    }
    ctx.fillStyle = colors.nodeBg;
    ctx.fill();

    ctx.strokeStyle = colors.nodeBorder;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = colors.nodeText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(info.title, x, y + 0.5);

    ctx.restore();

    // Map hitboxes natively to X and Y
    info.x = x;
    info.y = y;
    info.w = btnWidth;
    info.h = btnHeight;
}

function animate(now) {
    if (!isPageVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
    }

    const dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    pulseTime += isMobile ? 0.04 : 0.035;

    if (animProgress < 1) {
        animProgress += dt / 1.8;
        if (animProgress > 1) animProgress = 1;
    }

    drawTree(animProgress);
    animationFrameId = requestAnimationFrame(animate);
}

document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
});

function startTreeAnimation() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    hideInfoCard();
    animProgress = 0;
    pulseTime = 0;
    lastFrameTime = performance.now();
    buildTreeStructure();
    animationFrameId = requestAnimationFrame(animate);
}

function findNodeAt(canvasX, canvasY) {
    if (!treeData) return null;
    let found = null;

    function checkHit(node) {
        if (node.info && node.info.x) {
            const dx = Math.abs(canvasX - node.info.x);
            const dy = Math.abs(canvasY - node.info.y);
            if (dx < (node.info.w / 2 + 6) && dy < (node.info.h / 2 + 6)) {
                found = node.info;
            }
        }
        node.children.forEach(checkHit);
    }

    checkHit(treeData.rootTrunk);
    return found;
}

window.addEventListener('mousemove', (e) => {
    if (!treeData || animProgress < 1) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const hoveredNode = findNodeAt(mouseX, mouseY);

    if (hoveredNode) {
        canvas.style.cursor = 'pointer';
        if (currentHoveredNode !== hoveredNode) {
            currentHoveredNode = hoveredNode;
            showInfoCard(hoveredNode, e.clientX, e.clientY);
        } else if (activeInfoCard) {
            positionInfoCard(e.clientX, e.clientY);
        }
    } else {
        canvas.style.cursor = 'default';
        if (currentHoveredNode !== null) {
            currentHoveredNode = null;
            hideInfoCard();
        }
    }
});

canvas.addEventListener('touchstart', (e) => {
    if (!treeData || animProgress < 1) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    const tappedNode = findNodeAt(touchX, touchY);

    if (tappedNode) {
        e.preventDefault();
        if (currentHoveredNode === tappedNode && activeInfoCard) {
            currentHoveredNode = null;
            hideInfoCard();
        } else {
            currentHoveredNode = tappedNode;
            showInfoCard(tappedNode, touch.clientX, touch.clientY);
        }
    } else if (currentHoveredNode !== null) {
        currentHoveredNode = null;
        hideInfoCard();
    }
}, { passive: false });

canvas.addEventListener('click', (e) => {
    if (animProgress < 1) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (findNodeAt(clickX, clickY)) return;
    startTreeAnimation();
});

function positionInfoCard(clientX, clientY) {
    if (!activeInfoCard) return;

    const cardWidth = Math.min(280, window.innerWidth * 0.78 + 20);
    const cardHeight = activeInfoCard.offsetHeight || 100;

    let left = clientX + 15;
    let top = isMobile ? clientY - cardHeight - 20 : clientY + 15;

    if (isMobile) {
        left = clientX - cardWidth / 2;
    }

    if (left + cardWidth > window.innerWidth - 10) left = window.innerWidth - cardWidth - 10;
    if (left < 10) left = 10;
    if (top < 10) top = clientY + 20;
    if (top + cardHeight > window.innerHeight - 10) top = window.innerHeight - cardHeight - 10;

    activeInfoCard.style.left = `${left}px`;
    activeInfoCard.style.top = `${top}px`;
}

function showInfoCard(info, clientX, clientY) {
    hideInfoCard();

    const card = document.createElement('div');
    card.className = 'tree-info-card';
    card.style.pointerEvents = 'none';
    card.innerHTML = `
        <h4>${info.title}</h4>
        <p>${info.detail}</p>
    `;

    document.body.appendChild(card);
    activeInfoCard = card;
    positionInfoCard(clientX, clientY);
}

document.addEventListener('touchstart', (e) => {
    if (activeInfoCard && e.target !== canvas) {
        currentHoveredNode = null;
        hideInfoCard();
    }
}, { passive: true });

function hideInfoCard() {
    if (activeInfoCard) {
        activeInfoCard.remove();
        activeInfoCard = null;
    }
}

window.addEventListener('resize', () => {
    if (isMobile && window.innerWidth === lastWidth) return;

    clearTimeout(resizeDebounceId);
    resizeDebounceId = setTimeout(() => {
        lastWidth = window.innerWidth;
        isMobile = window.innerWidth <= 768;
        resizeCanvas();
        if (animProgress >= 1) drawTree(1);
    }, 200);
});

const darkModeIcon = document.querySelector('#darkMode-icon');
if (darkModeIcon) {
    darkModeIcon.onclick = () => {
        darkModeIcon.classList.toggle('bx-sun');
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        if (animProgress >= 1) drawTree(1);
    };
}

window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (darkModeIcon) darkModeIcon.classList.add('bx-sun');
    }

    resizeCanvas();
    startTreeAnimation();

    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            distance: '60px',
            duration: 2000,
            delay: 200,
            reset: false
        });

        sr.reveal('.about-hero h1', { origin: 'top' });
        sr.reveal('.exp-box', { interval: 200, origin: 'right' });
    }
});