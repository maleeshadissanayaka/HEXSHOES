import assert from "node:assert/strict";
import test from "node:test";
import { failedBackendSession, loadingBackendSession, verifiedBackendSession } from "../src/auth/backendSession.ts";
import { authenticatedGet, authenticatedRequest, type AuthenticatedGet, type AuthenticatedRequest } from "../src/services/api/authenticatedRequest.ts";
import { dedupeWishlistIds, mergeWishlistIds, toggleWishlistId } from "../src/auth/wishlistState.ts";

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

test("authenticated mutations attach a token without storing it", async () => {
  let options: Parameters<AuthenticatedRequest>[1] | undefined;
  const request: AuthenticatedRequest = async (_path, received) => { options = received; return { success: true }; };
  await authenticatedRequest({ getIdToken: async () => "short-lived-token" }, request, "/wishlist/hx-01", { method: "POST" });
  assert.equal(options?.method, "POST");
  assert.equal(options?.headers?.Authorization, "Bearer short-lived-token");
});

test("guest wishlist merge is additive and deduplicated", () => {
  assert.deepEqual(mergeWishlistIds(["hx-01", "hx-02"], ["hx-02", "hx-03"]), ["hx-01", "hx-02", "hx-03"]);
  assert.deepEqual(dedupeWishlistIds(["hx-01", "hx-01"]), ["hx-01"]);
});

test("signed-out wishlist toggles locally and authenticated state can be cleared on sign-out", () => {
  const guest = toggleWishlistId([], "hx-01");
  assert.deepEqual(guest, ["hx-01"]);
  assert.deepEqual(toggleWishlistId(guest, "hx-01"), []);
  const clearedAuthenticatedWishlist: string[] = [];
  assert.deepEqual(clearedAuthenticatedWishlist, []);
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
