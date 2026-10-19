"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LogIn, Sparkles, UserPlus } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode: initialMode, nextPath }: { mode: "sign-in" | "sign-up"; nextPath: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">(initialMode);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  const signingUp = mode === "sign-up";

  async function handleAuth(emailToUse: string, passwordToUse: string, nameToUse: string, isSignUp: boolean) {
    setPending(true);
    setError("");
    setShowQuickCreate(false);

    try {
      if (isSignUp) {
        const finalName = nameToUse.trim() || emailToUse.split("@")[0] || "User";
        const result = await authClient.signUp.email({
          name: finalName,
          email: emailToUse,
          password: passwordToUse,
        });

        if (result.error) {
          setError(result.error.message || "Could not create account. Please check your details and try again.");
          return;
        }

        router.replace("/dashboard");
        router.refresh();
      } else {
        const result = await authClient.signIn.email({
          email: emailToUse,
          password: passwordToUse,
          rememberMe: true,
        });

        if (result.error) {
          const msg = result.error.message || "";
          if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("user") || msg.toLowerCase().includes("credential") || !msg) {
            setError("Incorrect email or password. If you haven't created your account yet, you can create it below.");
            setShowQuickCreate(true);
          } else {
            setError(msg);
          }
          return;
        }

        router.replace(nextPath || "/dashboard");
        router.refresh();
      }
    } catch {
      setError("We couldn’t reach the server. Please verify your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = emailValue.trim().toLowerCase();
    await handleAuth(cleanEmail, passwordValue, nameValue, signingUp);
  }

  async function quickCreateAccount() {
    const cleanEmail = emailValue.trim().toLowerCase();
    if (!cleanEmail || !passwordValue) {
      setMode("sign-up");
      return;
    }
    await handleAuth(cleanEmail, passwordValue, nameValue || "Al Mumeetu Saikat", true);
  }

  return (
    <div className="auth-form-container">
      {/* Segmented Mode Selector */}
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={!signingUp}
          className={`auth-tab ${!signingUp ? "active" : ""}`}
          onClick={() => { setMode("sign-in"); setError(""); setShowQuickCreate(false); }}
        >
          <LogIn size={15} />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={signingUp}
          className={`auth-tab ${signingUp ? "active" : ""}`}
          onClick={() => { setMode("sign-up"); setError(""); setShowQuickCreate(false); }}
        >
          <UserPlus size={15} />
          <span>Create Account</span>
        </button>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {signingUp && (
          <label className="field">
            <span>Full Name</span>
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder="e.g. Al Mumeetu Saikat"
            />
          </label>
        )}

        <label className="field">
          <span>Email Address</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={emailValue}
            onChange={(e) => { setEmailValue(e.target.value); setError(""); }}
            placeholder="almumeetu@gmail.com"
          />
        </label>

        <label className="field">
          <div className="field-label-row">
            <span>Password</span>
            <small>{signingUp ? "At least 6 characters" : ""}</small>
          </div>
          <div className="password-input-wrap">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={signingUp ? "new-password" : "current-password"}
              required
              minLength={signingUp ? 6 : 1}
              maxLength={128}
              value={passwordValue}
              onChange={(e) => { setPasswordValue(e.target.value); setError(""); }}
              placeholder={signingUp ? "Choose a secure password" : "Enter your password"}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {error && (
          <div className="form-error" role="alert">
            <p>{error}</p>
            {showQuickCreate && (
              <div className="quick-create-box">
                <p>New to Life OS with <b>{emailValue || "this email"}</b>?</p>
                <button
                  type="button"
                  className="button button-primary button-small"
                  onClick={quickCreateAccount}
                  disabled={pending}
                >
                  <Sparkles size={13} />
                  <span>Create account now</span>
                </button>
              </div>
            )}
          </div>
        )}

        <button className="button button-primary auth-submit" type="submit" disabled={pending}>
          {pending ? <LoaderCircle size={17} className="spin" /> : null}
          {pending ? "Please wait…" : signingUp ? "Create account" : "Sign in to workspace"}
          {!pending && <ArrowRight size={16} />}
        </button>

        <p className="auth-helper">
          {signingUp
            ? "Your workspace is private, secure, and personal to you."
            : "Your personal data is encrypted and kept private in your workspace."}
        </p>
      </form>
    </div>
  );
}
