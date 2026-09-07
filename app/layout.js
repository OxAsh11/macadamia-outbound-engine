import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Macadamia Outbound Engine",
  description: "Evidence-qualified EPC account discovery + CRM — built for Macadamia's Founding GTM Lead application by Ashish Mishra",
};

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/accounts", label: "Accounts" },
  { href: "/signals", label: "Signals" },
  { href: "/contacts", label: "Contacts" },
  { href: "/model", label: "Model" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <Link href="/" className="brand">🥜 <span>Macadamia</span> <em>Outbound Engine</em></Link>
          <div className="navlinks">
            {NAV.map(n => (
              <Link key={n.href} href={n.href}>{n.label}</Link>
            ))}
          </div>
          <div className="navmode">demo · public data</div>
        </nav>
        <main className="wrap">{children}</main>
        <footer>
          Evidence rule: every claim carries its source link. No account enters the pipeline without a
          source-verified signal. Agents draft, humans judge. · Built by Ashish Mishra · Sep 2026
        </footer>
      </body>
    </html>
  );
}
