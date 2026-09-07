import "./globals.css";

export const metadata = {
  title: "Macadamia Outbound Engine",
  description: "EPC account discovery engine + CRM — built for Macadamia's Founding GTM Lead application by Ashish Mishra",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
