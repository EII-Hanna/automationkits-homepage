import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { createResult } from "../actions";

export default async function ResultsPage(){
  const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
  const [{data:customers},{data:results}]=await Promise.all([
    supabase.from("customers").select("id,company_name,email"),
    supabase.from("results").select("*").order("created_at",{ascending:false})
  ]);
  return <div className="app"><Sidebar/><main className="main"><div className="topbar"><strong>Results</strong><span className="muted">{user.email}</span></div><div className="content">
    <h1 className="title">Results</h1><p className="sub">Nur echte, nachvollziehbare Ergebnisse dokumentieren.</p>
    <section className="section"><h3>Result erfassen</h3><form action={createResult} className="formGrid">
      <div className="field"><label>Kunde</label><select name="customer_id" required>{(customers||[]).map((c:any)=><option key={c.id} value={c.id}>{c.company_name||c.email}</option>)}</select></div>
      <div className="field"><label>Metrik</label><input name="metric_name" placeholder="z. B. Zeitersparnis" required/></div>
      <div className="field"><label>Ausgangszustand</label><input name="ausgangszustand"/></div>
      <div className="field"><label>Zielzustand</label><input name="zielzustand"/></div>
      <div className="field"><label>Aktueller Zustand</label><input name="aktueller_zustand"/></div>
      <div className="field"><label>Verifiziertes Ergebnis</label><input name="verifiziertes_ergebnis" placeholder="Nur eintragen, wenn belegt"/></div>
      <div className="field full"><button className="btn primary">Result speichern</button></div>
    </form></section>
    <section className="section"><h3>Ergebnisse</h3>{(results||[]).length?(results||[]).map((r:any)=>{const c=(customers||[]).find((x:any)=>x.id===r.customer_id);return <div className="row" key={r.id}><span><b>{r.metric_name||"Outcome"}</b><br/><span className="muted">{c?.company_name||c?.email||"Kunde"} · {r.ausgangszustand||"—"} → {r.zielzustand||"—"}</span></span><span className={r.verifiziertes_ergebnis?"badge":"badge warn"}>{r.verifiziertes_ergebnis||"noch nicht verifiziert"}</span></div>}):<div className="muted">Noch keine Ergebnisse.</div>}</section>
  </div></main></div>
}