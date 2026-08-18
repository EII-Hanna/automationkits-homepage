import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand"><div className="logo">AK</div>AutomationKits</div>
      <nav className="nav">
        <div className="group">ÜBERSICHT</div>
        <Link className="active" href="/internal">Command Center</Link>
        <Link href="/internal#customers">Customers</Link>
        <div className="group">OPERATIONS</div>
        <Link href="/internal#onboarding">Onboarding</Link>
        <Link href="/internal#delivery">Delivery</Link>
        <Link href="/internal#tasks">Tasks</Link>
        <Link href="/internal#blockers">Blockers</Link>
        <Link href="/internal#results">Results</Link>
        <Link href="/internal#support">Support</Link>
        <Link href="/internal#activity">Activity</Link>
        <div className="group">PLATFORM</div>
        <Link href="/internal#billing">Billing</Link>
        <Link href="/portal">Kundenportal</Link>
      </nav>
      <div className="user">Production V1 · Next.js</div>
    </aside>
  );
}
