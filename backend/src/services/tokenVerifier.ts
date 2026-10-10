import type { DecodedIdToken } from "firebase-admin/auth";
import { getFirebaseAuth } from "../config/firebase.js";

export const verifyFirebaseIdToken = (token: string): Promise<DecodedIdToken> =>
  getFirebaseAuth().verifyIdToken(token, true);
