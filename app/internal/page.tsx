import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { setTaskStatus, setRoadmapStatus, setPortalStatus } from "./actions";

export default async function InternalPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [customersR, paymentsR, onboardingsR, phasesR, tasksR, blockersR, activitiesR] = await Promise.all([
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("payments").select("*").order("created_at", { ascending: false }),
    supabase.from("customer_onboarding").select("*"),
    supabase.from("roadmap_phases").select("*").order("order"),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase.from("blockers").select("*").order("created_at", { ascending: false }),
    supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(50)
  ]);

  const customers = customersR.data || [];
  const payments = paymentsR.data || [];
  const onboardings = onboardingsR.data || [];
  const phases = phasesR.data || [];
  const tasks = tasksR.data || [];
  const blockers = blockersR.data || [];
  const activities = activitiesR.data || [];

  const paid = customers.filter((c:any) => ["paid","onboarding","active"].includes(c.status)).length;
  const onboardingOpen = customers.filter((c:any) => {
    const o = onboardings.find((x:any) => x.customer_id === c.id);
    return !o?.completed_at;
  }).length;
  const openTasks = tasks.filter((t:any) => t.status !== "done").length;

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <div className="topbar"><strong>AutomationKits Operations</strong><span className="muted">{user.email}</span></div>
        <div className="content">
          <h1 className="title">Command Center</h1>
          <p className="sub">Echte Kunden-, Payment-, Onboarding- und Delivery-Daten.</p>
          <div className="kpis">
            <div className="kpi"><small>KUNDEN</small><b>{customers.length}</b><div className="meta">Supabase live</div></div>
            <div className="kpi"><small>PAID</small><b className="good">{paid}</b><div className="meta">CopeCart</div></div>
            <div className="kpi"><small>ONBOARDING OFFEN</small><b>{onboardingOpen}</b><div className="meta">Formularstatus</div></div>
            <div className="kpi"><small>OFFENE TASKS</small><b>{openTasks}</b><div className="meta">Delivery</div></div>
          </div>
          <section id="customers" className="section"><h3>Customers</h3><div className="customerGrid">{customers.map((c:any) => <Link key={c.id} href={`/internal/customers/${c.id}`} className="customer"><div className="customerLogo">{String(c.company_name || c.email).slice(0,2).toUpperCase()}</div><h4>{c.company_name || c.contact_name || c.email}</h4><span className="badge">{c.status}</span><div className="meta">{c.email}</div></Link>)}</div></section>
          <section id="onboarding" className="section"><h3>Onboarding</h3>{customers.map((c:any) => { const o = onboardings.find((x:any) => x.customer_id === c.id); const portalStatus = c.portal_status || c.sales_context?.portal_invite_status || "not_invited"; return <div className="row" key={c.id}><span><b>{c.company_name || c.email}</b><br/><span className="muted">{o?.completed_at ? "Onboarding abgeschlossen" : "Formular offen"}</span></span><form action={setPortalStatus}><input type="hidden" name="customer_id" value={c.id}/><select className="control" name="status" defaultValue={portalStatus}><option value="not_invited">nicht eingeladen</option><option value="invited">eingeladen</option><option value="active">aktiv</option></select><button className="btn" type="submit">Speichern</button></form></div>; })}</section>
          <section id="delivery" className="section"><h3>Delivery</h3>{phases.map((p:any) => { const c = customers.find((x:any) => x.id === p.customer_id); return <div className="row" key={p.id}><span><b>{c?.company_name || "Kunde"}</b> · {p.title}</span><form action={setRoadmapStatus}><input type="hidden" name="phase_id" value={p.id}/><select className="control" name="status" defaultValue={p.status}><option value="open">open</option><option value="active">active</option><option value="done">done</option></select><button className="btn" type="submit">Speichern</button></form></div>; })}</section>
          <section id="tasks" className="section"><h3>Tasks</h3>{tasks.map((t:any) => { const c = customers.find((x:any) => x.id === t.customer_id); return <div className="row" key={t.id}><span><b>{t.title}</b><br/><span className="muted">{c?.company_name || "Kunde"} · {t.owner || ""}</span></span><form action={setTaskStatus}><input type="hidden" name="task_id" value={t.id}/><select className="control" name="status" defaultValue={t.status}><option value="open">open</option><option value="in_progress">in progress</option><option value="done">done</option></select><button className="btn" type="submit">Speichern</button></form></div>; })}</section>
          <section id="blockers" className="section"><h3>Blockers</h3>{blockers.length ? blockers.map((b:any) => <div className="row" key={b.id}><span>{b.description}</span><span className="badge warn">{b.status}</span></div>) : <div className="muted">Keine offenen Blocker.</div>}</section>
          <section id="billing" className="section"><h3>Billing</h3>{payments.map((p:any) => { const c = customers.find((x:any) => x.id === p.customer_id); return <div className="row" key={p.id}><span><b>{c?.company_name || c?.email || "Kunde"}</b><br/><span className="muted">{p.provider}</span></span><span><b>{Number(p.amount || 0).toLocaleString("de-DE",{style:"currency",currency:"EUR"})}</b><br/><span className="badge">{p.status}</span></span></div>; })}</section>
          <section id="activity" className="section"><h3>Activity</h3>{activities.map((a:any) => <div className="row" key={a.id}><span>{a.content}</span><span className="muted">{new Date(a.created_at).toLocaleString("de-DE")}</span></div>)}</section>
        </div>
      </main>
    </div>
  );
}
