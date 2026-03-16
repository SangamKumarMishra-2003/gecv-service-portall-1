"use client";

import { useEffect, useState } from "react";
import styles from "./HostelTable.module.scss";

interface Hostel {
  _id: string;
  name: string;
  totalRooms: number;
  type: string;
  createdBy: { name: string };
  createdAt: string;
}

export default function HostelTable() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHostel, setNewHostel] = useState({
    name: "",
    totalRooms: 0,
    type: "Boys Hostel"
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingHostel, setViewingHostel] = useState<Hostel | null>(null);

  const fetchHostels = () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/hostels", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setHostels(data.hostels || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching hostels:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleEditHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHostel) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`/api/hostels/${editingHostel._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingHostel),
      });
      if (res.ok) {
        setShowEditModal(false);
        setEditingHostel(null);
        fetchHostels();
      }
    } catch (err) {
      console.error("Error updating hostel:", err);
    }
  };

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch("/api/hostels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newHostel),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewHostel({ name: "", totalRooms: 0, type: "Boys Hostel" });
        fetchHostels();
      }
    } catch (err) {
      console.error("Error creating hostel:", err);
    }
  };

  const [search, setSearch] = useState("");

  const filteredHostels = hostels.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.type.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading hostels...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <input 
            type="text" 
            placeholder="Search by name or type..." 
            className={styles.search} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          + Create Hostel
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Hostel Name</th>
              <th>Type</th>
              <th>Total Rooms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHostels.length === 0 ? (
              <tr><td colSpan={4} style={{textAlign: 'center'}}>No matching hostels found</td></tr>
            ) : (
              filteredHostels.map((h) => (
                <tr key={h._id}>
                  <td>{h.name}</td>
                  <td>
                    <span className={`${styles.typeBadge} ${h.type === 'Boys Hostel' ? styles.boys : styles.girls}`}>
                      {h.type}
                    </span>
                  </td>
                  <td>{h.totalRooms}</td>
                  <td className={styles.actions}>
                    <button
                        className={styles.viewBtn}
                        onClick={() => {
                            setViewingHostel(h);
                            setShowDetailsModal(true);
                        }}
                    >
                        View
                    </button>
                    <button
                        className={styles.editBtn}
                        onClick={() => {
                            setEditingHostel(h);
                            setShowEditModal(true);
                        }}
                    >
                        Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Create New Hostel</h3>
            <form onSubmit={handleCreateHostel}>
              <div className={styles.formGroup}>
                <label>Hostel Name</label>
                <input
                  type="text"
                  required
                  value={newHostel.name}
                  onChange={(e) => setNewHostel({ ...newHostel, name: e.target.value })}
                  placeholder="e.g. Malaviya Hostel"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Hostel Type</label>
                <select
                  value={newHostel.type}
                  onChange={(e) => setNewHostel({ ...newHostel, type: e.target.value })}
                >
                  <option value="Boys Hostel">Boys Hostel</option>
                  <option value="Girls Hostel">Girls Hostel</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Total Number of Rooms</label>
                <input
                  type="number"
                  required
                  value={newHostel.totalRooms}
                  onChange={(e) => setNewHostel({ ...newHostel, totalRooms: parseInt(e.target.value) })}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

       {showEditModal && editingHostel && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Edit Hostel Details</h3>
            <form onSubmit={handleEditHostel}>
              <div className={styles.formGroup}>
                <label>Hostel Name</label>
                <input
                  type="text"
                  required
                  value={editingHostel.name}
                  onChange={(e) => setEditingHostel({ ...editingHostel, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Hostel Type</label>
                <select
                  value={editingHostel.type}
                  onChange={(e) => setEditingHostel({ ...editingHostel, type: e.target.value })}
                >
                  <option value="Boys Hostel">Boys Hostel</option>
                  <option value="Girls Hostel">Girls Hostel</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Total Number of Rooms</label>
                <input
                  type="number"
                  required
                  value={editingHostel.totalRooms}
                  onChange={(e) => setEditingHostel({ ...editingHostel, totalRooms: parseInt(e.target.value) })}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowEditModal(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && viewingHostel && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
                <h3>{viewingHostel.name} - Detailed View</h3>
                <button className={styles.closeBtn} onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className={styles.detailsContent}>
                <p><strong>Hostel Type:</strong> {viewingHostel.type}</p>
                <p><strong>Total Capacity:</strong> {viewingHostel.totalRooms} Rooms</p>
                <p><strong>Status:</strong> <span className={styles.activeBadge}>Operational</span></p>
                <hr />
                <p><strong>Created By:</strong> {viewingHostel.createdBy?.name || "Incharge"}</p>
                <p><strong>Established On:</strong> {new Date(viewingHostel.createdAt).toLocaleDateString()}</p>
            </div>
            <button className={styles.submitBtn} onClick={() => setShowDetailsModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
