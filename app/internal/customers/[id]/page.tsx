import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { completeOnboarding } from "../../actions";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [customerR, onboardingR, paymentsR, phasesR, tasksR] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase.from("customer_onboarding").select("*").eq("customer_id", id).maybeSingle(),
    supabase.from("payments").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("roadmap_phases").select("*").eq("customer_id", id).order("order"),
    supabase.from("tasks").select("*").eq("customer_id", id).order("created_at")
  ]);

  const c:any = customerR.data;
  if (!c) notFound();
  const o:any = onboardingR.data || {};

  return (
    <main className="content" style={{maxWidth:1100, margin:"0 auto"}}>
      <a href="/internal" className="muted">← Command Center</a>
      <h1 className="title" style={{marginTop:12}}>{c.company_name || c.email}</h1>
      <p className="sub">{c.email} · Status {c.status}</p>
      <div className="grid2" style={{marginTop:18}}>
        <div className="section"><h3>Customer Record</h3><div className="row"><span>Kontakt</span><span>{c.contact_name || "—"}</span></div><div className="row"><span>Telefon</span><span>{c.phone || "—"}</span></div><div className="row"><span>Portal</span><span className="badge">{c.portal_status || c.sales_context?.portal_invite_status || "not_invited"}</span></div></div>
        <div className="section"><h3>Billing</h3>{(paymentsR.data || []).map((p:any) => <div className="row" key={p.id}><span>{p.provider}</span><span>{Number(p.amount || 0).toLocaleString("de-DE",{style:"currency",currency:"EUR"})}</span></div>)}</div>
      </div>
      <section className="section">
        <h3>Onboarding</h3>
        <form action={completeOnboarding}>
          <input type="hidden" name="customer_id" value={c.id} />
          <div className="formGrid">
            <div className="field"><label>Unternehmen</label><input name="company_name" defaultValue={o.company_name || c.company_name || ""}/></div>
            <div className="field"><label>Ansprechpartner</label><input name="contact_name" defaultValue={o.contact_name || c.contact_name || ""}/></div>
            <div className="field"><label>Telefon</label><input name="phone" defaultValue={o.phone || c.phone || ""}/></div>
            <div className="field"><label>Website</label><input name="website" defaultValue={o.website || c.sales_context?.website || ""}/></div>
            <div className="field"><label>Teamgröße</label><input name="team_size" defaultValue={o.team_size || c.sales_context?.team_size || ""}/></div>
            <div className="field"><label>Primäres Ziel</label><input name="primary_goal" defaultValue={o.primary_goal || c.sales_context?.primary_goal || ""}/></div>
            <div className="field full"><label>Größter Engpass</label><textarea name="biggest_bottleneck" defaultValue={o.biggest_bottleneck || c.sales_context?.biggest_bottleneck || ""}/></div>
            <div className="field full"><label>Aktuelle Tools</label><textarea name="current_tools" defaultValue={o.current_tools || c.sales_context?.current_tools || ""}/></div>
            <div className="field full"><label>Priorisierte Prozesse</label><textarea name="priority_processes" defaultValue={o.priority_processes || c.sales_context?.priority_processes || ""}/></div>
            <div className="field full"><label>Notizen</label><textarea name="notes" defaultValue={o.notes || c.sales_context?.onboarding_notes || ""}/></div>
          </div>
          <button className="btn primary" style={{marginTop:12}}>Onboarding speichern</button>
        </form>
      </section>
      <div className="grid2"><section className="section"><h3>Roadmap</h3>{(phasesR.data || []).map((p:any) => <div className="row" key={p.id}><span>{p.title}</span><span className="badge">{p.status}</span></div>)}</section><section className="section"><h3>Tasks</h3>{(tasksR.data || []).map((t:any) => <div className="row" key={t.id}><span>{t.title}</span><span className="badge">{t.status}</span></div>)}</section></div>
    </main>
  );
}
