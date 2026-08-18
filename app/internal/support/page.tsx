import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { setSupportTicketStatus } from "../actions";

export default async function SupportPage(){
  const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
  const [{data:customers},{data:tickets}]=await Promise.all([
    supabase.from("customers").select("id,company_name,email"),
    supabase.from("support_tickets").select("*").order("created_at",{ascending:false})
  ]);
  return <div className="app"><Sidebar/><main className="main"><div className="topbar"><strong>Support</strong><span className="muted">{user.email}</span></div><div className="content">
    <h1 className="title">Support</h1><p className="sub">Kundenanfragen zentral bearbeiten.</p>
    <section className="section"><h3>Tickets</h3>{(tickets||[]).length?(tickets||[]).map((t:any)=>{const c=(customers||[]).find((x:any)=>x.id===t.customer_id);return <div className="row" key={t.id}><span><b>{t.subject}</b><br/><span className="muted">{c?.company_name||c?.email||"Kunde"} · {t.message}</span></span><form action={setSupportTicketStatus}><input type="hidden" name="ticket_id" value={t.id}/><select className="control" name="status" defaultValue={t.status}><option value="open">open</option><option value="answered">answered</option><option value="closed">closed</option></select><button className="btn">Speichern</button></form></div>}):<div className="muted">Keine Tickets.</div>}</section>
  </div></main></div>
}