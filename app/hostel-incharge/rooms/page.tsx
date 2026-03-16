"use client";

import RoomTable from "../components/RoomTable";
import styles from "../HostelInchargeDashboard.module.scss";

export default function RoomsPage() {
  return (
    <div>
      <h1 className={styles.title}>
        <span>Room Inventory & Management</span>
      </h1>
      
      <section className={styles.section}>
        <RoomTable />
      </section>
    </div>
  );
}
