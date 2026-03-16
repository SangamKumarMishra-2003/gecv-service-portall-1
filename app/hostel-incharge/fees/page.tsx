"use client";

import FeeTable from "../components/FeeTable";
import styles from "../HostelInchargeDashboard.module.scss";

export default function FeesPage() {
  return (
    <div>
      <h1 className={styles.title}>
        <span>Fee Collection</span>
      </h1>
      
      <section className={styles.section}>
        <FeeTable />
      </section>
    </div>
  );
}
