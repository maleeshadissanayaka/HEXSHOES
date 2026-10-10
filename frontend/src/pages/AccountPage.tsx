import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { accountViewState, providerLabel } from "../auth/accountState";
import { validateRegistration, validateSignIn } from "../auth/authValidation";
import { useAuth } from "../auth/useAuth";
import { Icon } from "../components/shared/Icon";
import { PageContainer } from "../components/shared/PageContainer";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useExperience } from "../hooks/useExperience";

const accountModules = [
  { index: "01", title: "Saved Styles", description: "Return to the footwear concepts saved during this visit.", to: "/wishlist", action: "View saved styles" },
  { index: "02", title: "Recent Discovery", description: "Pick up with the latest HEXSHOES presentation studies.", to: "/new-drops", action: "Explore new drops" },
  { index: "03", title: "Fit Preferences", description: "Choose a presentation size while exploring a product concept.", to: "/shop", action: "Explore footwear" },
] as const;

function AuthForm() {
  const { configured, signInWithEmail, signInWithGoogle, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    const validation = mode === "signin" ? validateSignIn(email, password) : validateRegistration(email, password, confirmation);
    if (!validation.valid) { setError(validation.message); return; }
    setError(""); setSubmitting(true);
    try {
      if (mode === "signin") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn’t complete that account request right now.");
    } finally { setSubmitting(false); }
  }

  async function googleSignIn() {
    setError(""); setSubmitting(true);
    try { await signInWithGoogle(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "We couldn’t complete that account request right now."); }
    finally { setSubmitting(false); }
  }

  return <section className="account-auth section">
    <PageContainer className="account-auth__layout">
      <div className="account-auth__copy">
        <p className="eyebrow">ACCOUNT ACCESS / SECURE SESSION</p>
        <h2>{mode === "signin" ? "WELCOME BACK." : "CREATE YOUR SPACE."}</h2>
        <p>One considered place for your HEXSHOES account. Saved styles and bag selections remain visit-only for now.</p>
      </div>
      <div className="account-auth__panel">
        <div className="account-auth__tabs" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => { setMode("signin"); setError(""); }}>SIGN IN</button>
          <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => { setMode("register"); setError(""); }}>CREATE ACCOUNT</button>
        </div>
        <form onSubmit={submit}>
          <label htmlFor="account-email">Email address</label>
          <input id="account-email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="account-password">Password</label>
          <input id="account-password" name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required />
          {mode === "register" && <><label htmlFor="account-confirmation">Confirm password</label><input id="account-confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={6} required /></>}
          <button className="button button--light" type="submit" disabled={submitting || !configured}>{submitting ? "PLEASE WAIT…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}<Icon name="arrow" size={18} /></button>
        </form>
        <div className="account-auth__divider"><span>OR</span></div>
        <button className="button account-auth__google" type="button" onClick={googleSignIn} disabled={submitting || !configured}>CONTINUE WITH GOOGLE</button>
        {!configured && <p className="account-auth__notice" role="status">Account services need the Firebase Web configuration for this environment.</p>}
        <p className="account-auth__error" role="alert">{error}</p>
      </div>
    </PageContainer>
  </section>;
}

export function AccountPage() {
  useDocumentTitle("Your HEX space");
  const auth = useAuth();
  const { wishlist } = useExperience();
  const state = accountViewState(auth.loading, auth.user);
  const [signOutError, setSignOutError] = useState("");
  return <div className="route-enter account-page">
    <section className="account-intro section"><PageContainer>
      <p className="eyebrow">ACCOUNT / PERSONAL SPACE</p><h1>YOUR HEX SPACE.</h1>
      <p className="account-intro__copy">A considered home for the styles and ideas that move you.</p>
      <span className="account-intro__mark" aria-hidden="true">H<span>+</span></span>
    </PageContainer></section>
    {state === "loading" && <section className="account-auth-loading section" role="status"><PageContainer><span className="signal-dot" /> Restoring your account session…</PageContainer></section>}
    {state === "signed-out" && <AuthForm />}
    {state === "signed-in" && auth.user && <>
      <section className="account-profile section"><PageContainer className="account-profile__layout">
        <div><p className="eyebrow">AUTHENTICATED / ACTIVE SESSION</p><h2>{auth.user.displayName || "HEXSHOES MEMBER"}</h2><p>{auth.user.email ?? "Email unavailable"}</p></div>
        <dl><div><dt>Provider</dt><dd>{providerLabel(auth.user)}</dd></div><div><dt>Account status</dt><dd>{auth.user.emailVerified ? "Email verified" : "Active"}</dd></div></dl>
        <button className="button button--outline" type="button" onClick={() => { setSignOutError(""); void auth.signOutUser().catch((error: unknown) => setSignOutError(error instanceof Error ? error.message : "Sign out failed.")); }}>SIGN OUT</button>
        <p className="account-auth__error" role="alert">{signOutError}</p>
      </PageContainer></section>
      <section className="account-modules section"><PageContainer><div className="account-modules__grid">
        {accountModules.map((module) => <article key={module.index}><span className="eyebrow muted">{module.index} / PERSONAL SPACE</span><h2>{module.title}</h2><p>{module.description}</p>{module.title === "Saved Styles" && wishlist.length > 0 && <span className="account-module__count">{wishlist.length} saved this visit</span>}<Link className="text-link" to={module.to}>{module.action} <Icon name="arrow" size={18} /></Link></article>)}
      </div><p className="quiet-note account-note">Account access persists through Firebase. Saved styles and bag selections remain in memory for this visit only.</p></PageContainer></section>
    </>}
  </div>;
}
