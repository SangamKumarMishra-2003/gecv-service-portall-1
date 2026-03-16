"use client";

import { useEffect, useState } from "react";
import styles from "./StudentTable.module.scss";

interface Resident {
  _id: string;
  name: string;
  regNo: string;
  rollNo?: string;
  hostel?: string;
  room?: string;
  bedNo?: string;
}

export default function ResidentDirectory() {
  const [search, setSearch] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/hostelers", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setResidents(data.hostelers || []);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching residents:", err));
  }, []);

  const filteredResidents = residents.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.regNo.toLowerCase().includes(search.toLowerCase()) ||
      r.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
      r.hostel?.toLowerCase().includes(search.toLowerCase()) ||
      r.room?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading resident directory...</div>;

  return (
    <div className={styles.studentSection}>
        <div className={styles.header}>
            <input
                type="text"
                placeholder="Search by student, hostel, or room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.search}
            />
        </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll No / Reg No</th>
              <th>Hostel Name</th>
              <th>Room No</th>
              <th>Bed No</th>
            </tr>
          </thead>

          <tbody>
              {filteredResidents.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign: 'center'}}>No residents found</td></tr>
              ) : (
              filteredResidents.map((r) => (
                <tr key={r._id}>
                  <td><strong>{r.name}</strong></td>
                  <td>
                      <div>{r.rollNo || "N/A"}</div>
                      <div style={{fontSize: '11px', color: '#64748b'}}>{r.regNo}</div>
                  </td>
                  <td>{r.hostel || "N/A"}</td>
                  <td>{r.room || "N/A"}</td>
                  <td>
                      <span className={styles.activeBadge}>Bed: {r.bedNo || "N/A"}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
