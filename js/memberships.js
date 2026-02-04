// Membership Management

import { auth, db } from './firebase-config.js';
import { collection, doc, getDocs, updateDoc, serverTimestamp, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { checkAuthState } from './auth.js';
import { showNotification, showLoading, hideLoading } from './main.js';

// Membership plans data (will be populated from Firestore)
export let membershipPlans = {};

// Fetch membership plans from Firestore
export async function fetchMembershipPlans() {
    try {
        const plansRef = collection(db, 'membershipPlans');
        const q = query(plansRef, orderBy('price', 'asc'));
        const querySnapshot = await getDocs(q);

        const plans = {};
        querySnapshot.forEach((doc) => {
            plans[doc.id] = doc.data();
        });

        membershipPlans = plans;
        return { success: true, plans };
    } catch (error) {
        console.error('Error fetching membership plans:', error);
        return { success: false, error: error.message };
    }
}

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
export async function initMembershipsPage() {
    // Fetch plans first
    await fetchMembershipPlans();

    // Render plans if container exists
    renderMembershipPlans();

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

// Render membership plans dynamically
function renderMembershipPlans() {
    const container = document.getElementById('membershipPlansContainer');
    if (!container) return;

    if (Object.keys(membershipPlans).length === 0) {
        container.innerHTML = '<p class="text-center">No membership plans available.</p>';
        return;
    }

    container.innerHTML = Object.entries(membershipPlans).map(([id, plan]) => `
        <div class="membership-card ${plan.recommended ? 'recommended' : ''}">
            <div class="membership-header">
                <div class="card-icon" style="margin: 0 auto;">
                    <i class="${plan.icon || 'fas fa-star'}"></i>
                </div>
                <h3 class="membership-title">${plan.name}</h3>
                <div class="membership-price">₹${plan.price}</div>
                <div class="membership-period">${plan.period}</div>
                ${plan.recommended ? `
                    <p style="color: var(--success); font-weight: 600; font-size: 0.875rem; margin-top: 0.5rem;">
                        Recommended!
                    </p>
                ` : ''}
            </div>

            <ul class="membership-features">
                ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>

            <button class="btn btn-primary subscribe-btn" data-plan="${id}" style="width: 100%;">
                <i class="fas fa-check-circle"></i> Subscribe Now
            </button>
        </div>
    `).join('');

    // Re-attach event listeners after rendering
    attachSubscribeListeners();
}

function attachSubscribeListeners() {
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');
    const user = auth.currentUser;

    subscribeButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const planType = button.dataset.plan;

            if (!user) {
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
