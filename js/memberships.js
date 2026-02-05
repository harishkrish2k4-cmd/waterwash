import { db } from './firebase-config.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export async function fetchMemberships() {
    console.log('fetchMemberships: Starting...');
    try {
        const plansRef = collection(db, 'membershipPlans');
        const querySnapshot = await getDocs(plansRef);

        const plans = [];
        querySnapshot.forEach((doc) => {
            plans.push({ id: doc.id, ...doc.data() });
        });

        // Sort manually if needed, or by price
        plans.sort((a, b) => a.price - b.price);

        return { success: true, plans };
    } catch (error) {
        console.error('fetchMemberships: FAILED', error);
        return { success: false, error: error.message };
    }
}

export function renderMemberships(plans) {
    const container = document.getElementById('membershipPlansContainer');
    if (!container) return;

    if (plans.length === 0) {
        container.innerHTML = '<p class="text-center" style="grid-column: 1 / -1; padding: 2rem;">No membership plans available.</p>';
        return;
    }

    container.innerHTML = plans.map(plan => `
        <div class="membership-card ${plan.recommended ? 'recommended' : ''}">
            <div class="membership-header">
                <div class="card-icon" style="margin: 0 auto; margin-bottom: 1rem;">
                    <i class="${plan.icon || 'fas fa-shield-alt'}"></i>
                </div>
                <h3 class="membership-title">${plan.name}</h3>
                <div class="membership-price">₹${plan.price}</div>
                <div class="membership-period">${plan.period || 'per month'}</div>
            </div>
            <ul class="membership-features">
                ${(plan.features || []).map(feature => `
                    <li>${feature}</li>
                `).join('')}
            </ul>
            <div class="text-center">
                <a href="register.html?plan=${plan.id}" class="btn ${plan.recommended ? 'btn-primary' : 'btn-secondary'} w-100">
                    Subscribe / Register
                </a>
            </div>
        </div>
    `).join('');
}

export async function initMembershipsPage() {
    const container = document.getElementById('membershipPlansContainer');
    if (container) {
        const result = await fetchMemberships();
        if (result.success) {
            renderMemberships(result.plans);
        } else {
            container.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1; padding: 2rem; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <h3 style="color: #ef4444;">Error Loading Plans</h3>
                    <p>${result.error}</p>
                    <button onclick="location.reload()" class="btn btn-secondary mt-2">Retry</button>
                </div>
            `;
        }
    }
}
