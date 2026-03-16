"use client";

import StudentManagement from "../components/StudentManagement";
import styles from "../HostelInchargeDashboard.module.scss";

export default function StudentsPage() {
  return (
    <div>
      <h1 className={styles.title}>
        <span>Student Details</span>
      </h1>
      
      <section className={styles.section}>
        <StudentManagement />
      </section>
    </div>
  );
}
