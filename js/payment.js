import { auth, db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { showNotification } from './main.js';

async function initPayment() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type'); // 'service' or 'plan'
    const id = urlParams.get('id');

    if (!type || !id) {
        window.location.href = 'index.html';
        return;
    }

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = `register.html?redirect=payment&type=${type}&id=${id}`;
            return;
        }

        await loadItemDetails(type, id);
    });
}

async function loadItemDetails(type, id) {
    const summaryContainer = document.getElementById('paymentSummary');
    const collectionName = type === 'plan' ? 'membershipPlans' : 'services';

    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            renderSummary(data, type);
        } else {
            showNotification('Item not found', 'error');
            setTimeout(() => window.location.href = 'index.html', 2000);
        }
    } catch (error) {
        console.error('Error loading payment details:', error);
        showNotification('Error loading details', 'error');
    }
}

function renderSummary(data, type) {
    const summaryContainer = document.getElementById('paymentSummary');
    const price = data.price;
    const name = data.name;

    summaryContainer.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0;">${name}</h3>
                <span class="badge badge-success">${type.toUpperCase()}</span>
            </div>
            <p style="color: var(--gray);">${data.description || ''}</p>
            <hr style="margin: 1.5rem 0; opacity: 0.1;">
            <div style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 700;">
                <span>Total Amount:</span>
                <span style="color: var(--primary-blue);">₹${price}</span>
            </div>
        </div>
    `;

    const payBtn = document.getElementById('payBtn');
    payBtn.addEventListener('click', () => simulatePayment(name, price));
}

function simulatePayment(name, price) {
    const payBtn = document.getElementById('payBtn');
    payBtn.disabled = true;
    payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Secure Payment...';

    // In a real app, this is where you'd call Razorpay.open()
    setTimeout(() => {
        showNotification('Payment Successful! Welcome to Surya Motors.', 'success');
        setTimeout(() => {
            window.location.href = 'index.html'; // Or dashboard
        }, 2000);
    }, 2000);
}

document.addEventListener('DOMContentLoaded', initPayment);
