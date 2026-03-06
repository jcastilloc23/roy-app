"use client";

import { useState } from "react";

type Tab = "artist" | "writer";

export default function RoyaltyFinderTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("artist");
  const [artistQuery, setArtistQuery] = useState("");
  const [writerQuery, setWriterQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The external bundle (live-search-results.bundle.js) listens for
    // custom events or reads the input values from the DOM.
    // We dispatch a custom event so the widget can pick it up.
    const query = activeTab === "artist" ? artistQuery : writerQuery;
    window.dispatchEvent(
      new CustomEvent("roy:search", {
        detail: { tab: activeTab, query },
      })
    );
  };

  return (
    <section style={{ padding: "0 24px 48px" }}>
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <TabButton
            active={activeTab === "artist"}
            onClick={() => setActiveTab("artist")}
          >
            I&apos;m an artist
          </TabButton>
          <TabButton
            active={activeTab === "writer"}
            onClick={() => setActiveTab("writer")}
          >
            I&apos;m a writer
          </TabButton>
        </div>

        {/* Tab content */}
        <div style={{ padding: "32px" }}>
          {activeTab === "artist" && (
            <ArtistTab
              value={artistQuery}
              onChange={setArtistQuery}
              onSearch={handleSearch}
            />
          )}
          {activeTab === "writer" && (
            <WriterTab
              value={writerQuery}
              onChange={setWriterQuery}
              onSearch={handleSearch}
            />
          )}
        </div>
      </div>
    </section>
  );
}

/* ===== Sub-components ===== */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "16px 24px",
        background: active ? "rgba(0,212,123,0.06)" : "transparent",
        borderBottom: active
          ? "2px solid var(--green)"
          : "2px solid transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.45)",
        fontWeight: active ? 600 : 400,
        fontSize: "15px",
        border: "none",
        borderRadius: 0,
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function ArtistTab({
  value,
  onChange,
  onSearch,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSearch}>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 500,
          color: "rgba(255,255,255,0.55)",
          marginBottom: "8px",
          letterSpacing: "0.02em",
        }}
      >
        Artist name or Spotify URL
      </label>
      <div style={{ display: "flex", gap: "12px" }}>
        <input
          type="text"
          name="artist-search"
          placeholder="e.g. Taylor Swift or spotify.com/artist/..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          style={inputStyle}
        />
        <SearchButton />
      </div>
      <p
        style={{
          marginTop: "10px",
          fontSize: "12px",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        We&apos;ll check the MLC database for unclaimed royalties.
      </p>
    </form>
  );
}

function WriterTab({
  value,
  onChange,
  onSearch,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSearch}>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 500,
          color: "rgba(255,255,255,0.55)",
          marginBottom: "8px",
          letterSpacing: "0.02em",
        }}
      >
        Legal name (first and last)
      </label>
      <div style={{ display: "flex", gap: "12px" }}>
        <input
          type="text"
          name="writer-search"
          placeholder="e.g. Jane Smith"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          style={inputStyle}
        />
        <SearchButton />
      </div>
      <p
        style={{
          marginTop: "10px",
          fontSize: "12px",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        Search by the name registered with your PRO or the MLC.
      </p>
    </form>
  );
}

function SearchButton() {
  return (
    <button
      type="submit"
      style={{
        background: "var(--green)",
        color: "#000",
        fontWeight: 600,
        fontSize: "15px",
        padding: "0 24px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "background 0.2s, transform 0.15s",
        fontFamily: "inherit",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--green-dark)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--green)";
      }}
    >
      Search
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  padding: "12px 16px",
  fontSize: "15px",
  color: "#fff",
  outline: "none",
  transition: "border-color 0.2s",
  fontFamily: "inherit",
};
