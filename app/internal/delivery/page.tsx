import Link from "next/link";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setRoadmapStatus, setTaskStatus } from "../actions";

export default async function DeliveryPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: customers }, { data: phases }, { data: tasks }, { data: blockers }] = await Promise.all([
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("roadmap_phases").select("*").order("order"),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    supabase.from("blockers").select("*").order("created_at", { ascending: false })
  ]);

  const cs:any[] = customers || [];
  const ps:any[] = phases || [];
  const ts:any[] = tasks || [];
  const bs:any[] = blockers || [];

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <div className="topbar"><strong>Delivery</strong><span className="muted">Live Operations</span></div>
        <div className="content">
          <h1 className="title">Delivery</h1>
          <p className="sub">Roadmap, Meilensteine, Tasks und Blocker pro Kunde.</p>

          <div className="kpis">
            <div className="kpi"><small>AKTIVE PHASEN</small><b>{ps.filter((p:any)=>p.status==="active").length}</b><div className="meta">Delivery</div></div>
            <div className="kpi"><small>ERLEDIGTE PHASEN</small><b className="good">{ps.filter((p:any)=>p.status==="done").length}</b><div className="meta">Roadmap</div></div>
            <div className="kpi"><small>OFFENE TASKS</small><b>{ts.filter((t:any)=>t.status!=="done").length}</b><div className="meta">To-dos</div></div>
            <div className="kpi"><small>BLOCKER</small><b className={bs.filter((b:any)=>b.status==="open").length ? "bad" : "good"}>{bs.filter((b:any)=>b.status==="open").length}</b><div className="meta">offen</div></div>
          </div>

          {cs.map((c:any)=>{
            const customerPhases = ps.filter((p:any)=>p.customer_id===c.id);
            const customerTasks = ts.filter((t:any)=>t.customer_id===c.id);
            const customerBlockers = bs.filter((b:any)=>b.customer_id===c.id && b.status==="open");
            if (!customerPhases.length && !customerTasks.length && !customerBlockers.length) return null;
            return (
              <section className="section" key={c.id}>
                <div className="row" style={{paddingTop:0}}>
                  <span><Link href={`/internal/customers/${c.id}`}><h3 style={{margin:0}}>{c.company_name || c.contact_name || c.email}</h3></Link><span className="muted">{customerBlockers.length ? `${customerBlockers.length} Blocker` : "kein Blocker"}</span></span>
                  <span className="badge">{c.status}</span>
                </div>

                <div className="grid2">
                  <div className="card" style={{padding:14}}>
                    <h4 style={{marginTop:0}}>Roadmap</h4>
                    {customerPhases.length ? customerPhases.map((p:any)=><div className="row" key={p.id}><span><b>{p.title}</b><br/><span className="muted">{p.notes || "Projektphase"}</span></span><form action={setRoadmapStatus} style={{display:"flex",gap:8}}><input type="hidden" name="phase_id" value={p.id}/><select className="control" name="status" defaultValue={p.status}><option value="open">open</option><option value="active">active</option><option value="done">done</option></select><button className="btn" type="submit">Speichern</button></form></div>) : <div className="muted">Noch keine Roadmap.</div>}
                  </div>

                  <div className="card" style={{padding:14}}>
                    <h4 style={{marginTop:0}}>Tasks</h4>
                    {customerTasks.length ? customerTasks.map((t:any)=><div className="row" key={t.id}><span><b>{t.title}</b><br/><span className="muted">{t.owner || "kein Owner"}{t.due_date ? ` · ${t.due_date}` : ""}</span></span><form action={setTaskStatus} style={{display:"flex",gap:8}}><input type="hidden" name="task_id" value={t.id}/><select className="control" name="status" defaultValue={t.status}><option value="open">open</option><option value="in_progress">in progress</option><option value="done">done</option></select><button className="btn" type="submit">Speichern</button></form></div>) : <div className="muted">Noch keine Tasks.</div>}
                  </div>
                </div>

                {customerBlockers.length > 0 && <div className="card" style={{padding:14,marginTop:12}}><h4 style={{marginTop:0}}>Blocker</h4>{customerBlockers.map((b:any)=><div className="row" key={b.id}><span>{b.description}</span><span className="badge warn">open</span></div>)}</div>}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
