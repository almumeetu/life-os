"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LogIn, Sparkles, UserPlus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { translate, type Locale } from "@/lib/i18n";

export function AuthForm({ mode: initialMode, nextPath, locale }: { mode: "sign-in" | "sign-up"; nextPath: string; locale: Locale }) {
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
  const t = (message: string, values?: Record<string, string | number>) => translate(locale, message, values);
  const translatedAuthError = (message: string, fallback: string) => {
    const translated = translate(locale, message);
    return locale === "bn" && translated === message ? t(fallback) : translated;
  };

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
          setError(translatedAuthError(result.error.message || "Could not create account. Please check your details and try again.", "Could not create account. Please check your details and try again."));
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
            setError(t("Incorrect email or password. If you haven't created your account yet, you can create it below."));
            setShowQuickCreate(true);
          } else {
            setError(translatedAuthError(msg, "Could not sign in. Please try again."));
          }
          return;
        }

        router.replace(nextPath || "/dashboard");
        router.refresh();
      }
    } catch {
      setError(t("We couldn’t reach the server. Please verify your connection and try again."));
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
          <LogIn size={15} aria-hidden="true" />
          <span>{t("Sign In")}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={signingUp}
          className={`auth-tab ${signingUp ? "active" : ""}`}
          onClick={() => { setMode("sign-up"); setError(""); setShowQuickCreate(false); }}
        >
          <UserPlus size={15} aria-hidden="true" />
          <span>{t("Create Account")}</span>
        </button>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {signingUp && (
          <label className="field">
            <span>{t("Full Name")}</span>
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder={t("e.g. Al Mumeetu Saikat")}
            />
          </label>
        )}

        <label className="field">
          <span>{t("Email Address")}</span>
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
            <span>{t("Password")}</span>
            <small>{signingUp ? t("At least 6 characters") : ""}</small>
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
              placeholder={t(signingUp ? "Choose a secure password" : "Enter your password")}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={t(showPassword ? "Hide password" : "Show password")}
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
              <p>{t("New to Preparation Hub with {email}?", { email: emailValue || t("this email") })}</p>
                <button
                  type="button"
                  className="button button-primary button-small"
                  onClick={quickCreateAccount}
                  disabled={pending}
                >
                  <Sparkles size={13} aria-hidden="true" />
                  <span>{t("Create account now")}</span>
                </button>
              </div>
            )}
          </div>
        )}

        <button className="button button-primary auth-submit" type="submit" disabled={pending}>
          {pending ? <LoaderCircle size={17} className="spin" aria-hidden="true" /> : null}
          {pending ? t("Please wait…") : t(signingUp ? "Create account" : "Sign in to workspace")}
          {!pending && <ArrowRight size={16} aria-hidden="true" />}
        </button>

        <p className="auth-helper">
          {signingUp
            ? t("Your workspace is private, secure, and personal to you.")
            : t("Your saved work is available inside your signed-in workspace.")}
        </p>
      </form>
    </div>
  );
}
