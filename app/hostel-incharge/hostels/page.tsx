"use client";

import HostelTable from "../components/HostelTable";
import styles from "../HostelInchargeDashboard.module.scss";

export default function HostelsPage() {
  return (
    <div>
      <h1 className={styles.title}>
        <span>Hostel Management</span>
      </h1>
      
      <section className={styles.section}>
        <HostelTable />
      </section>
    </div>
  );
}
