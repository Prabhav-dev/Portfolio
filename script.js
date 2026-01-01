let typedInstance = null;

function initEarth() {
    const container = document.getElementById('earth-container');
    if (!container) return;
    container.innerHTML = '';
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 6;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    const size = container.clientWidth > 0 ? container.clientWidth : 450;
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
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
}

window.addEventListener('load', () => {
    initEarth();

    
    setTimeout(() => {
        const typedElement = document.querySelector('.multiple-text');
        if (typedElement && !typedInstance) {
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

    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({ distance: '80px', duration: 2000, delay: 200, reset: false });
        sr.reveal('.home-content, .heading', { origin: 'top' });
        sr.reveal('.home-img, .spec-box, .contact-box', { origin: 'bottom' });
        sr.reveal('.about-content', { origin: 'left' });
        sr.reveal('.globe-area', { origin: 'right' });
    }
});

const header = document.querySelector('.header');
const darkModeIcon = document.querySelector('#darkMode-icon');
window.onscroll = () => { if (header) header.classList.toggle('sticky', window.scrollY > 100); };
if (darkModeIcon) {
    darkModeIcon.onclick = () => {
        darkModeIcon.classList.toggle('bx-sun');
        document.body.classList.toggle('light-mode');
    };
}