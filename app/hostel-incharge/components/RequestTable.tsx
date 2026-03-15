"use client";

import { useEffect, useState } from "react";
import styles from "./StudentTable.module.scss";

interface HostelRequest {
  _id: string;
  studentId: {
    name: string;
    regNo: string;
    branch: string;
    course: string;
  };
  hostelType: string;
  roomPreference: string;
  status: string;
  createdAt: string;
}

export default function RequestTable() {
  const [requests, setRequests] = useState<HostelRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hostel-applications?status=Pending")
      .then((res) => res.json())
      .then((data) => {
        setRequests(data.applications || []);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching requests:", err));
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/hostel-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason: action === "reject" ? "Rejected by Incharge" : undefined }),
      });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error(`Error ${action}ing request:`, err);
    }
  };

  if (loading) return <div>Loading requests...</div>;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Reg No</th>
            <th>Branch</th>
            <th>Hostel Type</th>
            <th>Preference</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {requests.length === 0 ? (
            <tr><td colSpan={6} style={{textAlign: 'center'}}>No pending requests</td></tr>
          ) : (
            requests.map((req) => (
              <tr key={req._id}>
                <td>{req.studentId?.name || "Unknown"}</td>
                <td>{req.studentId?.regNo || "N/A"}</td>
                <td>{req.studentId?.branch || "N/A"}</td>
                <td>{req.hostelType}</td>
                <td>{req.roomPreference}</td>
                <td>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button 
                      onClick={() => handleAction(req._id, "approve")}
                      style={{background: '#10b981', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer'}}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction(req._id, "reject")}
                      style={{background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer'}}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
