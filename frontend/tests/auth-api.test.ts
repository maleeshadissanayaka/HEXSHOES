import assert from "node:assert/strict";
import test from "node:test";
import { failedBackendSession, loadingBackendSession, verifiedBackendSession } from "../src/auth/backendSession.ts";
import { authenticatedGet, type AuthenticatedGet } from "../src/services/api/authenticatedRequest.ts";

test("authenticated requests acquire and attach the current Firebase ID token", async () => {
  let received: { path: string; authorization?: string } | undefined;
  const request: AuthenticatedGet = async (path, _signal, headers) => {
    received = { path, authorization: headers.Authorization };
    return { success: true };
  };
  const result = await authenticatedGet({ getIdToken: async () => "test-token" }, request, "/me");
  assert.deepEqual(result, { success: true });
  assert.deepEqual(received, { path: "/me", authorization: "Bearer test-token" });
});

test("authenticated requests reject a missing Firebase user before making a request", async () => {
  let called = false;
  const request: AuthenticatedGet = async () => { called = true; return {}; };
  await assert.rejects(authenticatedGet(null, request, "/me"), /Sign in is required/);
  assert.equal(called, false);
});

test("backend session states represent loading, verification, and controlled failure", () => {
  assert.equal(loadingBackendSession().status, "loading");
  const verified = verifiedBackendSession({ uid: "user-123", provider: "google.com" });
  assert.equal(verified.status, "verified");
  assert.equal(verified.user.uid, "user-123");
  const failed = failedBackendSession();
  assert.equal(failed.status, "error");
  assert.match(failed.message, /couldn’t verify/);
});
