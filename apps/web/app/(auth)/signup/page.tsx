"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";
import Link from "next/link";

const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $displayName: String!) {
    signup(email: $email, password: $password, displayName: $displayName) {
      token
      user {
        id
        displayName
      }
    }
  }
`;

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [signup, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      setToken(data.signup.token);
      router.push("/editor");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    signup({ variables: form });
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid rgba(44,58,68,0.15)",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box" as const,
    background: "#faf8f5",
    color: "#1a2530",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf8f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(44,58,68,0.1)",
          borderRadius: "16px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 2px 40px rgba(26,37,48,0.06)",
        }}
      >
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #7aab9c, #d4872a)",
              borderRadius: "10px",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            ✦
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "400",
              color: "#1a2530",
              margin: 0,
            }}
          >
            Create your journal
          </h1>
          <p style={{ color: "#8a9aa8", fontSize: "14px", marginTop: "4px" }}>
            Join EchoMind — it's free
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(196,115,106,0.1)",
              border: "1px solid rgba(196,115,106,0.3)",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#7a3e38",
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            {
              key: "displayName",
              label: "Your name",
              type: "text",
              placeholder: "Anubhav Mishra",
            },
            {
              key: "email",
              label: "Email",
              type: "email",
              placeholder: "you@example.com",
            },
            {
              key: "password",
              label: "Password",
              type: "password",
              placeholder: "••••••••",
            },
          ].map((field) => (
            <div key={field.key} style={{ marginBottom: "16px" }}>
              <label
                suppressHydrationWarning
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "#4a5c68",
                  marginBottom: "6px",
                }}
              >
                {field.label}
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type={
                    field.key === "password"
                      ? showPassword
                        ? "text"
                        : "password"
                      : field.type
                  }
                  value={(form as any)[field.key]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  required
                  style={{
                    ...inputStyle,
                    paddingRight: field.key === "password" ? "70px" : "12px",
                  }}
                  placeholder={field.placeholder}
                />

                {field.key === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "transparent",
                      border: "none",
                      color: "#4a7c6f",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                )}
              </div>
            </div>
          ))}

          <div style={{ marginTop: "8px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                background: loading ? "#8a9aa8" : "#4a7c6f",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "13px",
            color: "#8a9aa8",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "#4a7c6f",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
