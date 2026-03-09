import Navbar from "@/components/Navbar";
import ToolSidebar from "@/components/ToolSidebar";

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>
        <ToolSidebar />
        <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </>
  );
}
