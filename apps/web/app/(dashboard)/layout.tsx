"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isLoggedIn, removeToken } from "@/lib/auth";
import { useQuery, gql } from "@apollo/client";

const ME_QUERY = gql`
  query {
    me {
      id
      displayName
      role
    }
  }
`;

const NAV_ITEMS = [
  { href: "/editor", icon: "✏️", label: "Write Entry" },
  { href: "/entries", icon: "📅", label: "Past Entries" },
  { href: "/insights", icon: "📊", label: "Mood Trends" },
  { href: "/chat", icon: "💬", label: "Chat with Diary" },
  { href: "/report", icon: "📄", label: "Weekly Report" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const { data } = useQuery(ME_QUERY, {
    skip: !mounted,
    onError: () => router.push("/login"),
  });

  const isAdmin = data?.me?.role === "ADMIN";

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("echomind_token");
    if (!token) router.push("/login");
  }, [router]);

  if (!mounted) return null;

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <div
      // className="animated-bg"
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        // backgroundImage: "radial-gradient(circle at 0 0, #1e2a35, #1b252e)",
        backgroundImage: "url('/bg3.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      <aside
        style={{
          background: "#2c3a44",
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                background: "linear-gradient(135deg, #7aab9c, #d4872a)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
            >
              ✦
            </div>
            <span
              style={{ fontSize: "18px", fontWeight: "400", color: "#fff" }}
            >
              EchoMind
            </span>
          </div>
        </div>

        <nav style={{ padding: "12px 10px", flex: 1 }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "500",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
              padding: "8px 10px 6px",
              marginBottom: "10px",
            }}
          >
            Journal
          </div>
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 10px",
                    borderRadius: "8px",
                    color: active ? "#7aab9c" : "rgba(255,255,255,0.55)",
                    background: active
                      ? "rgba(74,124,111,0.25)"
                      : "transparent",
                    fontSize: "13px",
                    fontWeight: active ? "500" : "400",
                    borderLeft: active
                      ? "3px solid #7aab9c"
                      : "3px solid transparent",
                    marginBottom: "2px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            );
          })}
          {isAdmin && (
            <>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "500",
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)",
                  padding: "12px 10px 6px",
                }}
              >
                Admin
              </div>
              <Link href="/admin" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 10px",
                    borderRadius: "8px",
                    color:
                      pathname === "/admin"
                        ? "#c4736a"
                        : "rgba(255,255,255,0.45)",
                    background:
                      pathname === "/admin"
                        ? "rgba(196,115,106,0.1)"
                        : "transparent",
                    fontSize: "13px",
                    borderLeft:
                      pathname === "/admin"
                        ? "3px solid #c4736a"
                        : "3px solid transparent",
                    marginBottom: "2px",
                    cursor: "pointer",
                  }}
                >
                  <span>🛡️</span>
                  Admin Panel
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "8px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "rgba(255,255,255,0.4)",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ overflow: "auto" }}>{children}</main>
    </div>
  );
}
