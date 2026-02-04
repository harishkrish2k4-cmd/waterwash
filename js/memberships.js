// Membership Management

import { auth, db } from './firebase-config.js';
import { collection, doc, getDocs, updateDoc, serverTimestamp, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { checkAuthState } from './auth.js';
import { showNotification, showLoading, hideLoading } from './main.js';

// Membership plans data (will be populated from Firestore)
export let membershipPlans = {};
let currentSelectedPlanId = null;

// Fetch membership plans from Firestore
export async function fetchMembershipPlans() {
    console.log('fetchMembershipPlans: Starting...');
    try {
        const plansRef = collection(db, 'membershipPlans');

        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Membership Fetch Timeout (10s)')), 10000)
        );

        const fetchPromise = getDocs(plansRef);

        const querySnapshot = await Promise.race([fetchPromise, timeout]);

        const plans = {};
        querySnapshot.forEach((doc) => {
            plans[doc.id] = { id: doc.id, ...doc.data() };
        });

        membershipPlans = plans;
        return { success: true, plans };
    } catch (error) {
        console.error('fetchMembershipPlans: FAILED', error);

        const container = document.getElementById('membershipPlansContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1; padding: 2rem; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <h3 style="color: #ef4444;">Error Loading Plans</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-secondary mt-2">Retry</button>
                </div>
            `;
        }
        return { success: false, error: error.message };
    }
}

// Subscribe to membership (called after payment)
export async function activateSubscription(planId) {
    const user = auth.currentUser;

    if (!user) {
        showNotification('Please login to subscribe', 'error');
        return { success: false, error: 'Not authenticated' };
    }

    try {
        await updateDoc(doc(db, 'users', user.uid), {
            membershipPlan: planId,
            membershipStartDate: serverTimestamp(),
            membershipStatus: 'active'
        });
        return { success: true };
    } catch (error) {
        console.error('Subscription update error:', error);
        return { success: false, error: error.message };
    }
}

// Render membership plans dynamically
function renderMembershipPlans() {
    const container = document.getElementById('membershipPlansContainer');
    if (!container) return;

    if (Object.keys(membershipPlans).length === 0) {
        container.innerHTML = '<p class="text-center">No membership plans found.</p>';
        return;
    }

    // Convert to array and sort by price
    const plansArray = Object.values(membershipPlans);
    plansArray.sort((a, b) => (a.price || 0) - (b.price || 0));

    container.innerHTML = plansArray.map(plan => `
        <div class="membership-card ${plan.recommended ? 'recommended' : ''}">
            <div class="membership-header" style="text-align: center;">
                <div class="card-icon" style="margin: 0 auto; background: var(--light-blue); color: var(--primary-blue); border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                    <i class="${plan.icon || 'fas fa-star'}" style="font-size: 1.5rem;"></i>
                </div>
                <h3 class="membership-title">${plan.name}</h3>
                <div class="membership-price" style="font-size: 2.5rem; font-weight: 800; margin: 1rem 0;">₹${plan.price || 'N/A'}</div>
                <div class="membership-period" style="color: var(--gray); font-weight: 500;">${plan.period || ''}</div>
                ${plan.recommended ? `
                    <div style="background: #10b981; color: white; display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; margin-top: 0.5rem; text-transform: uppercase;">
                        Recommended
                    </div>
                ` : ''}
            </div>

            <ul class="membership-features" style="list-style: none; padding: 0; margin: 2rem 0;">
                ${(plan.features || []).map(feature => `
                    <li style="padding: 0.5rem 0; color: var(--dark-gray); display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-check-circle" style="color: #10b981;"></i> ${feature}
                    </li>
                `).join('')}
            </ul>

            <button class="btn btn-primary subscribe-btn" data-plan="${plan.id}" style="width: 100%; padding: 1rem; border-radius: 8px; font-weight: 600;">
                <i class="fas fa-check-circle"></i> Subscribe Now
            </button>
        </div>
    `).join('');

    attachSubscribeListeners();
}

// Payment Modal Logic
function openPaymentModal(planId) {
    const plan = membershipPlans[planId];
    if (!plan) return;

    currentSelectedPlanId = planId;

    document.getElementById('selectedPlanName').textContent = plan.name;
    document.getElementById('selectedPlanPrice').textContent = `₹${plan.price}`;

    // Reset modal state
    document.getElementById('paymentForm').style.display = 'block';
    document.getElementById('paymentProcessing').style.display = 'none';
    document.getElementById('paymentSuccess').style.display = 'none';
    document.getElementById('paymentForm').reset();

    const modal = document.getElementById('paymentModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        currentSelectedPlanId = null;
    }
}

function attachSubscribeListeners() {
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');
    subscribeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (!user) {
                showNotification('Please login to subscribe', 'error');
                setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                return;
            }
            const planId = button.dataset.plan;
            openPaymentModal(planId);
        });
    });

    // Modal Close
    const closeBtn = document.getElementById('closePaymentModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePaymentModal);
    }

    // Payment Form Submit
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Show processing
            paymentForm.style.display = 'none';
            document.getElementById('paymentProcessing').style.display = 'block';

            // Simulate payment processing (2 seconds)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulate verification (1 second)
            console.log('Verifying transaction...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update Firestore
            const result = await activateSubscription(currentSelectedPlanId);

            if (result.success) {
                document.getElementById('paymentProcessing').style.display = 'none';
                document.getElementById('paymentSuccess').style.display = 'block';
                showNotification('Subscription activated successfully!', 'success');
            } else {
                paymentForm.style.display = 'block';
                document.getElementById('paymentProcessing').style.display = 'none';
                showNotification('Payment verified but update failed: ' + result.error, 'error');
            }
        });
    }
}

function updateSubscribeButtons(user) {
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');
    if (!user) {
        subscribeButtons.forEach(button => {
            button.innerHTML = '<i class="fas fa-user-plus"></i> Login to Subscribe';
        });
    }
}

// Initialize membership page
export async function initMembershipsPage() {
    console.log('initMembershipsPage: START');
    const result = await fetchMembershipPlans();
    if (result.success) {
        renderMembershipPlans();
    }

    checkAuthState((user) => {
        updateSubscribeButtons(user);
    });
}
