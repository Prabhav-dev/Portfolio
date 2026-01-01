const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

let branches = [];
let currentFrame = 0;
let totalFrames = 190;
let isAnimating = false;
let treeGenerated = false;
let treeColor = '#000';
let glowColor = 'cyan';

function syncColorsWithTheme() {
    const isLightMode = document.body.classList.contains('light-mode');
    
    if (isLightMode) {
        treeColor = '#333'; 
        glowColor = '#ffaa00'; 
    } else {
        treeColor = '#fdfdfd'; 
        glowColor = '#754ef9'; 
    }

    document.documentElement.style.setProperty('--glow-color', glowColor);
    
    if (treeGenerated && !isAnimating) {
        toggleTreeGlow(true);
    }
}

// Responsive canvas sizing
function resizeCanvas() {
    const maxWidth = 800;
    const maxHeight = 900;
    const padding = 20;
    
    const availableWidth = window.innerWidth - padding;
    const availableHeight = window.innerHeight - padding;
    
    let width = Math.min(maxWidth, availableWidth);
    let height = Math.min(maxHeight, availableHeight);
    
    // Maintain aspect ratio
    const aspectRatio = maxWidth / maxHeight;
    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    if (treeGenerated && !isAnimating) {
        toggleTreeGlow(true);
    }
}

// Detect color scheme
function updateColorScheme() {
    syncColorsWithTheme();

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isDark) {
        treeColor = '#fff';
        glowColor = 'cyan';
    } else {
        treeColor = '#000';
        glowColor = '#ffaa00';
    }

    document.documentElement.style.setProperty('--glow-color', glowColor);
    
    if (treeGenerated && !isAnimating) {
        toggleTreeGlow(true);
    }
}

