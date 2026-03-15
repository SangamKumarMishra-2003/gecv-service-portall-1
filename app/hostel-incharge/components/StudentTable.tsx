"use client";

import { useState } from "react";
import styles from "./StudentTable.module.scss";

interface Student {
  name: string;
  regNo: string;
  branch: string;
  room: string;
  contact: string;
}

export default function StudentTable() {

  const [search, setSearch] = useState("");

  const students: Student[] = [
    { name: "Rahul Kumar", regNo: "REG101", branch: "CSE", room: "A101", contact: "9876543210" },
    { name: "Anjali Singh", regNo: "REG102", branch: "IT", room: "A102", contact: "9876543211" },
  ];

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNo.toLowerCase().includes(search.toLowerCase())
  );

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
              <th>Room</th>
              <th>Contact</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((s, i) => (
              <tr key={i}>
                <td>{s.name}</td>
                <td>{s.regNo}</td>
                <td>{s.branch}</td>
                <td>{s.room}</td>
                <td>{s.contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}