import Link from "next/link";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setPortalStatus } from "../actions";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: customers }, { data: onboardings }, { data: tasks }] = await Promise.all([
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("customer_onboarding").select("*"),
    supabase.from("tasks").select("*")
  ]);

  const cs:any[] = customers || [];
  const os:any[] = onboardings || [];
  const ts:any[] = tasks || [];
  const finished = os.filter((o:any)=>o.completed_at).length;

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <div className="topbar"><strong>Onboarding</strong><span className="muted">{finished}/{cs.length} abgeschlossen</span></div>
        <div className="content">
          <h1 className="title">Onboarding</h1>
          <p className="sub">Payment → Portal → Formular → Kickoff → Systemzugänge.</p>

          <div className="kpis">
            <div className="kpi"><small>KUNDEN</small><b>{cs.length}</b><div className="meta">gesamt</div></div>
            <div className="kpi"><small>FORMULAR FERTIG</small><b className="good">{finished}</b><div className="meta">Onboarding</div></div>
            <div className="kpi"><small>PORTAL AKTIV</small><b>{cs.filter((c:any)=>c.portal_status==="active").length}</b><div className="meta">Login erfolgt</div></div>
            <div className="kpi"><small>OFFENE ONBOARDING TASKS</small><b>{ts.filter((t:any)=>t.status!=="done" && /onboarding|kickoff|zugang/i.test(t.title)).length}</b><div className="meta">nächste Schritte</div></div>
          </div>

          <section className="section">
            <h3>Kunden im Onboarding</h3>
            {cs.map((c:any)=>{
              const o = os.find((x:any)=>x.customer_id===c.id);
              const customerTasks = ts.filter((t:any)=>t.customer_id===c.id && t.status!=="done");
              return (
                <div className="row" key={c.id}>
                  <span>
                    <Link href={`/internal/customers/${c.id}`}><b>{c.company_name || c.contact_name || c.email}</b></Link><br/>
                    <span className="muted">{o?.completed_at ? "Formular abgeschlossen" : "Formular offen"} · {customerTasks.length} offene Tasks</span>
                  </span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span className={o?.completed_at ? "badge" : "badge warn"}>{o?.completed_at ? "fertig" : "offen"}</span>
                    <form action={setPortalStatus} style={{display:"flex",gap:8}}>
                      <input type="hidden" name="customer_id" value={c.id}/>
                      <select className="control" name="status" defaultValue={c.portal_status || "not_invited"}>
                        <option value="not_invited">nicht eingeladen</option>
                        <option value="invited">eingeladen</option>
                        <option value="active">aktiv</option>
                      </select>
                      <button className="btn" type="submit">Speichern</button>
                    </form>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </main>
    </div>
  );
}
