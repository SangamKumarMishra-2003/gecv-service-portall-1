"use client";

import { useEffect, useState } from "react";
import styles from "./SummaryCards.module.scss";

export default function SummaryCards() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hostel-stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  const data = [
    { title: "Total Students", value: stats.totalStudents },
    { title: "Total Rooms", value: stats.totalRooms },
    { title: "Occupied Rooms", value: stats.occupiedRooms },
    { title: "Available Rooms", value: stats.availableRooms },
    { title: "Pending Requests", value: stats.pendingRequests },
  ];

  if (loading) return <div>Loading counts...</div>;

  return (
    <div className={styles.cards}>
      {data.map((item, index) => (
        <div key={index} className={styles.card}>
          <h4>{item.title}</h4>
          <p>{item.value}</p>
        </div>
      ))}
    </div>
  );
}