"use client";

import { useEffect, useState } from "react";
import styles from "./HostelInchargeDashboard.module.scss";

interface HostelRequest {
  _id: string;
  student: {
    name: string;
    regNo: string;
    email: string;
    branch: string;
    year: number;
    mobile: string;
  };
  roomType: string;
  status: string;
  agreementUrl?: string;
  createdAt: string;
}

interface Hosteler {
  _id: string;
  name: string;
  regNo: string;
  branch: string;
  year: number;
  mobile: string;
}

export default function HostelInchargeDashboard() {
  const [requests, setRequests] = useState<HostelRequest[]>([]);
  const [hostelers, setHostelers] = useState<Hosteler[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchHostelers();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    // TODO: Replace with your API endpoint
    const res = await fetch("/api/hostel-requests");
    const data = await res.json();
    setRequests(data.requests || []);
    setLoading(false);
  }

  async function fetchHostelers() {
    // TODO: Replace with your API endpoint
    const res = await fetch("/api/hostelers");
    const data = await res.json();
    setHostelers(data.hostelers || []);
  }

  async function handleApprove(id: string) {
    setActionLoading(true);
    await fetch(`/api/hostel-requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" })
    });
    await fetchRequests();
    await fetchHostelers();
    setActionLoading(false);
  }

  async function handleReject(id: string) {
    setActionLoading(true);
    await fetch(`/api/hostel-requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" })
    });
    await fetchRequests();
    setActionLoading(false);
  }

  async function handleRemoveHosteler(id: string) {
    setActionLoading(true);
    await fetch(`/api/hostelers/${id}/remove`, { method: "POST" });
    await fetchHostelers();
    setActionLoading(false);
  }

  return (
    <div className={styles.hostelInchargeDashboard}>
      <h2>Hostel Incharge Dashboard</h2>
      <section>
        <h3>Pending Hostel Room Requests</h3>
        {loading ? (
          <div>Loading...</div>
        ) : requests.length === 0 ? (
          <div>No pending requests.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Reg No</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Mobile</th>
                <th>Room Type</th>
                <th>Agreement</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>{req.student.name}</td>
                  <td>{req.student.regNo}</td>
                  <td>{req.student.branch}</td>
                  <td>{req.student.year}</td>
                  <td>{req.student.mobile}</td>
                  <td>{req.roomType}</td>
                  <td>
                    {req.agreementUrl ? (
                      <a href={req.agreementUrl} target="_blank" rel="noopener noreferrer">View</a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{req.status}</td>
                  <td>
                    {req.status === "pending" && (
                      <>
                        <button onClick={() => handleApprove(req._id)} disabled={actionLoading}>Approve</button>
                        <button onClick={() => handleReject(req._id)} disabled={actionLoading}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section className={styles.hostelersSection}>
        <h3>Hostelers List</h3>
        {hostelers.length === 0 ? (
          <div>No hostelers found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Reg No</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Mobile</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostelers.map((h) => (
                <tr key={h._id}>
                  <td>{h.name}</td>
                  <td>{h.regNo}</td>
                  <td>{h.branch}</td>
                  <td>{h.year}</td>
                  <td>{h.mobile}</td>
                  <td>
                    <button onClick={() => handleRemoveHosteler(h._id)} disabled={actionLoading}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
