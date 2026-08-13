"use client";

import { FormEvent, useState } from "react";
import type { StaffUser } from "../lib/auth";
import { LogoMark } from "../components/LogoMark";

export function ChangePasswordPrompt({
  user,
  onComplete,
}: {
  user: StaffUser;
  onComplete: (updated: StaffUser) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setNotice("");
    if (newPassword !== confirm) {
      setNotice("New passwords do not match.");
      return;
    }
    if (newPassword.length < 12) {
      setNotice("New password must be at least 12 characters.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to change password");
      onComplete({ ...user, mustChangePassword: false });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-login-shell">
      <section className="admin-login-brand">
        <div className="wordmark">
          <LogoMark />
          <span>BURMESE CATHOLIC<br />COMMUNITY WA</span>
        </div>
        <p>PRIVATE STAFF WORKSPACE</p>
        <h1>Set your own password before continuing.</h1>
        <div className="access-boundary">
          <strong>First sign-in required</strong>
          <p>
            Your account was created with a temporary password. Please set a
            personal password (at least 12 characters) to continue.
          </p>
        </div>
      </section>
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <p className="eyebrow">One-time setup</p>
        <h2>Change your password</h2>
        <p>Welcome, {user.displayName}. Enter the temporary password given to you, then choose a new one.</p>
        <label>
          Temporary password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>
        <label>
          New password
          <input
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        {notice && <div className="admin-notice" role="alert">{notice}</div>}
        <button className="button-review" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Set password and continue →"}
        </button>
      </form>
    </main>
  );
}
