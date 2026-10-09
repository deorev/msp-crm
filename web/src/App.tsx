import { useEffect, useState, type FormEvent } from "react";
import { userLabel } from "./user-label.js";

interface CurrentUser {
  name: string;
  role: string;
}

function isCurrentUser(value: unknown): value is CurrentUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof value.name === "string" &&
    "role" in value &&
    typeof value.role === "string"
  );
}

type ViewState = "loading" | "signed-out" | "signed-in";

export default function App() {
  const [view, setView] = useState<ViewState>("loading");
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/me", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status !== 401) throw new Error("Could not load your account.");
          return null;
        }
        const result: unknown = await response.json();
        if (!isCurrentUser(result)) throw new Error("Unexpected account response.");
        return result;
      })
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setView(currentUser ? "signed-in" : "signed-out");
      })
      .catch(() => {
        if (active) {
          setError("Unable to connect to the service. Please try again.");
          setView("signed-out");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Sign in failed.";
        setError(message);
        return;
      }
      if (!isCurrentUser(result)) throw new Error("Unexpected sign-in response.");
      setUser(result);
      setView("signed-in");
      setPassword("");
    } catch {
      setError("Unable to connect to the service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (view === "loading") {
    return <main className="page"><p className="loading">Loading your account…</p></main>;
  }

  if (view === "signed-in" && user) {
    return (
      <main className="page">
        <header className="topbar">
          <a className="brand" href="/" aria-label="MSP CRM home">MSP<span>CRM</span></a>
          <span className="role-pill">{user.role}</span>
        </header>
        <section className="welcome-card" aria-labelledby="welcome-heading">
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1 id="welcome-heading">Welcome, {user.name}</h1>
          <p className="identity">{userLabel(user.name, user.role)}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page login-layout">
      <section className="login-card" aria-labelledby="login-heading">
        <a className="brand login-brand" href="/">MSP<span>CRM</span></a>
        <p className="eyebrow">SERVICE &amp; OPERATIONS</p>
        <h1 id="login-heading">Welcome back</h1>
        <p className="intro">Sign in to continue to your workspace.</p>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email address</label>
          <input
            autoComplete="username"
            id="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <label htmlFor="password">Password</label>
          <input
            autoComplete="current-password"
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          {error && <p className="error" role="alert">{error}</p>}
          <button disabled={submitting} type="submit">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
