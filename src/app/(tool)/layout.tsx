import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ToolSidebar from "@/components/ToolSidebar";
import ToolTabBar from "@/components/ToolTabBar";

export const metadata: Metadata = {
  title: "Roy Tool",
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tool-shell">
      <Navbar />
      <div className="tool-body">
        <ToolSidebar />
        <main className="tool-main">{children}</main>
      </div>
      <ToolTabBar />
    </div>
  );
}
