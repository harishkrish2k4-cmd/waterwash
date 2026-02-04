// Admin Dashboard Logic

import { db } from './firebase-config.js';
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { showNotification } from './main.js';

// Get all users
export async function getAllUsers() {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, users };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { success: false, error: error.message };
    }
}

// Get user statistics
export async function getUserStatistics() {
    try {
        const result = await getAllUsers();

        if (!result.success) {
            throw new Error(result.error);
        }

        const users = result.users;

        const stats = {
            totalUsers: users.length,
            activeMembers: users.filter(u => u.membershipStatus === 'active').length,
            inactiveMembers: users.filter(u => u.membershipStatus === 'inactive').length,
            monthlyMembers: users.filter(u => u.membershipPlan === 'monthly').length,
            halfYearlyMembers: users.filter(u => u.membershipPlan === 'halfYearly').length,
            yearlyMembers: users.filter(u => u.membershipPlan === 'yearly').length,
            activeAccounts: users.filter(u => u.accountStatus === 'active').length,
            inactiveAccounts: users.filter(u => u.accountStatus === 'inactive').length
        };

        return { success: true, stats };
    } catch (error) {
        console.error('Error calculating statistics:', error);
        return { success: false, error: error.message };
    }
}

// Update user membership
export async function updateUserMembership(userId, membershipPlan) {
    try {
        await updateDoc(doc(db, 'users', userId), {
            membershipPlan: membershipPlan,
            membershipStatus: membershipPlan ? 'active' : 'inactive'
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating membership:', error);
        return { success: false, error: error.message };
    }
}

// Update user account status
export async function updateUserAccountStatus(userId, status) {
    try {
        await updateDoc(doc(db, 'users', userId), {
            accountStatus: status
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating account status:', error);
        return { success: false, error: error.message };
    }
}

// Search users
export function searchUsers(users, searchTerm) {
    if (!searchTerm) return users;

    const term = searchTerm.toLowerCase();

    return users.filter(user =>
        user.fullName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.includes(term) ||
        user.membershipPlan?.toLowerCase().includes(term)
    );
}

// Filter users by membership status
export function filterUsersByMembership(users, membershipFilter) {
    if (!membershipFilter || membershipFilter === 'all') return users;

    return users.filter(user => user.membershipPlan === membershipFilter);
}

// Filter users by account status
export function filterUsersByAccountStatus(users, statusFilter) {
    if (!statusFilter || statusFilter === 'all') return users;

    return users.filter(user => user.accountStatus === statusFilter);
}

// Export users to CSV
export function exportUsersToCSV(users) {
    try {
        // CSV headers
        const headers = ['Full Name', 'Email', 'Phone', 'Membership Plan', 'Membership Status', 'Account Status', 'Created At'];

        // CSV rows
        const rows = users.map(user => [
            user.fullName || '',
            user.email || '',
            user.phone || '',
            user.membershipPlan || 'None',
            user.membershipStatus || 'inactive',
            user.accountStatus || 'active',
            user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : ''
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('Users exported successfully!', 'success');
        return { success: true };
    } catch (error) {
        console.error('Error exporting users:', error);
        showNotification('Failed to export users', 'error');
        return { success: false, error: error.message };
    }
}

// --- Service Management ---

export async function getServices() {
    try {
        const servicesRef = collection(db, 'services');
        const q = query(servicesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const services = [];
        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, services };
    } catch (error) {
        console.error('Error fetching services:', error);
        return { success: false, error: error.message };
    }
}

export async function saveService(serviceData, serviceId = null) {
    try {
        const id = serviceId || serviceData.name.toLowerCase().replace(/\s+/g, '-');
        const serviceRef = doc(db, 'services', id);

        const payload = {
            ...serviceData,
            updatedAt: serverTimestamp()
        };

        // Only set createdAt for new documents
        if (!serviceId) {
            payload.createdAt = serverTimestamp();
        }

        await setDoc(serviceRef, payload, { merge: true });

        return { success: true, id };
    } catch (error) {
        console.error('Error saving service:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteService(serviceId) {
    try {
        await deleteDoc(doc(db, 'services', serviceId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting service:', error);
        return { success: false, error: error.message };
    }
}

// --- Membership Plan Management ---

export async function getMembershipPlans() {
    try {
        const plansRef = collection(db, 'membershipPlans');
        const q = query(plansRef, orderBy('price', 'asc'));
        const querySnapshot = await getDocs(q);

        const plans = [];
        querySnapshot.forEach((doc) => {
            plans.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, plans };
    } catch (error) {
        console.error('Error fetching membership plans:', error);
        return { success: false, error: error.message };
    }
}

export async function saveMembershipPlan(planData, planId = null) {
    try {
        const id = planId || planData.name.toLowerCase().replace(/\s+/g, '-');
        const planRef = doc(db, 'membershipPlans', id);

        const payload = {
            ...planData,
            updatedAt: serverTimestamp()
        };

        // Only set createdAt for new documents
        if (!planId) {
            payload.createdAt = serverTimestamp();
        }

        await setDoc(planRef, payload, { merge: true });

        return { success: true, id };
    } catch (error) {
        console.error('Error saving membership plan:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteMembershipPlan(planId) {
    try {
        await deleteDoc(doc(db, 'membershipPlans', planId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting membership plan:', error);
        return { success: false, error: error.message };
    }
}

// Format date
export function formatDate(timestamp) {
    if (!timestamp) return 'N/A';

    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format membership plan name
export function formatMembershipPlan(plan) {
    if (!plan) return 'None';

    const plans = {
        monthly: 'Monthly',
        halfYearly: 'Half-Yearly',
        yearly: 'Yearly'
    };

    return plans[plan] || plan;
}
