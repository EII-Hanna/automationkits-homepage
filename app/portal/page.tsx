import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupportTicket, updatePortalTask } from "./actions";

export default async function PortalPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("email", user.email)
    .limit(1);

  const c: any = customers?.[0];
  if (!c) {
    return (
      <main className="login">
        <div className="logo">AK</div>
        <h1>Portalzugang erkannt</h1>
        <p>Für <b>{user.email}</b> wurde noch kein Kundenaccount gefunden.</p>
      </main>
    );
  }

  if (c.portal_status !== "active") {
    await supabase.rpc("mark_current_customer_portal_active");
  }

  const [onboardingR, roadmapR, tasksR, resultsR, ticketsR, activitiesR] = await Promise.all([
    supabase.from("customer_onboarding").select("*").eq("customer_id", c.id).maybeSingle(),
    supabase.from("roadmap_phases").select("*").eq("customer_id", c.id).order("order"),
    supabase.from("tasks").select("*").eq("customer_id", c.id).order("created_at"),
    supabase.from("results").select("*").eq("customer_id", c.id).order("created_at", { ascending: false }),
    supabase.from("support_tickets").select("*").eq("customer_id", c.id).order("created_at", { ascending: false }),
    supabase.from("activities").select("*").eq("customer_id", c.id).order("created_at", { ascending: false }).limit(20)
  ]);

  const onboarding: any = onboardingR.data;
  const roadmap: any[] = roadmapR.data || [];
  const tasks: any[] = tasksR.data || [];
  const results: any[] = resultsR.data || [];
  const tickets: any[] = ticketsR.data || [];
  const activities: any[] = activitiesR.data || [];
  const openTasks = tasks.filter((t:any) => t.status !== "done").length;

  return (
    <main className="content" style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div className="topbar" style={{ margin: "-27px -28px 24px" }}>
        <div><b>AutomationKits</b> <span className="muted">· Kundenportal</span></div>
        <span className="badge">Portal aktiv</span>
      </div>

      <span className="badge">Customer OS</span>
      <h1 className="title" style={{ marginTop: 10 }}>{c.company_name || c.contact_name || "AutomationKits Kunde"}</h1>
      <p className="sub">Dein Projekt, deine Aufgaben und dein Fortschritt an einem Ort.</p>

      <div className="kpis">
        <div className="kpi"><small>ONBOARDING</small><b>{onboarding?.completed_at ? "fertig" : "offen"}</b><div className="meta">Status</div></div>
        <div className="kpi"><small>ROADMAP</small><b>{roadmap.length}</b><div className="meta">Phasen</div></div>
        <div className="kpi"><small>OFFENE TASKS</small><b>{openTasks}</b><div className="meta">To-dos</div></div>
        <div className="kpi"><small>VERIFIZIERTE RESULTS</small><b>{results.filter((r:any)=>r.verifiziertes_ergebnis).length}</b><div className="meta">Nachweise</div></div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <section className="section">
          <h3>Roadmap</h3>
          {roadmap.length ? roadmap.map((p:any) => (
            <div className="row" key={p.id}>
              <span><b>{p.title}</b><br/><span className="muted">{p.notes || "Projektphase"}</span></span>
              <span className={p.status === "done" ? "badge" : "badge warn"}>{p.status}</span>
            </div>
          )) : <div className="muted">Deine Roadmap wird gerade vorbereitet.</div>}
        </section>

        <section className="section">
          <h3>Deine Tasks</h3>
          {tasks.length ? tasks.map((t:any) => (
            <div className="row" key={t.id}>
              <span><b>{t.title}</b><br/><span className="muted">{t.due_date ? `Fällig ${t.due_date}` : "Kein Fälligkeitsdatum"}</span></span>
              <form action={updatePortalTask}>
                <input type="hidden" name="task_id" value={t.id}/>
                <select className="control" name="status" defaultValue={t.status}>
                  <option value="open">offen</option>
                  <option value="in_progress">in Arbeit</option>
                  <option value="done">erledigt</option>
                </select>
                <button className="btn" type="submit">Speichern</button>
              </form>
            </div>
          )) : <div className="muted">Aktuell keine offenen Aufgaben.</div>}
        </section>
      </div>

      <section className="section">
        <h3>Results</h3>
        {results.length ? results.map((r:any) => (
          <div className="row" key={r.id}>
            <span><b>{r.metric_name}</b><br/><span className="muted">{r.ausgangszustand || "Ausgangszustand noch offen"} → {r.zielzustand || "Ziel noch offen"}</span></span>
            <span>{r.verifiziertes_ergebnis || "noch nicht verifiziert"}</span>
          </div>
        )) : <div className="muted">Noch keine verifizierten Ergebnisse.</div>}
      </section>

      <div className="grid2">
        <section className="section">
          <h3>Support</h3>
          <form action={createSupportTicket} className="formGrid">
            <div className="field full"><label>Betreff</label><input name="subject" placeholder="Wobei können wir helfen?" required/></div>
            <div className="field full"><label>Nachricht</label><textarea name="message" placeholder="Beschreibe kurz dein Anliegen …" required/></div>
            <div className="field full"><button className="btn primary" type="submit">Ticket senden</button></div>
          </form>
          <div style={{ marginTop: 14 }}>
            {tickets.map((t:any)=><div className="row" key={t.id}><span>{t.subject}</span><span className="badge">{t.status}</span></div>)}
          </div>
        </section>

        <section className="section">
          <h3>Activity</h3>
          {activities.length ? activities.map((a:any)=><div className="row" key={a.id}><span>{a.content}</span><span className="muted">{new Date(a.created_at).toLocaleDateString("de-DE")}</span></div>) : <div className="muted">Noch keine Aktivitäten.</div>}
        </section>
      </div>
    </main>
  );
}
