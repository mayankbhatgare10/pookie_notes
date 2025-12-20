/**
 * Convert Firebase error codes to user-friendly messages
 */
export function getFirebaseErrorMessage(error: any): string {
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';

    // Firebase Auth errors
    const authErrors: Record<string, string> = {
        'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
        'auth/cancelled-popup-request': 'Sign-in cancelled. Please try again.',
        'auth/popup-blocked': 'Pop-up blocked by browser. Please allow pop-ups and try again.',
        'auth/email-already-in-use': 'This email is already registered. Try logging in instead.',
        'auth/invalid-email': 'Invalid email address. Please check and try again.',
        'auth/user-disabled': 'This account has been disabled. Contact support.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Check your connection and try again.',
        'auth/requires-recent-login': 'Please log out and log in again to continue.',
        'auth/invalid-credential': 'Invalid credentials. Please check and try again.',
        'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
    };

    // Firestore errors
    const firestoreErrors: Record<string, string> = {
        'permission-denied': 'Permission denied. You don\'t have access to this resource.',
        'not-found': 'Resource not found.',
        'already-exists': 'This resource already exists.',
        'failed-precondition': 'Operation failed. Please try again.',
        'unavailable': 'Service temporarily unavailable. Please try again.',
    };

    // Check for Firebase Auth errors
    if (errorCode.startsWith('auth/')) {
        return authErrors[errorCode] || 'Authentication error. Please try again.';
    }

    // Check for Firestore errors
    if (firestoreErrors[errorCode]) {
        return firestoreErrors[errorCode];
    }

    // Generic error message
    if (errorMessage) {
        // Remove "Firebase: " prefix if present
        return errorMessage.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/.*\)\.?$/i, '');
    }

    return 'Something went wrong. Please try again.';
}
