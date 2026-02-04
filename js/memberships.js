// Membership Management

import { auth, db } from './firebase-config.js';
import { collection, doc, getDocs, updateDoc, serverTimestamp, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { checkAuthState } from './auth.js';
import { showNotification, showLoading, hideLoading } from './main.js';

// Membership plans data (will be populated from Firestore)
export let membershipPlans = {};

// Fetch membership plans from Firestore
export async function fetchMembershipPlans() {
    console.log('fetchMembershipPlans: Starting...');
    try {
        const plansRef = collection(db, 'membershipPlans');

        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Membership Fetch Timeout (10s)')), 10000)
        );

        const fetchPromise = getDocs(plansRef);
        console.log('fetchMembershipPlans: Waiting for getDocs...');

        const querySnapshot = await Promise.race([fetchPromise, timeout]);
        console.log('fetchMembershipPlans: Success, size:', querySnapshot.size);

        const plans = {};
        querySnapshot.forEach((doc) => {
            plans[doc.id] = doc.data();
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

// Subscribe to membership
export async function subscribeMembership(planType) {
    const user = auth.currentUser;

    if (!user) {
        showNotification('Please login to subscribe', 'error');
        return { success: false, error: 'Not authenticated' };
    }

    try {
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

// Render membership plans dynamically
function renderMembershipPlans() {
    const container = document.getElementById('membershipPlansContainer');
    if (!container) return;

    if (Object.keys(membershipPlans).length === 0) {
        container.innerHTML = '<p class="text-center">No membership plans found.</p>';
        return;
    }

    // Convert to array and sort by price
    const plansArray = Object.entries(membershipPlans).map(([id, data]) => ({ id, ...data }));
    plansArray.sort((a, b) => (a.price || 0) - (b.price || 0));

    container.innerHTML = plansArray.map(plan => `
        <div class="membership-card ${plan.recommended ? 'recommended' : ''}">
            <div class="membership-header">
                <div class="card-icon" style="margin: 0 auto;">
                    <i class="${plan.icon || 'fas fa-star'}"></i>
                </div>
                <h3 class="membership-title">${plan.name}</h3>
                <div class="membership-price">₹${plan.price || 'N/A'}</div>
                <div class="membership-period">${plan.period || ''}</div>
                ${plan.recommended ? `
                    <p style="color: #10b981; font-weight: 600; font-size: 0.875rem; margin-top: 0.5rem;">
                        Recommended!
                    </p>
                ` : ''}
            </div>

            <ul class="membership-features">
                ${(plan.features || []).map(feature => `<li>${feature}</li>`).join('')}
            </ul>

            <button class="btn btn-primary subscribe-btn" data-plan="${plan.id}" style="width: 100%;">
                <i class="fas fa-check-circle"></i> Subscribe Now
            </button>
        </div>
    `).join('');

    attachSubscribeListeners();
}

function attachSubscribeListeners() {
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');
    subscribeButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const planType = button.dataset.plan;

            showLoading(button);
            const result = await subscribeMembership(planType);
            hideLoading(button);

            if (result.success) {
                showNotification('Successfully subscribed!', 'success');
                button.textContent = 'Subscribed ✓';
                button.disabled = true;
                button.style.background = '#10b981';
            } else {
                showNotification(result.error || 'Subscription failed', 'error');
            }
        });
    });
}

function updateSubscribeButtons(user) {
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');
    if (!user) {
        subscribeButtons.forEach(button => {
            button.innerHTML = '<i class="fas fa-user-plus"></i> Register to Subscribe';
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
