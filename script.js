// ── Navigation ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const navbar = document.getElementById('navbar');
const allNavLinks = document.querySelectorAll('.nav-links a');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
});

allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// ── Navbar scroll effect ──
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Back to top button
    const btn = document.getElementById('back-to-top');
    btn.classList.toggle('visible', window.scrollY > 400);

    // Active nav link based on scroll position
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        if (window.scrollY >= top) current = section.getAttribute('id');
    });
    allNavLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
});

// ── Skill bar animation & stat counters on scroll ──
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-fill').forEach(bar => {
                bar.style.width = bar.dataset.width + '%';
            });
            entry.target.querySelectorAll('.stat-number').forEach(num => {
                const target = +num.dataset.target;
                let count = 0;
                const step = Math.ceil(target / 40);
                const timer = setInterval(() => {
                    count += step;
                    if (count >= target) { count = target; clearInterval(timer); }
                    num.textContent = count;
                }, 30);
            });
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.skills, .about').forEach(s => observer.observe(s));

// ── Fade-in animation ──
const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-card, .project-card, .contact-info, .contact-form').forEach(el => {
    el.classList.add('fade-in');
    fadeObserver.observe(el);
});

// ── Project filters ──
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.project-card').forEach(card => {
            card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
        });
    });
});

// ── Contact Form → Sends to server & stores in database ──
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const status = document.getElementById('form-status');
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !subject || !message) {
        status.textContent = 'Please fill in all fields.';
        status.className = 'form-status error';
        return;
    }

    status.textContent = 'Sending...';
    status.className = 'form-status';

    fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
    })
    .then(res => res.json())
    .then(data => {
        status.textContent = data.message;
        status.className = 'form-status ' + (data.success ? 'success' : 'error');
        if (data.success) this.reset();
    })
    .catch(() => {
        status.textContent = 'Could not reach the server. Make sure the server is running (npm start).';
        status.className = 'form-status error';
    });
});
