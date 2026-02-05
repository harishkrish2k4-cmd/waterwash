// Main JavaScript - General Utilities
import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

// Help debug global errors
window.onerror = function (msg, url, line, col, error) {
    console.error('GLOBAL ERROR:', msg, 'at', url, ':', line, error);
};

window.onunhandledrejection = function (event) {
    console.error('UNHANDLED PROMISE REJECTION:', event.reason);
};

document.head.appendChild(style);

// --- Service Rendering ---

export async function fetchServices() {
    console.log('fetchServices: Starting...');
    try {
        const servicesRef = collection(db, 'services');

        // Timeout
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firestore Fetch Timeout (10s)')), 10000)
        );

        const fetchPromise = getDocs(servicesRef);

        console.log('fetchServices: Waiting for getDocs...');
        const querySnapshot = await Promise.race([fetchPromise, timeout]);
        console.log('fetchServices: Success, items found:', querySnapshot.size);

        const services = [];
        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() });
        });

        // Sort manually
        services.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateA - dateB;
        });

        return { success: true, services };
    } catch (error) {
        console.error('fetchServices: FAILED', error);

        const container = document.getElementById('servicesContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1; padding: 2rem; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <h3 style="color: #ef4444;">Error Loading Services</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-secondary mt-2">Retry</button>
                </div>
            `;
        }
        return { success: false, error: error.message };
    }
}

export function renderServices(services) {
    const container = document.getElementById('servicesContainer');
    if (!container) return;

    if (services.length === 0) {
        container.innerHTML = '<p class="text-center" style="grid-column: 1 / -1; padding: 2rem;">No services available.</p>';
        return;
    }

    container.innerHTML = services.map(service => `
        <div class="card text-center" style="background: ${service.gradient || 'var(--primary-blue)'}; color: white; border: none;">
            <div class="card-icon" style="margin: 0 auto; background: rgba(255, 255, 255, 0.2); color: white;">
                <i class="${service.icon || 'fas fa-car'}"></i>
            </div>
            <h4 class="card-title" style="color: white; font-size: 1.5rem; margin-top: 1rem;">${service.name}</h4>
            <div style="font-size: 3rem; font-weight: 700; margin: 1rem 0;">
                ₹${service.price}
            </div>
            <p class="card-text" style="color: rgba(255, 255, 255, 0.9); font-size: 1rem;">${service.description}</p>
            <ul style="list-style: none; padding: 0; margin-top: 1.5rem; text-align: left; margin-bottom: 1.5rem;">
                ${(service.features || []).map(feature => `
                    <li style="padding: 0.5rem 0; color: rgba(255, 255, 255, 0.9);">
                        <i class="fas fa-check" style="color: #4ade80; margin-right: 0.5rem;"></i> ${feature}
                    </li>
                `).join('')}
            </ul>
            <a href="payment.html?type=service&id=${service.id}" class="btn btn-outline" style="width: 100%; background: rgba(255, 255, 255, 0.2); border-color: white;">
                Avail Service
            </a>
        </div>
    `).join('');
}

// Initialize home page services
async function initHomePage() {
    console.log('initHomePage: START');
    const container = document.getElementById('servicesContainer');
    if (container) {
        const result = await fetchServices();
        console.log('initHomePage: Result received', result.success);
        if (result.success) {
            renderServices(result.services);
        }
    }
}

// Call init on load
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initHomePage);
} else {
    initHomePage();
}
