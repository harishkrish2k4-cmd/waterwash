// Main JavaScript - General Utilities

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip if it's just "#"
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const navMenu = document.querySelector('.navbar-menu');
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');

    navbarToggle?.addEventListener('click', () => {
        navbarMenu?.classList.toggle('active');
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with animation class
    const animatedElements = document.querySelectorAll('.card, .testimonial, .membership-card');
    animatedElements.forEach(el => observer.observe(el));
});

// Form validation utility
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]{10,}$/;
    return re.test(phone);
}

export function validatePassword(password) {
    return password.length >= 6;
}

// Show/hide loading state
export function showLoading(button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = 'Loading...';
}

export function hideLoading(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
}

// Show error message
export function showError(element, message) {
    const errorElement = element.nextElementSibling;
    if (errorElement && errorElement.classList.contains('form-error')) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    element.classList.add('error');
}

// Hide error message
export function hideError(element) {
    const errorElement = element.nextElementSibling;
    if (errorElement && errorElement.classList.contains('form-error')) {
        errorElement.classList.remove('show');
    }
    element.classList.remove('error');
}

// Display notification
export function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    animation: slideInRight 0.3s ease-out;
  `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to document
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
