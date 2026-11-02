export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getFirebaseAuthMessage(error) {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'The email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account already exists for this email.';
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 6 characters.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
