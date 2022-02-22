import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as _signOut,
} from 'firebase/auth';

import {app} from 'lib/firebase';

export const auth = getAuth(app);

export const signOut = () => _signOut(auth);

// Google Sign in
const googleProvider = new GoogleAuthProvider();

export async function signIn() {
  await signInWithPopup(auth, googleProvider);
}
