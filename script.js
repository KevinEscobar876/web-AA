// ── CUSTOM CURSOR ──

const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0,
    mouseY = 0,
    curX = 0,
    curY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

function animateCursor() {
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    cursor.style.left = curX + 'px';
    cursor.style.top = curY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .card, .drop').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%,-50%) scale(2)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
});

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            // animate progress bars
            e.target.querySelectorAll('.progress-fill').forEach(bar => {
                bar.style.width = bar.dataset.width + '%';
            });
        }
    });
}, {
    threshold: 0.15
});

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── WATER COUNTER ──
let startTime = Date.now();
// ~57,000 liters/second consumed globally by AI (estimated)
const RATE = 57000;

function updateCounter() {
    const elapsed = (Date.now() - startTime) / 1000;
    const liters = Math.floor(elapsed * RATE);
    document.getElementById('waterCount').textContent = liters.toLocaleString('es-ES');
    requestAnimationFrame(updateCounter);
}
updateCounter();

// ── PARALLAX DROPS ──
document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    document.querySelectorAll('.drop').forEach((drop, i) => {
        const factor = (i + 1) * 4;
        drop.style.marginLeft = (dx * factor) + 'px';
        drop.style.marginTop = (dy * factor) + 'px';
    });
});

// ── NAV SCROLL EFFECT ──
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 80) {
        nav.style.background = 'rgba(3,11,20,0.97)';
    } else {
        nav.style.background = 'linear-gradient(to bottom, rgba(3,11,20,0.95), transparent)';
    }
});

// ── DROP CLICK RIPPLE ──
document.querySelectorAll('.drop').forEach(drop => {
    drop.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      width:10px; height:10px; background:rgba(34,211,238,0.4);
      transform:translate(-50%,-50%) scale(0);
      animation: rippleOut 0.6s ease forwards;
      left:50%; top:50%;
    `;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

const style = document.createElement('style');
style.textContent = `@keyframes rippleOut { to { transform: translate(-50%,-50%) scale(15); opacity:0; } }`;
document.head.appendChild(style);
