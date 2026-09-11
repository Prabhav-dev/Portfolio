/* ==========================================================================
   ABOUT-TREE.JS — INTERACTIVE TREE WITH VIBRANT GRADIENTS & PARALLAX SCROLL FADE
   ========================================================================== */
const canvas = document.getElementById('treeCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const overlayShade = document.getElementById('tree-overlay-shade');

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
  { title: "Foundations", detail: "Core CS rigor: Data Structures, Algorithms, Computer Organization, 8086 Assembly, and Compiler Design." },
  { title: "Storage Engines", detail: "Engineered Yggdrasil: zero-dependency 4 KiB slotted-page B+Tree engine with WAL crash recovery." },
  { title: "Systems in Rust", detail: "Ported java-diff-utils to pure Rust: Myers diff, delta patching, and unified diffs with 169/169 test pass." },
  { title: "Cyber Security", detail: "Honours & Minor in Cyber Security: NIST Ascon-128 AEAD authenticated page framing and Argon2." },
  { title: "AI & Memory", detail: "Minor in Artificial Intelligence: Fidelity-tiered embedded LLM memory layer without external vector DBs." },
  { title: "NIO Sockets", detail: "Zero-copy non-blocking Java NIO wire protocols, custom frame accumulators, and multiplexing." },
  { title: "Space Tech", detail: "Python spatial data pipeline leveraging Google Earth Engine satellite imagery for change detection." },
  { title: "Zero-Trust Web", detail: "IDEA_VOLTEX: deterministic blind indexing and secure digital transaction pipelines in Spring Boot 3.4." },
  { title: "Telemetry GUI", detail: "Live Swing visual supervisor console for hexadecimal page inspection, B+Tree splits, and metrics." }
];

function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);

    buildTreeStructure();
}

