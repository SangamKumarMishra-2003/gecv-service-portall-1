"use client";

import { useEffect, useState } from "react";
import styles from "./RequestTable.module.scss";
import { ClipboardList, CheckCircle, XCircle, RefreshCw, User, Calendar, Home } from "lucide-react";

interface HostelRequest {
  _id: string;
  studentId: {
    _id: string;
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

interface Room {
  _id: string;
  roomNo: string;
  floor: string;
  hostelId: string;
  beds: { bedNo: string; isOccupied: boolean }[];
}

interface Hostel {
  _id: string;
  name: string;
  type?: string;
}

export default function RequestTable() {
  const [requests, setRequests] = useState<HostelRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningReq, setAssigningReq] = useState<HostelRequest | null>(null);
  const [rejectingReq, setRejectingReq] = useState<HostelRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBed, setSelectedBed] = useState("");

  const fetchData = () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    Promise.all([
      fetch("/api/hostel-applications?status=Pending", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch("/api/rooms", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch("/api/hostels", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json())
    ]).then(([appData, roomData, hostelData]) => {
      setRequests(appData.applications || []);
      setRooms(roomData.rooms || []);
      setHostels(hostelData.hostels || []);
      setLoading(false);
    }).catch((err) => {
      console.error("Error fetching data:", err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (action === "approve") {
      const req = requests.find(r => r._id === id);
      if (req) setAssigningReq(req);
      return;
    }

    if (action === "reject") {
      const req = requests.find(r => r._id === id);
      if (req) setRejectingReq(req);
      return;
    }

    try {
      const res = await fetch(`/api/hostel-applications/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, rejectionReason: "Rejected by Incharge" }),
      });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error(`Error ${action}ing request:`, err);
    }
  };

  const submitRejection = async () => {
    if (!rejectingReq || !rejectionReason) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const res = await fetch(`/api/hostel-applications/${rejectingReq._id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: "reject", rejectionReason }),
      });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r._id !== rejectingReq._id));
        setRejectingReq(null);
        setRejectionReason("");
      }
    } catch (err) {
      console.error("Rejection error:", err);
    }
  };

  const submitAssignment = async () => {
    if (!assigningReq || !selectedRoom || !selectedBed) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      // 1. Approve Application
      const approveRes = await fetch(`/api/hostel-applications/${assigningReq._id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: "approve" }),
      });

      if (!approveRes.ok) throw new Error("Failed to approve application");

      // 2. Assign Room
      const assignRes = await fetch("/api/hostelers", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: assigningReq.studentId._id,
          roomId: selectedRoom._id,
          bedNo: selectedBed
        }),
      });

      if (assignRes.ok) {
        setRequests(prev => prev.filter(r => r._id !== assigningReq._id));
        setAssigningReq(null);
        setSelectedRoom(null);
        setSelectedBed("");
        alert("Student assigned successfully!");
      } else {
        const errData = await assignRes.json();
        alert(errData.error || "Failed to assign student");
      }
    } catch (err) {
      console.error("Assignment error:", err);
    }
  };

  if (loading) return <div style={{padding: '20px', color: '#64748b', fontSize: '14px'}}>Loading applications...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.statusInfo}>
          <ClipboardList size={20} color="#3b82f6" />
          <span>{requests.length} Pending Applications</span>
        </div>
        <button className={styles.refreshBtn} onClick={fetchData} title="Refresh data">
          <RefreshCw size={16} className={loading ? styles.spinning : ""} />
          Refresh
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th><div className={styles.thContent}><User size={14}/> Student</div></th>
              <th>Reg No</th>
              <th><div className={styles.thContent}><Calendar size={14}/> Applied On</div></th>
              <th>Hostel Type</th>
              <th><div className={styles.thContent}><Home size={14}/> Preference</div></th>
              <th>Actions</th>
            </tr>
          </thead>

        <tbody>
          {requests.length === 0 ? (
            <tr><td colSpan={6} style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No pending applications found</td></tr>
          ) : (
            requests.map((req) => (
              <tr key={req._id}>
                <td>{req.studentId?.name || "Unknown"}</td>
                <td>{req.studentId?.regNo || "N/A"}</td>
                <td>{new Date(req.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>{req.hostelType}</td>
                <td>{req.roomPreference}</td>
                <td>
                  <div className={styles.actionCell}>
                    <button 
                      className={styles.approveBtn}
                      onClick={() => handleAction(req._id, "approve")}
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button 
                      className={styles.rejectBtn}
                      onClick={() => handleAction(req._id, "reject")}
                    >
                      <XCircle size={14} />
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

      {assigningReq && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Assign Room: {assigningReq.studentId?.name}</h3>
            
            <div className={styles.formGroup}>
              <label>Select Hostel</label>
              <select 
                onChange={(e) => {
                  setSelectedHostel(e.target.value);
                  setSelectedRoom(null);
                  setSelectedBed("");
                }}
                value={selectedHostel}
              >
                <option value="">-- Choose Hostel --</option>
                {hostels
                  .filter(h => !assigningReq.hostelType || h.type?.toLowerCase().includes(assigningReq.hostelType.toLowerCase()))
                  .map(h => (
                    <option key={h._id} value={h._id}>{h.name} ({h.type || "N/A"})</option>
                  ))
                }
              </select>
            </div>

            {selectedHostel && (
              <div className={styles.formGroup}>
                <label>Select Room</label>
                <select 
                  onChange={(e) => {
                    const room = rooms.find(r => r._id === e.target.value);
                    setSelectedRoom(room || null);
                    setSelectedBed("");
                  }}
                  value={selectedRoom?._id || ""}
                >
                  <option value="">-- Choose Room --</option>
                  {rooms.filter(r => r.hostelId === selectedHostel).map(r => (
                    <option key={r._id} value={r._id}>{r.roomNo} ({r.floor})</option>
                  ))}
                </select>
              </div>
            )}

            {selectedRoom && (
              <div className={styles.formGroup}>
                <label>Select Bed</label>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px'}}>
                  {selectedRoom.beds?.map(b => (
                    <button
                      key={b.bedNo}
                      type="button"
                      disabled={b.isOccupied}
                      onClick={() => setSelectedBed(b.bedNo)}
                      style={{
                        padding: '10px 15px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: selectedBed === b.bedNo ? '#3b82f6' : (b.isOccupied ? '#f1f5f9' : 'white'),
                        color: selectedBed === b.bedNo ? 'white' : (b.isOccupied ? '#94a3b8' : '#334155'),
                        cursor: b.isOccupied ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {b.bedNo} {b.isOccupied && "(Occupied)"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => {
                setAssigningReq(null);
                setSelectedHostel("");
                setSelectedRoom(null);
                setSelectedBed("");
              }}>Cancel</button>
              <button 
                className={styles.submitBtn} 
                disabled={!selectedRoom || !selectedBed}
                onClick={submitAssignment}
                style={{
                  background: (!selectedRoom || !selectedBed) ? '#cbd5e1' : '#10b981',
                  cursor: (!selectedRoom || !selectedBed) ? 'not-allowed' : 'pointer'
                }}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectingReq && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Reject Application: {rejectingReq.studentId?.name}</h3>
            <div className={styles.formGroup}>
              <label>Reason for Rejection</label>
              <textarea 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter specific reason for rejection..."
                rows={4}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => {
                setRejectingReq(null);
                setRejectionReason("");
              }}>Cancel</button>
              <button 
                className={styles.rejectBtn} 
                disabled={!rejectionReason}
                onClick={submitRejection}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
