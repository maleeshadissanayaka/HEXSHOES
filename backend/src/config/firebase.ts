import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
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
    throw new Error(`Firestore data source requires server configuration: ${missing.join(", ")}`);
  }

  return {
    projectId: projectId as string,
    clientEmail: clientEmail as string,
    privateKey: (privateKey as string).replace(/\\n/g, "\n"),
  };
};

let firestore: Firestore | undefined;

export const getFirestoreDatabase = (): Firestore => {
  if (firestore !== undefined) return firestore;

  const config = requireFirebaseConfig();
  const app: App = getApps().length > 0
    ? getApp()
    : initializeApp({ credential: cert(config), projectId: config.projectId });

  firestore = getFirestore(app);
  return firestore;
};