class Branch {
    constructor(x1, y1, x2, y2, width, generation) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.width = width;
        this.generation = generation;
    }
    
    draw(progress) {
        const currentProgress = Math.min(progress, 1);
        const currentX = this.x1 + (this.x2 - this.x1) * currentProgress;
        const currentY = this.y1 + (this.y2 - this.y1) * currentProgress;
        
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = treeColor;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

function generateTree() {
    branches = [];
    
    const startX = canvas.width / 2;
    const startY = canvas.height - 50;
    
    // Ground line
    const groundBranch = new Branch(0, startY, canvas.width, startY, 2, -1);
    branches.push(groundBranch);
    
    // Scale tree
    const scale = Math.min(canvas.width / 800, canvas.height / 900);
    const trunkHeight = 275 * scale;
    const trunkThickness = 18 * scale;
    
    branches.push(new Branch(startX, startY, startX, startY - trunkHeight, trunkThickness, 0));
    
    const seed = 67890;
    let rng = seed;
    function random() {
        rng = (rng * 9301 + 49297) % 233280;
        return rng / 233280;
    }
    
    function createBranches(x, y, angle, length, width, depth, generation, isRandom = false) {
        if (depth === 0 || length < 12 * scale) return;
        
        const endX = x + length * Math.cos(angle);
        const endY = y - length * Math.sin(angle);
        
        branches.push(new Branch(x, y, endX, endY, width, generation));
        
        let angleVariation, baseAngleSpread, lengthReduction;
        
        if (isRandom) {
            angleVariation = (random() - 0.5) * 0.5;
            baseAngleSpread = 0.4 + random() * 0.4;
            lengthReduction = 0.6 + random() * 0.2;
        } else {
            angleVariation = (random() - 0.5) * 0.2;
            if (generation === 1) {
                baseAngleSpread = 0.78;
            } else if (generation === 2) {
                baseAngleSpread = 0.52;
            } else if (depth <= 2) {
                baseAngleSpread = 0.38;
            } else {
                baseAngleSpread = 0.48;
            }
            lengthReduction = 0.68;
        }
        
        const newLength = length * lengthReduction;
        const newWidth = Math.max(width * 0.72, 1.2 * scale);
        
        let numBranches;
        if (depth <= 1) {
            numBranches = 1;
        } else if (depth === 2) {
            numBranches = random() > 0.5 ? 2 : 1;
        } else if (isRandom) {
            const rand = random();
            numBranches = rand > 0.7 ? 3 : (rand > 0.3 ? 2 : 1);
        } else {
            numBranches = generation === 1 ? 2 : (random() > 0.65 ? 3 : 2);
        }
        
        const nextIsRandom = !isRandom && random() > 0.6;
        
        if (numBranches === 1) {
            const singleAngle = angle + angleVariation * 0.8;
            createBranches(endX, endY, singleAngle, newLength, newWidth, depth - 1, generation + 1, nextIsRandom);
        } else if (numBranches === 2) {
            const leftAngle = angle + baseAngleSpread + angleVariation;
            const rightAngle = angle - baseAngleSpread - angleVariation;
            createBranches(endX, endY, leftAngle, newLength, newWidth, depth - 1, generation + 1, nextIsRandom);
            createBranches(endX, endY, rightAngle, newLength, newWidth, depth - 1, generation + 1, nextIsRandom);
        } else {
            const leftAngle = angle + baseAngleSpread * 1.1 + angleVariation;
            const midAngle = angle + angleVariation * 0.3;
            const rightAngle = angle - baseAngleSpread * 1.1 - angleVariation;
            createBranches(endX, endY, leftAngle, newLength * 0.92, newWidth, depth - 1, generation + 1, nextIsRandom);
            createBranches(endX, endY, midAngle, newLength * 0.88, newWidth * 0.9, depth - 1, generation + 1, nextIsRandom);
            createBranches(endX, endY, rightAngle, newLength * 0.92, newWidth, depth - 1, generation + 1, nextIsRandom);
        }
    }
    
    const branchStartHeight = startY - (trunkHeight * 0.7);
    const startAngle = Math.PI / 2;
    
    const mainBranches = [
        { angle: startAngle - 0.5, random: false },
        { angle: startAngle - 0.25, random: true },
        { angle: startAngle, random: false },
        { angle: startAngle + 0.25, random: true },
        { angle: startAngle + 0.5, random: false }
    ];
    
    mainBranches.forEach((branch) => {
        const branchLength = 175 * scale;
        createBranches(startX, branchStartHeight, branch.angle, branchLength, 10 * scale, 5, 1, branch.random);
    });
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCompleteTree() {
    clearCanvas();
    branches.forEach(branch => {
        branch.draw(1);
    });
}

function animate() {
    clearCanvas();
    currentFrame++;
    const overallProgress = currentFrame / totalFrames;
    
    branches.forEach((branch, index) => {
        const distanceFromGround = Math.abs(branch.y1 - (canvas.height - 50));
        const maxDistance = canvas.height;
        const normalizedDistance = distanceFromGround / maxDistance;
        
        const branchStartTime = normalizedDistance * 0.7;
        const branchProgress = Math.max(0, (overallProgress - branchStartTime) / 0.3);
        
        if (branchProgress > 0) {
            branch.draw(Math.min(branchProgress, 1));
        }
    });
    
    if (currentFrame < totalFrames) {
        requestAnimationFrame(animate);
    } else {
        isAnimating = false;
        toggleTreeGlow(true);
    }
}

function startAnimation() {
    if (isAnimating) return;
    toggleTreeGlow(false);
    
    if (!treeGenerated) {
        generateTree();
        treeGenerated = true;
    }
    
    currentFrame = 0;
    isAnimating = true;
    animate();
}

function toggleTreeGlow(isGlowing) {
    if (isGlowing) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = glowColor;
        canvas.classList.add('glow-active');
    } else {
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        canvas.classList.remove('glow-active');
    }

    if (treeGenerated && !isAnimating) {
        drawCompleteTree(); 
    }
}

updateColorScheme();
resizeCanvas();

window.addEventListener('resize', resizeCanvas);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateColorScheme);

canvas.addEventListener('click', () => {
    if (!isAnimating) {
        treeGenerated = false; 
        startAnimation();
    }
});

window.addEventListener('load', () => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if(darkModeIcon) darkModeIcon.classList.add('bx-sun');
    }


    syncColorsWithTheme();
    
    startAnimation(); 

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

// DARK MODE TOGGLE LOGIC
const darkModeIcon = document.querySelector('#darkMode-icon');

if (darkModeIcon) {
    darkModeIcon.onclick = () => {
        darkModeIcon.classList.toggle('bx-sun');
        document.body.classList.toggle('light-mode');
        
    y
        syncColorsWithTheme();
        
     
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };
}