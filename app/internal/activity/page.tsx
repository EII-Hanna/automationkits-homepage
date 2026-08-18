import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export default async function ActivityPage(){
  const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
  const [{data:customers},{data:activities}]=await Promise.all([
    supabase.from("customers").select("id,company_name,email"),
    supabase.from("activities").select("*").order("created_at",{ascending:false}).limit(200)
  ]);
  return <div className="app"><Sidebar/><main className="main"><div className="topbar"><strong>Activity</strong><span className="muted">{user.email}</span></div><div className="content">
    <h1 className="title">Activity</h1><p className="sub">Chronologischer Verlauf aller relevanten Kunden- und Systemereignisse.</p>
    <section className="section"><h3>Letzte Aktivitäten</h3>{(activities||[]).length?(activities||[]).map((a:any)=>{const c=(customers||[]).find((x:any)=>x.id===a.customer_id);return <div className="row" key={a.id}><span><b>{a.content}</b><br/><span className="muted">{a.type} · {c?.company_name||c?.email||"System"}</span></span><span className="muted">{new Date(a.created_at).toLocaleString("de-DE")}</span></div>}):<div className="muted">Noch keine Aktivitäten.</div>}</section>
  </div></main></div>
}