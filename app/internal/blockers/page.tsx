import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { createBlocker, setBlockerStatus } from "../actions";

export default async function BlockersPage(){
  const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
  const [{data:customers},{data:blockers},{data:tasks}]=await Promise.all([
    supabase.from("customers").select("id,company_name,email"),
    supabase.from("blockers").select("*").order("created_at",{ascending:false}),
    supabase.from("tasks").select("id,customer_id,title").order("created_at",{ascending:false})
  ]);
  return <div className="app"><Sidebar/><main className="main"><div className="topbar"><strong>Blockers</strong><span className="muted">{user.email}</span></div><div className="content">
    <h1 className="title">Blockers</h1><p className="sub">Hindernisse sichtbar machen, zuordnen und auflösen.</p>
    <section className="section"><h3>Neuer Blocker</h3><form action={createBlocker} className="formGrid">
      <div className="field"><label>Kunde</label><select name="customer_id" required>{(customers||[]).map((c:any)=><option key={c.id} value={c.id}>{c.company_name||c.email}</option>)}</select></div>
      <div className="field"><label>Beschreibung</label><input name="description" required/></div>
      <div className="field full"><button className="btn primary">Blocker anlegen</button></div>
    </form></section>
    <section className="section"><h3>Alle Blocker</h3>{(blockers||[]).length?(blockers||[]).map((b:any)=>{const c=(customers||[]).find((x:any)=>x.id===b.customer_id);return <div className="row" key={b.id}><span><b>{b.description}</b><br/><span className="muted">{c?.company_name||c?.email||"Kunde"}</span></span><form action={setBlockerStatus}><input type="hidden" name="blocker_id" value={b.id}/><select className="control" name="status" defaultValue={b.status}><option value="open">open</option><option value="resolved">resolved</option></select><button className="btn">Speichern</button></form></div>}):<div className="muted">Keine Blocker.</div>}</section>
  </div></main></div>
}