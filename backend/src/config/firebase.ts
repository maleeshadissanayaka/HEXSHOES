import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { env } from "./env.js";

interface FirebaseServerConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

const requireFirebaseConfig = (): FirebaseServerConfig => {
  const { projectId, clientEmail, privateKey } = env.firebase;
  const missing = [
    ["FIREBASE_PROJECT_ID", projectId],
    ["FIREBASE_CLIENT_EMAIL", clientEmail],
    ["FIREBASE_PRIVATE_KEY", privateKey],
  ].filter(([, value]) => value === undefined || value.trim() === "").map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Firebase Admin requires server configuration: ${missing.join(", ")}`);
  }

  return {
    projectId: projectId as string,
    clientEmail: clientEmail as string,
    privateKey: (privateKey as string).replace(/\\n/g, "\n"),
  };
};

let firestore: Firestore | undefined;
let firebaseApp: App | undefined;
let firebaseAuth: Auth | undefined;

export const getFirebaseAdminApp = (): App => {
  if (firebaseApp !== undefined) return firebaseApp;
  const config = requireFirebaseConfig();
  firebaseApp = getApps().length > 0
    ? getApp()
    : initializeApp({ credential: cert(config), projectId: config.projectId });
  return firebaseApp;
};

export const getFirebaseAuth = (): Auth => {
  if (firebaseAuth !== undefined) return firebaseAuth;
  firebaseAuth = getAuth(getFirebaseAdminApp());
  return firebaseAuth;
};

export const getFirestoreDatabase = (): Firestore => {
  if (firestore !== undefined) return firestore;
  firestore = getFirestore(getFirebaseAdminApp());
  return firestore;
};
