import assert from "node:assert/strict";
import test from "node:test";
import type { User } from "firebase/auth";
import { accountViewState, providerLabel } from "../src/auth/accountState.ts";
import { friendlyAuthError, isPopupDismissal } from "../src/auth/authErrors.ts";
import { validateRegistration, validateSignIn } from "../src/auth/authValidation.ts";

const firebaseError = (code: string) => ({ code });
const user = (providerId: string): User => ({ providerData: [{ providerId }] } as User);

test("account view waits for auth restoration before showing signed-out UI", () => {
  assert.equal(accountViewState(true, null), "loading");
  assert.equal(accountViewState(false, null), "signed-out");
  assert.equal(accountViewState(false, user("password")), "signed-in");
});

test("provider labels describe email and Google sessions", () => {
  assert.equal(providerLabel(user("password")), "Email and password");
  assert.equal(providerLabel(user("google.com")), "Google");
});

test("auth validation checks email, password length, and confirmation", () => {
  assert.equal(validateSignIn("not-an-email", "123456").valid, false);
  assert.equal(validateSignIn("member@example.com", "12345").valid, false);
  assert.deepEqual(validateRegistration("member@example.com", "123456", "654321"), { valid: false, message: "Passwords must match." });
  assert.equal(validateRegistration("member@example.com", "123456", "123456").valid, true);
});

test("Firebase failures map to friendly messages without exposing codes", () => {
  assert.equal(friendlyAuthError(firebaseError("auth/invalid-credential")), "We couldn’t sign you in with those details.");
  assert.equal(friendlyAuthError(firebaseError("auth/email-already-in-use")), "An account already exists with this email.");
  assert.equal(friendlyAuthError(firebaseError("auth/weak-password")), "Use a stronger password.");
  assert.equal(isPopupDismissal(firebaseError("auth/popup-closed-by-user")), true);
});
