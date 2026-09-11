/* ==========================================================================
   GLOBAL VARIABLES & INSTANCES
   ========================================================================== */
let typedInstance = null;
let heroAnimationId = null;
let earthAnimationId = null;

/* ==========================================================================
   1. HERO 3D INTERACTIVE NODE (THREE.JS)
   ========================================================================== */
function initHero3D() {
    const container = document.getElementById('hero-3d-node');
    if (!container) return;
    container.innerHTML = '';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    
    function updateSize() {
        const size = container.clientWidth > 0 ? container.clientWidth : 380;
        renderer.setSize(size, size);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateSize();
    container.appendChild(renderer.domElement);

    // Group to hold all 3D objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Outer wireframe Icosahedron (Storage Node Shell)
    const outerGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const outerMat = new THREE.MeshBasicMaterial({
        color: 0x754ef9,
        wireframe: true,
        transparent: true,
        opacity: 0.45
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    mainGroup.add(outerMesh);

    // Inner glowing Octahedron (Core Engine Kernel)
    const innerGeo = new THREE.OctahedronGeometry(0.9, 0);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.75
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // Orbiting particle ring / matrix
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const radius = 1.9 + Math.random() * 0.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI * 0.8;

        particlePos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
        particlePos[i * 3 + 1] = radius * Math.sin(phi);
        particlePos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
        color: 0xc084fc,
        size: 0.04,
        transparent: true,
        opacity: 0.8
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

    // Mouse / Touch Interactivity
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationX = 0;
    let targetRotationY = 0;

    const domElem = renderer.domElement;

    domElem.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) {
            // Subtle mouse parallax tilt
            const rect = container.getBoundingClientRect();
            const relX = (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
            const relY = (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
            targetRotationY = relX * 0.6;
            targetRotationX = relY * 0.6;
            return;
        }

        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        mainGroup.rotation.y += deltaX * 0.008;
        mainGroup.rotation.x += deltaY * 0.008;

        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    // Touch support for mobile
    domElem.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }, { passive: true });

    domElem.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        mainGroup.rotation.y += deltaX * 0.01;
        mainGroup.rotation.x += deltaY * 0.01;

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    domElem.addEventListener('touchend', () => { isDragging = false; });

    function animate() {
        heroAnimationId = requestAnimationFrame(animate);

        // Constant baseline rotation
        outerMesh.rotation.y += 0.003;
        outerMesh.rotation.x += 0.0015;
        
        innerMesh.rotation.y -= 0.005;
        innerMesh.rotation.z += 0.003;

        particles.rotation.y += 0.001;

        // Smoothly interpolate towards target mouse parallax
        if (!isDragging) {
            mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
            mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', updateSize);
}

/* ==========================================================================
   2. 3D GLOBE INITIALIZATION (THREE.JS)
   ========================================================================== */
function initEarth() {
    const container = document.getElementById('earth-container');
    if (!container) return;
    container.innerHTML = '';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 5.8;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    
    function updateSize() {
        const size = container.clientWidth > 0 ? container.clientWidth : 400;
        renderer.setSize(size, size);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
    }
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateSize();
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x754ef9, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.35 
    });
    const globe = new THREE.Mesh(geometry, material);
    globeGroup.add(globe);

    const pointsGeometry = new THREE.SphereGeometry(2.02, 38, 38);
    const pointsMaterial = new THREE.PointsMaterial({ 
        color: 0x00f0ff, 
        size: 0.045 
    });
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    globeGroup.add(points);

    function animate() {
        earthAnimationId = requestAnimationFrame(animate);
        globeGroup.rotation.y += 0.0025;
        globeGroup.rotation.x = 0.25;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', updateSize);
}

/* ==========================================================================
   3. ACCORDION (YOUTUBE AI SUMMARY STYLE)
   ========================================================================== */
function toggleAccordion(headerElement) {
    const card = headerElement.closest('[data-accordion]');
    if (!card) return;

    const isActive = card.classList.contains('active');
    
    // Toggle active state
    if (isActive) {
        card.classList.remove('active');
    } else {
        card.classList.add('active');
    }
}

/* ==========================================================================
   4. THEME INITIALIZATION & STATE PERSISTENCE
   ========================================================================== */
const darkModeIcon = document.querySelector('#darkMode-icon');

// Sync theme from localStorage on initial script execution
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    if (darkModeIcon) darkModeIcon.classList.replace('bx-moon', 'bx-sun');
}

if (darkModeIcon) {
    darkModeIcon.onclick = () => {
        darkModeIcon.classList.toggle('bx-sun');
        darkModeIcon.classList.toggle('bx-moon');
        document.body.classList.toggle('light-mode');
        
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };
}

/* ==========================================================================
   5. DOM LOAD EVENTS & UI LIBRARIES
   ========================================================================== */
window.addEventListener('load', () => {
    // Render 3D Visualizers
    initHero3D();
    initEarth();

    // Typed.js Animation Setup
    setTimeout(() => {
        const typedElement = document.querySelector('.multiple-text');
        if (typedElement && !typedInstance && typeof Typed !== 'undefined') {
            typedInstance = new Typed('.multiple-text', {
                strings: [
                    ' Storage Engines',
                    ' Low-Level Systems',
                    ' Rust Diff Internals',
                    ' Applied Cryptography',
                    ' AI Memory Layers'
                ],
                typeSpeed: 65,
                backSpeed: 40,
                backDelay: 1700,
                loop: true,
                cursorChar: '_'
            });
        }
    }, 200);

    // ScrollReveal Animation Setup
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({ 
            distance: '50px', 
            duration: 1200, 
            delay: 150, 
            reset: false 
        });
        sr.reveal('.home-content', { origin: 'left' });
        sr.reveal('.home-canvas-wrap', { origin: 'right' });
        sr.reveal('.heading', { origin: 'top' });
        sr.reveal('.about-container, .spec-box, .minor-card, .contact-box', { origin: 'bottom', interval: 100 });
    }
});

/* ==========================================================================
   6. STICKY HEADER
   ========================================================================== */
const header = document.querySelector('.header');

window.addEventListener('scroll', () => { 
    if (header) header.classList.toggle('sticky', window.scrollY > 80); 
});

/* ==========================================================================
   7. SERVERLESS CONTACT FORM
   ========================================================================== */
const contactForm = document.getElementById('contact-form');
const formFeedback = document.getElementById('form-feedback');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending... <i class="bx bx-loader-alt bx-spin"></i>';
        submitBtn.disabled = true;
        if (formFeedback) {
            formFeedback.className = 'form-feedback';
            formFeedback.style.display = 'none';
        }

        const formData = new FormData(contactForm);
        formData.append("access_key", "055f66d0-9d8c-4342-8a26-3a3f8cab1cc9");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                if (formFeedback) {
                    formFeedback.textContent = "Message sent successfully! I'll get back to you soon.";
                    formFeedback.className = 'form-feedback success';
                    formFeedback.style.display = 'block';
                }
                contactForm.reset();
            } else {
                if (formFeedback) {
                    formFeedback.textContent = data.message || "Could not deliver message. Please try again.";
                    formFeedback.className = 'form-feedback error';
                    formFeedback.style.display = 'block';
                }
            }
        } catch (error) {
            if (formFeedback) {
                formFeedback.textContent = "Network error. Please check your connection or reach out via LinkedIn/GitHub.";
                formFeedback.className = 'form-feedback error';
                formFeedback.style.display = 'block';
            }
        } finally {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    });
}