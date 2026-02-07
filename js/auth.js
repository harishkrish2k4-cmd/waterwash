// Authentication Logic

import { auth, db } from './firebase-config.js';
import {
    signOut,
    onAuthStateChanged,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
    validatePhone,
    showLoading,
    hideLoading,
    showError,
    hideError,
    showNotification
} from './main.js';

// Setup Recaptcha
export function setupRecaptcha(elementId) {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
                console.log("Recaptcha verified");
            },
            'expired-callback': () => {
                // Response expired. Ask user to solve reCAPTCHA again.
                console.log("Recaptcha expired");
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        });
    }
    return window.recaptchaVerifier;
}

// Initiate Phone Login (Send OTP)
export async function initiatePhoneLogin(phoneNumber) {
    try {
        if (!validatePhone(phoneNumber)) {
            throw new Error('Please enter a valid phone number');
        }

        // Ensure Recaptcha is set up
        const appVerifier = window.recaptchaVerifier;
        if (!appVerifier) {
            throw new Error('Recaptcha not initialized. Please refresh the page.');
        }

        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
        console.error('Phone Auth Error:', error);
        window.recaptchaVerifier?.render().then(widgetId => {
            grecaptcha.reset(widgetId);
        });
        return { success: false, error: error.message };
    }
}

// Verify OTP
export async function verifyOTP(otp) {
    try {
        if (!window.confirmationResult) {
            throw new Error('No OTP request found. Please try again.');
        }

        const result = await window.confirmationResult.confirm(otp);
        const user = result.user;

        // Check if user profile exists in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // New user - Create default profile
            await setDoc(userDocRef, {
                phone: user.phoneNumber,
                createdAt: serverTimestamp(),
                membershipPlan: null,
                membershipStatus: 'inactive',
                accountStatus: 'active',
                isProfileComplete: false
            });
            return { success: true, user, isNewUser: true };
        }

        return { success: true, user, isNewUser: false };
    } catch (error) {
        console.error('OTP Verification Error:', error);
        return { success: false, error: 'Invalid OTP. Please try again.' };
    }
}

// Update User Profile (for new users)
export async function updateUserProfile(uid, data) {
    try {
        await setDoc(doc(db, 'users', uid), {
            ...data,
            isProfileComplete: true
        }, { merge: true });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
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
