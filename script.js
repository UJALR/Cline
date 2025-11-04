// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// Initialize EmailJS
emailjs.init("p6ACAllQxILtgfEDE");

// EmailJS form submission handler
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Get form data
    const formData = {
        from_name: document.getElementById('name').value,
        from_email: document.getElementById('email').value,
        reply_to: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        to_name: 'Ujjawal Rai'
    };
    
    // Send email using EmailJS
    emailjs.send('service_vesg98h', 'template_i4slxu3', formData)
        .then(function(response) {
            showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            document.getElementById('contactForm').reset();
        }, function(error) {
            showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
        })
        .finally(function() {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
});

// Notification function
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.style.transform = 'translateX(0)', 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 5000);
}

// Mobile menu toggle
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Dark mode toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);

// Set initial icon
if (savedTheme === 'dark') {
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
} else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Update theme
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon with animation
    themeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeToggle.style.transform = 'rotate(0deg)';
    }, 150);
});

// Resume download functionality
document.getElementById('downloadResume').addEventListener('click', function(e) {
    e.preventDefault();
    // Create a simple resume content (you can replace this with actual resume file)
    const resumeContent = `
        Ujjawal Rai - Full Stack Developer & UI/UX Designer
        
        EXPERIENCE:
        Full Stack Developer | 2020-Present
        - Developed responsive web applications serving 10,000+ users
        - Built scalable e-commerce platforms with modern technologies
        - Created intuitive user interfaces that increased user engagement by 40%
        - Implemented efficient database solutions and API integrations
        
        SKILLS:
        Frontend: HTML5, CSS3, JavaScript, React, Vue.js, TypeScript
        Backend: Node.js, Python, Express, Django, PostgreSQL, MongoDB
        Design: UI/UX Design, Figma, Adobe Creative Suite
        Cloud & Tools: AWS, Git, Docker, Linux
        
        EDUCATION:
        Bachelor of Computer Science
        
        CERTIFICATIONS:
        - AWS Solutions Architect Professional
        - Google Cloud Professional Developer
        - Meta React Developer Certification
        - CompTIA Security+
        
        CONTACT:
        Email: ujjawalhxh0@gmail.com
        Portfolio: Your Portfolio Website
        
        Passionate about creating beautiful, functional, and user-centered 
        digital experiences that bring ideas to life.
    `;
    
    const blob = new Blob([resumeContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Ujjawal_Rai_Resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
});

// Add typing animation to hero title
const heroTitle = document.querySelector('.hero-content h1');
const titleText = heroTitle.textContent;
heroTitle.textContent = '';