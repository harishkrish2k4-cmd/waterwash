// Authentication Logic

import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
    validateEmail,
    validatePhone,
    validatePassword,
    showLoading,
    hideLoading,
    showError,
    hideError,
    showNotification
} from './main.js';

// Register new user
export async function registerUser(fullName, email, phone, password) {
    try {
        // Validate inputs
        if (!fullName || fullName.trim().length < 2) {
            throw new Error('Please enter a valid full name');
        }

        if (!validateEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        if (!validatePhone(phone)) {
            throw new Error('Please enter a valid phone number');
        }

        if (!validatePassword(password)) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            fullName: fullName.trim(),
            email: email.toLowerCase(),
            phone: phone.trim(),
            createdAt: serverTimestamp(),
            membershipPlan: null,
            membershipStartDate: null,
            membershipStatus: 'inactive',
            accountStatus: 'active'
        });

        return { success: true, user };
    } catch (error) {
        console.error('Registration error:', error);

        // Handle specific Firebase errors
        let errorMessage = error.message;

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered. Please login instead.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address format.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak. Please use a stronger password.';
        }

        return { success: false, error: errorMessage };
    }
}

// Login user
export async function loginUser(email, password) {
    try {
        if (!validateEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        if (!password) {
            throw new Error('Please enter your password');
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
            throw new Error('User data not found');
        }

        const userData = userDoc.data();

        // Check if account is active
        if (userData.accountStatus === 'inactive') {
            await signOut(auth);
            throw new Error('Your account has been deactivated. Please contact support.');
        }

        return { success: true, user, userData };
    } catch (error) {
        console.error('Login error:', error);

        let errorMessage = error.message;

        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email. Please register first.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        }

        return { success: false, error: errorMessage };
    }
}

// Logout user
export async function logoutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

// Check authentication state
export function checkAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}

// Get current user data
export async function getCurrentUserData() {
    const user = auth.currentUser;

    if (!user) {
        return null;
    }

    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
            return { uid: user.uid, ...userDoc.data() };
        }

        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Protect page - redirect if not authenticated
export function protectPage(redirectUrl = 'login.html') {
    checkAuthState((user) => {
        if (!user) {
            window.location.href = redirectUrl;
        }
    });
}
