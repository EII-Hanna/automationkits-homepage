'use client';

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("w.hannade@gmail.com");
  const [message, setMessage] = useState("");
  const supabase = createSupabaseBrowserClient();

  async function sendMagicLink() {
    setMessage("Magic Link wird gesendet …");
    const redirectTo = `${window.location.origin}/auth/callback?next=/internal`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });
    setMessage(error ? `Fehler: ${error.message}` : "Magic Link gesendet.");
  }

  return (
    <main className="login">
      <div className="logo">AK</div>
      <h1>AutomationKits Admin</h1>
      <p>Interne Operations-App mit echten Daten aus Supabase.</p>
      <div className="field">
        <label>E-Mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button className="btn primary" onClick={sendMagicLink} style={{marginTop:12}}>
        Magic Link senden
      </button>
      <div className="meta">{message}</div>
    </main>
  );
}
