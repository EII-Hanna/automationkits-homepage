import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { createTask, setTaskStatus } from "../actions";

export default async function TasksPage(){
  const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
  const [{data:customers},{data:tasks},{data:phases}]=await Promise.all([
    supabase.from("customers").select("id,company_name,email").order("created_at",{ascending:false}),
    supabase.from("tasks").select("*").order("created_at",{ascending:false}),
    supabase.from("roadmap_phases").select("id,customer_id,title").order("order")
  ]);
  return <div className="app"><Sidebar/><main className="main"><div className="topbar"><strong>Tasks</strong><span className="muted">{user.email}</span></div><div className="content">
    <h1 className="title">Tasks</h1><p className="sub">Aufgaben pro Kunde steuern und neue Delivery-Tasks anlegen.</p>
    <section className="section"><h3>Neuer Task</h3><form action={createTask} className="formGrid">
      <div className="field"><label>Kunde</label><select name="customer_id" required>{(customers||[]).map((c:any)=><option key={c.id} value={c.id}>{c.company_name||c.email}</option>)}</select></div>
      <div className="field"><label>Titel</label><input name="title" required/></div>
      <div className="field"><label>Owner</label><input name="owner" placeholder="intern / customer"/></div>
      <div className="field"><label>Fällig</label><input name="due_date" type="date"/></div>
      <div className="field full"><button className="btn primary">Task anlegen</button></div>
    </form></section>
    <section className="section"><h3>Alle Tasks</h3>{(tasks||[]).map((t:any)=>{const c=(customers||[]).find((x:any)=>x.id===t.customer_id); return <div className="row" key={t.id}><span><b>{t.title}</b><br/><span className="muted">{c?.company_name||c?.email||"Kunde"}{t.owner?` · ${t.owner}`:""}{t.due_date?` · ${t.due_date}`:""}</span></span><form action={setTaskStatus}><input type="hidden" name="task_id" value={t.id}/><select className="control" name="status" defaultValue={t.status}><option value="open">open</option><option value="in_progress">in progress</option><option value="done">done</option></select><button className="btn">Speichern</button></form></div>})}</section>
  </div></main></div>
}