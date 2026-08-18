import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PortalPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: customers } = await supabase.from("customers").select("*").eq("email", user.email).limit(1);
  const c:any = customers?.[0];
  if (!c) return <main className="login"><h1>Portalzugang erkannt</h1><p>Für diese E-Mail wurde noch kein Kundenaccount gefunden.</p></main>;

  const [{ data: onboarding }, { data: roadmap }, { data: tasks }, { data: results }, { data: tickets }] = await Promise.all([
    supabase.from("customer_onboarding").select("*").eq("customer_id", c.id).maybeSingle(),
    supabase.from("roadmap_phases").select("*").eq("customer_id", c.id).order("order"),
    supabase.from("tasks").select("*").eq("customer_id", c.id).order("created_at"),
    supabase.from("results").select("*").eq("customer_id", c.id).order("created_at", { ascending:false }),
    supabase.from("support_tickets").select("*").eq("customer_id", c.id).order("created_at", { ascending:false })
  ]);

  return (
    <main className="content" style={{maxWidth:1000, margin:"0 auto"}}>
      <span className="badge">Kundenportal</span>
      <h1 className="title" style={{marginTop:10}}>{c.company_name || "AutomationKits Kunde"}</h1>
      <p className="sub">Status: {c.status}</p>
      <div className="kpis">
        <div className="kpi"><small>ONBOARDING</small><b>{onboarding?.completed_at ? "fertig" : "offen"}</b></div>
        <div className="kpi"><small>ROADMAP</small><b>{roadmap?.length || 0}</b></div>
        <div className="kpi"><small>OFFENE TASKS</small><b>{(tasks || []).filter((t:any)=>t.status!=="done").length}</b></div>
        <div className="kpi"><small>RESULTS</small><b>{results?.length || 0}</b></div>
      </div>
      <section className="section"><h3>Roadmap</h3>{(roadmap || []).map((p:any)=><div className="row" key={p.id}><span>{p.title}</span><span className="badge">{p.status}</span></div>)}</section>
      <section className="section"><h3>Tasks</h3>{(tasks || []).map((t:any)=><div className="row" key={t.id}><span>{t.title}</span><span className="badge">{t.status}</span></div>)}</section>
      <section className="section"><h3>Results</h3>{results?.length ? results.map((r:any)=><div className="row" key={r.id}><span>{r.metric_name}</span><span>{r.verifiziertes_ergebnis || "noch nicht verifiziert"}</span></div>) : <div className="muted">Noch keine verifizierten Ergebnisse.</div>}</section>
      <section className="section"><h3>Support</h3>{tickets?.length ? tickets.map((t:any)=><div className="row" key={t.id}><span>{t.subject}</span><span className="badge">{t.status}</span></div>) : <div className="muted">Keine Tickets.</div>}</section>
    </main>
  );
}
