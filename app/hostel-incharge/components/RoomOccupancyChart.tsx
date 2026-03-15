"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import styles from "./RoomChart.module.scss";

const data = [
  { name: "Occupied", value: 95 },
  { name: "Available", value: 25 },
];

const COLORS = ["#ef4444", "#22c55e"];

export default function RoomOccupancyChart() {
  return (
    <div className={styles.chartCard}>
      <h3>Room Occupancy</h3>

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