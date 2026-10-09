import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { createUserProfile, getUserProfile } from "./userService";

const makeError = (code) => Object.assign(new Error(code), { code });

export const registerUser = async ({ firstName, lastName, age, email, password }) => {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(cred.user, { displayName: `${firstName} ${lastName}` });
  await createUserProfile(cred.user.uid, {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    age: Number(age),
    email: email.trim(),
  });
  return cred.user;
};

export const loginUser = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await getUserProfile(cred.user.uid);
  // compte désactivé par l'admin → connexion refusée
  if (profile && profile.isActive === false) {
    await signOut(auth);
    throw makeError("app/user-deactivated");
  }
  return cred.user;
};

export const loginWithGoogle = async () => {
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  const profile = await getUserProfile(cred.user.uid);

  if (!profile) {
    const [firstName = "", ...rest] = (cred.user.displayName || "").split(" ");
    await createUserProfile(cred.user.uid, {
      firstName,
      lastName: rest.join(" "),
      email: cred.user.email,
      photoURL: cred.user.photoURL,
    });
  } else if (profile.isActive === false) {
    await signOut(auth);
    throw makeError("app/user-deactivated");
  }
  return cred.user;
};

export const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim());

export const logoutUser = () => signOut(auth);

export const getAuthErrorMessage = (code) => {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/weak-password":
      return "Password must contain at least 6 characters.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "app/user-deactivated":
      return "Your account has been deactivated. Contact an administrator.";
    default:
      return "Something went wrong. Please try again.";
  }
};