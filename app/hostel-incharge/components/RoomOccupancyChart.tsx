"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import styles from "./RoomChart.module.scss";

const COLORS = ["#f43f5e", "#10b981"];

export default function RoomOccupancyChart() {
  const [data, setData] = useState([
    { name: "Occupied", value: 0 },
    { name: "Available", value: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/hostel-stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((stats) => {
        setData([
          { name: "Occupied", value: stats.occupiedRooms || 0 },
          { name: "Available", value: stats.availableRooms || 0 },
        ]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching chart data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'}}>Loading Chart...</div>;

  return (
    <div className={styles.chartCard}>
      <h3>Room Occupancy (Beds)</h3>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}