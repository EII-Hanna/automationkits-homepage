import Link from "next/link";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CustomersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: customers }, { data: payments }, { data: onboardings }, { data: tasks }] = await Promise.all([
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("payments").select("*").order("created_at", { ascending: false }),
    supabase.from("customer_onboarding").select("*"),
    supabase.from("tasks").select("*")
  ]);

  const cs:any[] = customers || [];
  const ps:any[] = payments || [];
  const os:any[] = onboardings || [];
  const ts:any[] = tasks || [];

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <div className="topbar"><strong>Customers</strong><span className="muted">{cs.length} Kunden</span></div>
        <div className="content">
          <h1 className="title">Customers</h1>
          <p className="sub">Jeder Kunde mit Payment-, Portal-, Onboarding- und Delivery-Kontext.</p>

          <div className="customerGrid" style={{ marginTop: 18 }}>
            {cs.map((c:any) => {
              const payment = ps.find((p:any)=>p.customer_id===c.id);
              const onboarding = os.find((o:any)=>o.customer_id===c.id);
              const openTasks = ts.filter((t:any)=>t.customer_id===c.id && t.status!=="done").length;
              return (
                <Link key={c.id} href={`/internal/customers/${c.id}`} className="customer">
                  <div className="customerLogo">{String(c.company_name || c.contact_name || c.email).slice(0,2).toUpperCase()}</div>
                  <h4>{c.company_name || c.contact_name || c.email}</h4>
                  <div className="row"><span className="muted">Status</span><span className="badge">{c.status}</span></div>
                  <div className="row"><span className="muted">Portal</span><span>{c.portal_status || "not_invited"}</span></div>
                  <div className="row"><span className="muted">Onboarding</span><span>{onboarding?.completed_at ? "fertig" : "offen"}</span></div>
                  <div className="row"><span className="muted">Tasks</span><span>{openTasks} offen</span></div>
                  <div className="meta">{payment ? `${Number(payment.amount || 0).toLocaleString("de-DE",{style:"currency",currency:"EUR"})} · ${payment.status}` : "keine Zahlung"}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
