/* ==========================================
   GLOBAL VARIABLES & INSTANCES
   ========================================== */
let typedInstance = null;

/* ==========================================
   3D GLOBE INITIALIZATION (THREE.JS)
   ========================================== */
function initEarth() {
    const container = document.getElementById('earth-container');
    if (!container) return;
    container.innerHTML = '';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 6;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    
    function updateSize() {
        const size = container.clientWidth > 0 ? container.clientWidth : 450;
        renderer.setSize(size, size);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
    }
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateSize();
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(2, 30, 30);
    const material = new THREE.MeshBasicMaterial({ color: 0x754ef9, wireframe: true, transparent: true, opacity: 0.3 });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    const pointsGeometry = new THREE.SphereGeometry(2.01, 35, 35);
    const pointsMaterial = new THREE.PointsMaterial({ color: 0x754ef9, size: 0.05 });
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);

    function animate() {
        requestAnimationFrame(animate);
        globe.rotation.y += 0.002;
        points.rotation.y += 0.002;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', updateSize);
}

/* ==========================================
   THEME INITIALIZATION & STATE PERSISTENCE
   ========================================== */
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

/* ==========================================
   DOM LOAD EVENTS & UI LIBRARIES
   ========================================== */
window.addEventListener('load', () => {
    // Render 3D Earth
    initEarth();

    // Typed.js Animation Setup
    setTimeout(() => {
        const typedElement = document.querySelector('.multiple-text');
        if (typedElement && !typedInstance && typeof Typed !== 'undefined') {
            typedInstance = new Typed('.multiple-text', {
                strings: ['Full Stack Developer', 'Spring Boot Engineer', 'Computer Scientist'],
                typeSpeed: 70,
                backSpeed: 50,
                backDelay: 1500,
                loop: true,
                cursorChar: '|'
            });
        }
    }, 300);

    // ScrollReveal Animation Setup
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({ distance: '80px', duration: 2000, delay: 200, reset: false });
        sr.reveal('.home-content, .heading', { origin: 'top' });
        sr.reveal('.home-img, .spec-box, .contact-box', { origin: 'bottom' });
        sr.reveal('.about-content', { origin: 'left' });
        sr.reveal('.globe-area', { origin: 'right' });
    }
});

/* ==========================================
   STICKY HEADER
   ========================================== */
const header = document.querySelector('.header');

window.onscroll = () => { 
    if (header) header.classList.toggle('sticky', window.scrollY > 100); 
};

/* ==========================================
   SERVERLESS CONTACT FORM
   ========================================== */
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);
        formData.append("access_key", "055f66d0-9d8c-4342-8a26-3a3f8cab1cc9");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert("Message sent successfully!");
                contactForm.reset();
            } else {
                alert(data.message || "Something went wrong. Please try again.");
            }
        } catch (error) {
            alert("Network error. Could not reach serverless endpoint.");
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}