function buildTreeStructure() {
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const startX = w * 0.5;
    // Lowered slightly to provide ample breathing room at the top
    const startY = h * 0.90;
    
    const scale = isMobile 
        ? Math.min(w / 720, h / 780) 
        : Math.min(w / 1200, h / 950);

    const groundLine = {
        x1: w * (isMobile ? 0.08 : 0.15),
        y1: startY,
        x2: w * (isMobile ? 0.92 : 0.85),
        y2: startY,
        width: 3.5 * scale
    };

    function createBranch(x1, y1, angle, length, width, depth, maxDepth, startProg) {
        const bend = (Math.random() - 0.5) * 0.22;
        const midAngle = angle + bend;

        const cpX = x1 + (length * 0.5) * Math.cos(midAngle);
        const cpY = y1 - (length * 0.5) * Math.sin(midAngle);

        const endX = x1 + length * Math.cos(angle);
        const endY = y1 - length * Math.sin(angle);

        const duration = 0.22;
        const children = [];

        if (depth < maxDepth) {
            const branchCount = depth === 0 ? 3 : (Math.random() > 0.35 ? 2 : 3);
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

    const stemHeight = 210 * scale;
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
    
    ctx.font = isMobile ? 'bold 8.5px sans-serif' : 'bold 9.5px sans-serif'; 

    const gap = isMobile ? 4 : 12;
    const topMargin = isMobile ? 60 : 80;
    const sideMargin = isMobile ? 12 : 40;

    leafNodes.forEach(leaf => {
        if (infoIndex >= PORTFOLIO_NODES.length) return; 

        const candidateInfo = PORTFOLIO_NODES[infoIndex];
        const textMetrics = ctx.measureText(candidateInfo.title);
        const btnWidth = textMetrics.width + 18; 
        const btnHeight = 22;

        const btnLeft = leaf.endX - btnWidth / 2;
        const btnRight = leaf.endX + btnWidth / 2;
        const btnTop = leaf.endY - btnHeight / 2;
        const btnBottom = leaf.endY + btnHeight / 2;

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

    if (infoIndex < PORTFOLIO_NODES.length) {
        leafNodes.forEach(leaf => {
            if (infoIndex >= PORTFOLIO_NODES.length || leaf.info) return;
            if (leaf.endX > sideMargin && leaf.endX < w - sideMargin) {
                leaf.info = PORTFOLIO_NODES[infoIndex];
                infoIndex++;
            }
        });
    }

    treeData = { groundLine, rootTrunk, scale, width: w, height: h };
}

function drawTree(progress) {
    if (!treeData || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isLight = document.body.classList.contains('light-mode');
    const pulseFactor = (Math.sin(pulseTime) + 1) / 2;
    const glowMax = isMobile ? 6 : 20;
    const glowRadius = (isMobile ? 3 : 10) + pulseFactor * glowMax;
    const coreBrightness = 0.5 + pulseFactor * 0.5;

    const gl = treeData.groundLine;
    const currentGroundX2 = gl.x1 + (gl.x2 - gl.x1) * Math.min(1, progress * 2.5);

    // Ground Line with Gradient
    ctx.save();
    const groundGrad = ctx.createLinearGradient(gl.x1, gl.y1, gl.x2, gl.y2);
    if (isLight) {
        groundGrad.addColorStop(0, 'rgba(99, 54, 228, 0.2)');
        groundGrad.addColorStop(0.5, '#6336e4');
        groundGrad.addColorStop(1, 'rgba(2, 132, 199, 0.2)');
    } else {
        groundGrad.addColorStop(0, 'rgba(117, 78, 249, 0.2)');
        groundGrad.addColorStop(0.3, '#754ef9');
        groundGrad.addColorStop(0.7, '#00f0ff');
        groundGrad.addColorStop(1, 'rgba(0, 240, 255, 0.2)');
    }

    ctx.beginPath();
    ctx.moveTo(gl.x1, gl.y1);
    ctx.lineTo(currentGroundX2, gl.y2);

    if (!isMobile) {
        ctx.shadowColor = pulseFactor > 0.5 ? (isLight ? '#8967ff' : '#00f0ff') : '#754ef9';
        ctx.shadowBlur = glowRadius;
    }
    ctx.strokeStyle = groundGrad;
    ctx.lineWidth = gl.width;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(gl.x1, gl.y1);
    ctx.lineTo(currentGroundX2, gl.y2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${coreBrightness * 0.75})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Reusable vertical branch gradient from root to canopy
    const branchGrad = ctx.createLinearGradient(treeData.width * 0.5, gl.y1, treeData.width * 0.5, treeData.height * 0.1);
    if (isLight) {
        branchGrad.addColorStop(0, '#6336e4');
        branchGrad.addColorStop(0.5, '#8b5cf6');
        branchGrad.addColorStop(1, '#0284c7');
    } else {
        branchGrad.addColorStop(0, '#754ef9');
        branchGrad.addColorStop(0.4, '#a855f7');
        branchGrad.addColorStop(0.8, '#38bdf8');
        branchGrad.addColorStop(1, '#00f0ff');
    }

    function drawBranch(node) {
        const localProgress = Math.max(0, Math.min(1, (progress - node.startProgress) / node.duration));
        if (localProgress <= 0) return;

        const currentCpX = node.x1 + (node.cpX - node.x1) * localProgress;
        const currentCpY = node.y1 + (node.cpY - node.y1) * localProgress;
        const currentEndX = node.x1 + (node.endX - node.x1) * localProgress;
        const currentEndY = node.y1 + (node.endY - node.y1) * localProgress;

        // Outer glowing gradient branch
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(node.x1, node.y1);
        ctx.quadraticCurveTo(currentCpX, currentCpY, currentEndX, currentEndY);

        if (!isMobile) {
            ctx.shadowColor = pulseFactor > 0.5 ? (isLight ? '#8967ff' : '#00f0ff') : '#754ef9';
            ctx.shadowBlur = glowRadius;
        }
        ctx.strokeStyle = branchGrad;
        ctx.lineWidth = node.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();

        // Inner glowing filament core
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(node.x1, node.y1);
        ctx.quadraticCurveTo(currentCpX, currentCpY, currentEndX, currentEndY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${coreBrightness * 0.7})`;
        ctx.lineWidth = Math.max(0.8, node.width * 0.22);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();

        if (localProgress > 0.35) {
            node.children.forEach(child => drawBranch(child));
        }

        if (localProgress >= 1 && node.info) {
            drawInteractiveTip(node.endX, node.endY, node.info, pulseFactor, isLight);
        }
    }

    drawBranch(treeData.rootTrunk);
}

function drawInteractiveTip(x, y, info, pulseFactor, isLight) {
    ctx.save();

    ctx.font = isMobile ? 'bold 8.5px sans-serif' : 'bold 9.5px sans-serif';
    const textMetrics = ctx.measureText(info.title);
    const btnWidth = textMetrics.width + 18; 
    const btnHeight = 22;
    
    const btnX = x - btnWidth / 2;
    const btnY = y - btnHeight / 2;
    const radius = 11;

    // Gradient fill for interactive node pill
    const nodeGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnWidth, btnY + btnHeight);
    if (isLight) {
        nodeGrad.addColorStop(0, '#6336e4');
        nodeGrad.addColorStop(1, '#0284c7');
    } else {
        nodeGrad.addColorStop(0, '#754ef9');
        nodeGrad.addColorStop(0.5, '#9333ea');
        nodeGrad.addColorStop(1, '#0284c7');
    }

    if (!isMobile) {
        ctx.shadowColor = isLight ? '#8967ff' : '#00f0ff';
        ctx.shadowBlur = 10 + pulseFactor * 10;
    }

    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(btnX, btnY, btnWidth, btnHeight, radius);
    } else {
        ctx.rect(btnX, btnY, btnWidth, btnHeight);
    }
    ctx.fillStyle = nodeGrad;
    ctx.fill();

    // Crisp node border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(info.title, x, y + 0.5);

    ctx.restore();

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

if (canvas) {
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
}

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

/* ==========================================================================
   PARALLAX SCROLL FADE HANDLER
   ========================================================================== */
function handleParallaxFade() {
    const scrollY = window.scrollY || window.pageYOffset;
    const heroHeight = window.innerHeight * 0.75;
    
    // Calculate fade factor (0 at top, 1 when scrolled down past hero)
    const fadeRatio = Math.min(1, Math.max(0, scrollY / heroHeight));

    if (canvas) {
        canvas.style.opacity = (1 - fadeRatio * 0.95).toFixed(3);
    }

    if (overlayShade) {
        overlayShade.style.opacity = (fadeRatio * 0.94).toFixed(3);
    }
}

window.addEventListener('scroll', handleParallaxFade, { passive: true });

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
    handleParallaxFade();

    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            distance: '50px',
            duration: 1200,
            delay: 150,
            reset: false
        });

        sr.reveal('.about-section-header', { origin: 'top' });
        sr.reveal('.pillar-card', { interval: 150, origin: 'bottom' });
        sr.reveal('.exp-box', { interval: 150, origin: 'right' });
    }
});