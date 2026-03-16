"use client";

import Sidebar from "./components/Sidebar";
import styles from "./HostelInchargeDashboard.module.scss";

export default function HostelInchargeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
