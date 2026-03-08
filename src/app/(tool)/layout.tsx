import ToolNavbar from "@/components/ToolNavbar";

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <ToolNavbar />
      {children}
    </div>
  );
}
