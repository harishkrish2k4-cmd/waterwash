// Admin Authentication

import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { validateEmail, showNotification } from './main.js';

// Check if user is admin
export async function checkAdminStatus(userId) {
    try {
        const adminDoc = await getDoc(doc(db, 'admins', userId));
        return adminDoc.exists();
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Admin login
export async function adminLogin(email, password) {
    try {
        if (!validateEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        if (!password) {
            throw new Error('Please enter your password');
        }

        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if user is admin
        const isAdmin = await checkAdminStatus(user.uid);

        if (!isAdmin) {
            await signOut(auth);
            throw new Error('Access denied. Admin privileges required.');
        }

        // Get admin data
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        const adminData = adminDoc.data();

        return { success: true, user, adminData };
    } catch (error) {
        console.error('Admin login error:', error);

        let errorMessage = error.message;

        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        }

        return { success: false, error: errorMessage };
    }
}

// Admin logout
export async function adminLogout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Admin logout error:', error);
        return { success: false, error: error.message };
    }
}

// Protect admin page
export function protectAdminPage(redirectUrl = '../admin/login.html') {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = redirectUrl;
            return;
        }

        const isAdmin = await checkAdminStatus(user.uid);

        if (!isAdmin) {
            showNotification('Access denied. Admin privileges required.', 'error');
            await signOut(auth);
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
        }
    });
}

// Check admin auth state
export function checkAdminAuthState(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            const isAdmin = await checkAdminStatus(user.uid);
            callback(user, isAdmin);
        } else {
            callback(null, false);
        }
    });
}
