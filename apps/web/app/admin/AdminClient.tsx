"use client";

import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

const ME_QUERY = gql`
  query {
    me {
      id
      displayName
      email
      role
    }
  }
`;

const ADMIN_QUERY = gql`
  query {
    adminStats {
      totalUsers
      activeThisWeek
      avgMoodPlatform
      totalEntries
    }
    adminUsers(limit: 20) {
      id
      displayName
      email
      role
      createdAt
      entries {
        id
      }
    }
  }
`;

export default function AdminClient() {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.push("/login");
  }, [router]);

  const { data: meData, loading: meLoading } = useQuery(ME_QUERY, {});

  const isAdmin = meData?.me?.role === "ADMIN";
  const roleConfirmed = !meLoading && !!meData;
  const shouldFetchAdmin = roleConfirmed && isAdmin;

  const {
    data,
    loading: adminLoading,
    error: adminError,
  } = useQuery(ADMIN_QUERY, {
    skip: !shouldFetchAdmin,
    fetchPolicy: "network-only",
  });

  if (meLoading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f1e1a",
          fontSize: "14px",
          color: "#8a9aa8",
        }}
      >
        Verifying admin access...
      </div>
    );

  if (roleConfirmed && !isAdmin)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f1e1a",
          fontFamily: "system-ui, sans-serif",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            background: "rgba(196,115,106,0.1)",
            border: "1px solid rgba(196,115,106,0.3)",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
          }}
        >
          🔒
        </div>
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              color: "#fff",
              fontSize: "18px",
              fontWeight: "400",
              margin: "0 0 6px",
            }}
          >
            Access Denied
          </h2>
          <p style={{ color: "#8a9aa8", fontSize: "13px", margin: 0 }}>
            You don't have permission to view this page.
          </p>
          <p style={{ color: "#4a5c68", fontSize: "12px", marginTop: "4px" }}>
            Admin role required.
          </p>
        </div>
        <button
          onClick={() => router.push("/editor")}
          style={{
            marginTop: "8px",
            padding: "9px 20px",
            background: "#4a7c6f",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          ← Back to App
        </button>
      </div>
    );

  if (adminLoading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f1e1a",
          fontSize: "14px",
          color: "#8a9aa8",
        }}
      >
        Loading admin panel...
      </div>
    );

  const stats = data?.adminStats;
  const users = data?.adminUsers || [];

  const statCardStyle: React.CSSProperties = {
    background: "rgba(250,250,250,0.4)",
    border: "2px solid rgba(44,58,68,0.08)",
    borderRadius: "10px",
    padding: "16px 20px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url(/bg3.jpg)",
        fontFamily: "system-ui, sans-serif",
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      <div
        style={{
          background: "#2c3a44",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
          <span style={{ color: "#fff", fontSize: "16px" }}>EchoMind</span>
          <span
            style={{
              fontSize: "10px",
              padding: "2px 8px",
              background: "rgba(196,115,106,0.2)",
              border: "1px solid rgba(196,115,106,0.3)",
              borderRadius: "10px",
              color: "#c4736a",
              marginLeft: "4px",
            }}
          >
            ADMIN
          </span>
        </div>
        <button
          onClick={() => router.push("/editor")}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.6)",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          ← Back to App
        </button>
      </div>

      <div style={{ padding: "24px 32px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "400",
            color: "#1a2530",
            marginBottom: "4px",
          }}
        >
          Platform Overview
        </h2>
        <p style={{ fontSize: "14px", color: "#aec7e8", marginBottom: "24px" }}>
          {new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {[
            {
              label: "Total Users",
              value: stats?.totalUsers || 0,
              color: "#4a7c6f",
            },
            {
              label: "Active This Week",
              value: stats?.activeThisWeek || 0,
              color: "#d4872a",
            },
            {
              label: "Avg Mood Score",
              value: stats?.avgMoodPlatform?.toFixed(1) || "0.0",
              color: "#7b9bc8",
            },
            {
              label: "Total Entries",
              value: stats?.totalEntries || 0,
              color: "#4a5c68",
            },
          ].map((s) => (
            <div key={s.label} style={statCardStyle}>
              <div
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: "#2c3a44",
                  marginBottom: "4px",
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "300",
                  color: s.color,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div
          style={{
            background: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(44,58,68,0.18)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid rgba(44,58,68,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(44, 58, 68, 0.3)",
            }}
          >
            <span
              style={{ fontSize: "13px", fontWeight: "500", color: "#1a2530" }}
            >
              Users ({users.length})
            </span>
          </div>

          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
              padding: "10px 20px",
              background: "rgba(255,255,255,0.5)",
              borderBottom: "1px solid rgba(44,58,68,0.06)",
              fontSize: "10px",
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              color: "#2c3a44",
            }}
          >
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Entries</span>
            <span>Joined</span>
          </div>

          {/* Table rows */}
          {users.map((user: any) => (
            <div
              key={user.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
                padding: "12px 20px",
                background: "rgba(255,255,255,0.2)",
                borderBottom: "1px solid rgba(44,58,68,0.04)",
                fontSize: "13px",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "500", color: "#1a2530" }}>
                {user.displayName}
              </span>
              <span style={{ color: "#4a5c68", fontSize: "12px" }}>
                {user.email}
              </span>
              <span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontSize: "10px",
                    background:
                      user.role === "ADMIN"
                        ? "rgba(196,115,106,0.1)"
                        : "rgba(74,124,111,0.1)",
                    color: user.role === "ADMIN" ? "#c4736a" : "#4a7c6f",
                    fontWeight: "500",
                  }}
                >
                  {user.role}
                </span>
              </span>
              <span style={{ color: "#4a5c68" }}>
                {user.entries?.length || 0}
              </span>
              <span style={{ color: "#8a9aa8", fontSize: "12px" }}>
                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
