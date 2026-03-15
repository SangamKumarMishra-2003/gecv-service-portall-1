"use client";

import Sidebar from "../hostel-incharge/components/Sidebar";
import SummaryCards from "../hostel-incharge/components/SummaryCards";
import StudentTable from "../hostel-incharge/components/StudentTable";
import RoomTable from "../hostel-incharge/components/RoomTable";
import FeeTable from "../hostel-incharge/components/FeeTable";
import RoomOccupancyChart from "../hostel-incharge/components/RoomOccupancyChart";
import RequestTable from "../hostel-incharge/components/RequestTable";
import styles from "./HostelInchargeDashboard.module.scss";

export default function HostelDashboard() {
  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <h1 className={styles.title}>Hostel Incharge Dashboard</h1>

        {/* SUMMARY SECTION */}
        <section id="summary">
          <SummaryCards />
        </section>

        {/* HOSTEL REQUESTS */}
        <section id="requests" className={styles.section}>
          <h2>Pending Hostel Applications</h2>
          <RequestTable />
        </section>

        {/* STUDENT MANAGEMENT */}
        <section id="students" className={styles.section}>
          <h2>Student Management</h2>
          <StudentTable />
        </section>

        {/* ROOM MANAGEMENT */}
        <section id="rooms" className={styles.section}>
          <h2>Room Management</h2>
          <RoomTable />
        </section>

        {/* FEE MANAGEMENT */}
        <section id="fees" className={styles.section}>
          <h2>Hostel Fee Management</h2>
          <FeeTable />
        </section>
      </main>
    </div>
  );
}