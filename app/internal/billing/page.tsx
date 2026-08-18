import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export default async function BillingPage(){
  const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
  const [{data:customers},{data:payments}]=await Promise.all([
    supabase.from("customers").select("id,company_name,email,status"),
    supabase.from("payments").select("*").order("created_at",{ascending:false})
  ]);
  const total=(payments||[]).filter((p:any)=>["paid","test_paid"].includes(p.status)).reduce((s:number,p:any)=>s+Number(p.amount||0),0);
  return <div className="app"><Sidebar/><main className="main"><div className="topbar"><strong>Billing</strong><span className="muted">{user.email}</span></div><div className="content">
    <h1 className="title">Billing</h1><p className="sub">CopeCart-Zahlungen und Zahlungsstatus pro Kunde.</p>
    <div className="kpis"><div className="kpi"><small>ZAHLUNGEN</small><b>{(payments||[]).length}</b></div><div className="kpi"><small>VOLUMEN</small><b>{total.toLocaleString("de-DE",{style:"currency",currency:"EUR"})}</b></div><div className="kpi"><small>PROVIDER</small><b>CopeCart</b></div><div className="kpi"><small>STATUS</small><b className="good">live</b></div></div>
    <section className="section"><h3>Zahlungen</h3>{(payments||[]).length?(payments||[]).map((p:any)=>{const c=(customers||[]).find((x:any)=>x.id===p.customer_id);return <div className="row" key={p.id}><span><b>{c?.company_name||c?.email||"Kunde"}</b><br/><span className="muted">{p.provider} · {p.external_id||"—"}</span></span><span><b>{Number(p.amount||0).toLocaleString("de-DE",{style:"currency",currency:"EUR"})}</b><br/><span className="badge">{p.status}</span></span></div>}):<div className="muted">Noch keine Zahlungen.</div>}</section>
  </div></main></div>
}