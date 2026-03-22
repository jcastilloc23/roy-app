"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SummaryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="4" height="18" rx="1" />
    <rect x="10" y="8" width="4" height="13" rx="1" />
    <rect x="17" y="13" width="4" height="8" rx="1" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const TalkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const tabs = [
  { label: "Summary",     href: "/roy-tool",           Icon: SummaryIcon },
  { label: "Analytics",   href: "/roy-tool/analytics", Icon: AnalyticsIcon },
  { label: "Talk to Roy", href: "/roy-tool/talk",      Icon: TalkIcon },
];

export default function ToolTabBar() {
  const pathname = usePathname();
  return (
    <nav className="tool-tabbar">
      {tabs.map(({ label, href, Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={`tool-tabbar-item${active ? " active" : ""}`}>
            <span className="tool-tabbar-icon"><Icon /></span>
            <span className="tool-tabbar-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
