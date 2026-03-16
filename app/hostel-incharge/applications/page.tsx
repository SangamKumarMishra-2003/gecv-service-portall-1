"use client";

import RequestTable from "../components/RequestTable";
import styles from "../HostelInchargeDashboard.module.scss";

export default function ApplicationsPage() {
  return (
    <div>
      <h1 className={styles.title}>
        <span>Hostel Allotment Applications</span>
      </h1>
      
      <section className={styles.section}>
        <RequestTable />
      </section>
    </div>
  );
}
