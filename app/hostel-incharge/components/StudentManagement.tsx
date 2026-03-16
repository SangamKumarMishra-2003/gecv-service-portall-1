"use client";

import { useEffect, useState } from "react";
import styles from "./StudentTable.module.scss";

interface Student {
  _id: string;
  name: string;
  regNo: string;
  rollNo?: string;
  gender?: string;
  course?: string;
  branch?: string;
  year?: number;
  semester?: number;
  mobile: string;
  email: string;
}

export default function StudentManagement() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/hostel-applications", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        // Extract student details from application documents
        const applicants = (data.applications || []).map((app: any) => ({
          ...app.studentId, // This is the populated student info
          applicationStatus: app.status,
          appliedDate: app.createdAt
        }));
        
        // Remove duplicates if any (though usually one per student)
        const uniqueApplicants = Array.from(new Map(applicants.map((a: any) => [a._id, a])).values()) as Student[];
        
        setStudents(uniqueApplicants);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNo.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
      s.branch?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading students...</div>;

  return (
    <div className={styles.studentSection}>
        <div className={styles.header}>
            <input
                type="text"
                placeholder="Search by name, roll no, or reg no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.search}
            />
        </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll No / Reg No</th>
              <th>Gender</th>
              <th>Course / Branch</th>
              <th>Year / Sem</th>
              <th>Contact Info</th>
            </tr>
          </thead>

          <tbody>
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign: 'center'}}>No students found</td></tr>
              ) : (
              filteredStudents.map((s) => (
                <tr key={s._id}>
                  <td>
                      <div className={styles.studentName}>
                          <strong>{s.name}</strong>
                          <span style={{fontSize: '11px', color: '#64748b'}}>{s.email}</span>
                      </div>
                  </td>
                  <td>
                      <div>{s.rollNo || "N/A"}</div>
                      <div style={{fontSize: '11px', color: '#64748b'}}>{s.regNo}</div>
                  </td>
                  <td>{s.gender || "N/A"}</td>
                  <td>{s.course} / {s.branch}</td>
                  <td>Year {s.year || "1"}, Sem {s.semester || "1"}</td>
                  <td>{s.mobile || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
