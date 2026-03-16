"use client";

import { useEffect, useState } from "react";
import styles from "./SummaryCards.module.scss";
import { Users, Layout, CheckCircle, Clock, DoorOpen, Building2, IndianRupee } from "lucide-react";

export default function SummaryCards() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    totalHostels: 0,
    availableBeds: 0,
    pendingRequests: 0,
    totalFeeCollected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/hostel-stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  const data = [
    { 
      title: "Total Hostels", 
      value: stats.totalHostels, 
      icon: <Building2 size={24} />,
      color: "#3b82f6"
    },
    { 
      title: "Total Rooms", 
      value: stats.totalRooms, 
      icon: <Layout size={24} />,
      color: "#6366f1"
    },
    { 
      title: "Total Students", 
      value: stats.totalStudents, 
      icon: <Users size={24} />,
      color: "#10b981"
    },
    { 
      title: "Available Beds", 
      value: stats.availableBeds, 
      icon: <DoorOpen size={24} />,
      color: "#06b6d4"
    },
    { 
      title: "Pending Applications", 
      value: stats.pendingRequests, 
      icon: <Clock size={24} />,
      color: "#f59e0b"
    },
    { 
      title: "Total Fee Collected", 
      value: `₹${stats.totalFeeCollected.toLocaleString()}`, 
      icon: <IndianRupee size={24} />,
      color: "#ec4899"
    },
  ];

  if (loading) return <div>Loading counts...</div>;

  return (
    <div className={styles.cards}>
      {data.map((item, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.iconContainer} style={{ color: item.color }}>
            {item.icon}
          </div>
          <div className={styles.content}>
            <h4>{item.title}</h4>
            <p>{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}