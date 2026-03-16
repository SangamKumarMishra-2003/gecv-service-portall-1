"use client";

import ResidentDirectory from "../components/ResidentDirectory";
import styles from "../HostelInchargeDashboard.module.scss";

export default function ResidentsPage() {
  return (
    <div>
      <h1 className={styles.title}>
        <span>Resident Directory</span>
      </h1>
      
      <section className={styles.section}>
        <ResidentDirectory />
      </section>
    </div>
  );
}
