// Membership Management

import { auth, db } from './firebase-config.js';
import { doc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { checkAuthState } from './auth.js';
import { showNotification, showLoading, hideLoading } from './main.js';

// Membership plans data
export const membershipPlans = {
    monthly: {
        name: 'Monthly Membership',
        price: '$29',
        period: 'per month',
        features: [
            'Basic vehicle servicing',
            'Oil change included',
            'Emergency roadside assistance',
            'Priority booking',
            'Free vehicle wash',
            '10% discount on parts'
        ],
        recommended: false
    },
    halfYearly: {
        name: 'Half-Yearly Membership',
        price: '$149',
        period: 'per 6 months',
        features: [
            'All monthly benefits',
            'Free tire rotation',
            'Battery check & service',
            'AC system inspection',
            'Priority service',
            '15% discount on parts',
            'Free towing service'
        ],
        recommended: true
    },
    yearly: {
        name: 'Yearly Membership',
        price: '$269',
        period: 'per year',
        features: [
            'All half-yearly benefits',
            'Full vehicle maintenance',
            'Free comprehensive inspections',
            'Brake system service',
            'Premium 24/7 support',
            '20% discount on parts',
            'Free pickup & delivery',
            'Complimentary detailing'
        ],
        recommended: false
    }
};

// Subscribe to membership
export async function subscribeMembership(planType) {
    const user = auth.currentUser;

    if (!user) {
        showNotification('Please login to subscribe to a membership', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // Update user document with membership info
        await updateDoc(doc(db, 'users', user.uid), {
            membershipPlan: planType,
            membershipStartDate: serverTimestamp(),
            membershipStatus: 'active'
        });

        return { success: true };
    } catch (error) {
        console.error('Subscription error:', error);
        return { success: false, error: error.message };
    }
}

// Initialize membership page
export function initMembershipsPage() {
    // Check if user is logged in
    let currentUser = null;

    checkAuthState((user) => {
        currentUser = user;
        updateSubscribeButtons(user);
    });

    // Add event listeners to subscribe buttons
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');

    subscribeButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const planType = button.dataset.plan;

            if (!currentUser) {
                showNotification('Please login or register to subscribe', 'error');
                setTimeout(() => {
                    window.location.href = 'register.html';
                }, 1500);
                return;
            }

            showLoading(button);

            const result = await subscribeMembership(planType);

            hideLoading(button);

            if (result.success) {
                showNotification('Successfully subscribed to ' + membershipPlans[planType].name + '!', 'success');
                button.textContent = 'Subscribed ✓';
                button.disabled = true;
                button.style.background = '#10b981';
            } else {
                showNotification('Subscription failed. Please try again.', 'error');
            }
        });
    });
}

function updateSubscribeButtons(user) {
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');

    subscribeButtons.forEach(button => {
        if (!user) {
            button.innerHTML = '<i class="fas fa-user-plus"></i> Register to Subscribe';
        }
    });
}
