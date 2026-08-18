import Link from "next/link";

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    command: <><path d="M4 5.5h6.5V12H4z"/><path d="M13.5 5.5H20V9h-6.5z"/><path d="M13.5 12H20v6.5h-6.5z"/><path d="M4 15h6.5v3.5H4z"/></>,
    customers: <><circle cx="9" cy="8" r="3"/><path d="M3.8 18c.7-3.2 2.4-5 5.2-5s4.5 1.8 5.2 5"/><path d="M16 7.2c2.5.2 4.2 1.8 4.6 4.1"/><path d="M16 13.7c2.3.4 3.7 1.8 4.2 4.3"/></>,
    onboarding: <><rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M8 8.5h8"/><path d="m8 13 2 2 5-5"/></>,
    delivery: <><path d="M4 7.5 12 4l8 3.5-8 3.5z"/><path d="M4 7.5V16l8 4 8-4V7.5"/><path d="M12 11v9"/></>,
    tasks: <><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 9 1.5 1.5L12 8"/><path d="M14 9h3"/><path d="m8 15 1.5 1.5L12 14"/><path d="M14 15h3"/></>,
    blockers: <><path d="M12 3.5 20.5 18H3.5z"/><path d="M12 9v4.5"/><path d="M12 17h.01"/></>,
    results: <><path d="M5 18V11"/><path d="M10 18V7"/><path d="M15 18V13"/><path d="M20 18V4"/></>,
    support: <><path d="M5 16.5a7 7 0 1 1 14 0"/><path d="M5 16.5V19h3v-5H5z"/><path d="M19 16.5V19h-3v-5h3z"/></>,
    activity: <path d="M3.5 12h4l2.2-5.5 4.5 11 2.1-5.5h4.2"/>,
    billing: <><rect x="3.5" y="6" width="17" height="12" rx="2.5"/><path d="M3.5 10h17"/><path d="M7 14.5h4"/></>,
    portal: <><path d="M5 4h14v16H5z"/><path d="M9 8h6M9 12h6M9 16h3"/></>
  };
  return <span className="icon"><svg viewBox="0 0 24 24">{paths[name]}</svg></span>;
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand"><div className="logo">AK</div>AutomationKits</div>
      <nav className="nav">
        <div className="group">ÜBERSICHT</div>
        <Link href="/internal"><Icon name="command"/>Command Center</Link>
        <Link href="/internal/customers"><Icon name="customers"/>Customers</Link>
        <div className="group">OPERATIONS</div>
        <Link href="/internal/onboarding"><Icon name="onboarding"/>Onboarding</Link>
        <Link href="/internal/delivery"><Icon name="delivery"/>Delivery</Link>
        <Link href="/internal#tasks"><Icon name="tasks"/>Tasks</Link>
        <Link href="/internal#blockers"><Icon name="blockers"/>Blockers</Link>
        <Link href="/internal#results"><Icon name="results"/>Results</Link>
        <Link href="/internal#support"><Icon name="support"/>Support</Link>
        <Link href="/internal#activity"><Icon name="activity"/>Activity</Link>
        <div className="group">PLATFORM</div>
        <Link href="/internal#billing"><Icon name="billing"/>Billing</Link>
        <Link href="/portal"><Icon name="portal"/>Kundenportal</Link>
      </nav>
      <div className="user">Production V1 · Next.js</div>
    </aside>
  );
}
