"use client";

import SummaryCards from "../components/SummaryCards";
import RoomOccupancyChart from "../components/RoomOccupancyChart";
import styles from "../HostelInchargeDashboard.module.scss";

export default function DashboardOverview() {
  return (
    <div>
      <h1 className={styles.title}>
        <span>Dashboard Overview</span>
      </h1>
      
      <section id="summary">
        <SummaryCards />
      </section>

      <div style={{ marginTop: '2rem' }}>
          <RoomOccupancyChart />
      </div>
    </div>
  );
}
