
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import styles from "./LoginModal.module.scss";
import animationData from "../public/lottie/login.json";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginModal({
  role,
  onClose,
}: {
  role: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid Credentials");
      }

      // 🔐 Store session
      // For improved security, consider HTTP-only cookies in real production
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      onClose();
      // Redirect based on role
      if (role === "Student") router.push("/student/dashboard");
      else if (role === "Faculty") router.push("/faculty/dashboard");
      else if (role === "Hostel Incharge") router.push("/hostel-incharge");
      else router.push("/academics/dashboard");

    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.95, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 40 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className={styles.close} onClick={onClose}>✕</button>

            <div className={styles.modalGrid}>
            <div className={styles.lottieBox}>
              <Lottie animationData={animationData} loop />
            </div>

            <div className={styles.formBox}>
              <h2 className={styles.title}>{role} Login</h2>

              <form className={styles.form} onSubmit={handleLogin}>
                {role === "Student" ? (
                    <input
                    placeholder="Registration Number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    />
                ) : (
                    <input
                    type="email"
                    placeholder="Email Address"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    />
                )}
                
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                 {error && <p className={styles.error}>{error}</p>}

                <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className={styles.hint}>
                {role === 'Student' ? "Default: RegNo: 21105152003, Password: password123" : "Use your registered email (password: password123)"}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

