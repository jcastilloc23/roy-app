import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
      <Link href="/" style={{ color: "var(--text-muted)", fontSize: "14px", textDecoration: "none" }}>
        ← Back to Home
      </Link>
      <SignIn />
    </main>
  );
}
