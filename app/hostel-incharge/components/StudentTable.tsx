"use client";

import { useEffect, useState } from "react";
import styles from "./StudentTable.module.scss";

interface Student {
  _id: string;
  name: string;
  regNo: string;
  branch: string;
  year?: number;
  mobile: string;
  room?: string;
}

export default function StudentTable() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hostelers")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.hostelers || []);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching hostelers:", err));
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNo.toLowerCase().includes(search.toLowerCase()) ||
      s.branch?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading students...</div>;

  return (
    <div className={styles.studentSection}>
      <input
        type="text"
        placeholder="Search student..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.search}
      />

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Reg No</th>
              <th>Branch</th>
              <th>Mobile</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign: 'center'}}>No students found</td></tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.regNo}</td>
                  <td>{s.branch || "N/A"}</td>
                  <td>{s.mobile || "N/A"}</td>
                  <td><span className={styles.activeBadge}>Resident</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}