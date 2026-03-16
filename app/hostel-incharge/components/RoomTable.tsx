"use client";

import { useEffect, useState } from "react";
import styles from "./RoomTable.module.scss";

interface Hostel {
  _id: string;
  name: string;
}

interface Room {
  _id: string;
  roomNo: string;
  floor: string;
  capacity: number;
  occupied: number;
  status: string;
  beds: { bedNo: string; isOccupied: boolean }[];
  inventory: {
    tables: { serialNo: string; condition: string }[];
    chairs: { serialNo: string; condition: string }[];
  };
}

export default function RoomTable() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Room | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState({
    roomNo: "",
    floor: "Ground Floor",
    capacity: 0,
    hostelId: "",
    hostelBlock: "",
    numTables: 0,
    numChairs: 0,
  });
  const [tableDetails, setTableDetails] = useState<{ serialNo: string; condition: string }[]>([]);
  const [chairDetails, setChairDetails] = useState<{ serialNo: string; condition: string }[]>([]);
  const [bedDetails, setBedDetails] = useState<{ bedNo: string; isOccupied: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    let url = "/api/rooms";
    if (selectedHostel) url += `?hostelId=${selectedHostel}`;
    
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.rooms || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        setLoading(false);
      });
  };

  const fetchHostels = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/hostels", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setHostels(data.hostels || []))
      .catch((err) => console.error("Error fetching hostels:", err));
  };

  useEffect(() => {
    fetchRooms();
    fetchHostels();
  }, [selectedHostel]);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const inventory = {
      tables: tableDetails,
      chairs: chairDetails,
    };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...newRoom, beds: bedDetails, inventory }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewRoom({ roomNo: "", floor: "Ground Floor", capacity: 0, hostelId: "", hostelBlock: "", numTables: 0, numChairs: 0 });
        setTableDetails([]);
        setChairDetails([]);
        setBedDetails([]);
        fetchRooms();
      }
    } catch (err) {
      console.error("Error adding room:", err);
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/rooms/${showEditModal._id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newRoom),
      });
      if (res.ok) {
        setShowEditModal(null);
        setNewRoom({ roomNo: "", floor: "Ground Floor", capacity: 1, hostelId: "", hostelBlock: "Single", numTables: 0, numChairs: 0 });
        fetchRooms();
      }
    } catch (err) {
      console.error("Error updating room:", err);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/rooms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchRooms();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete room");
      }
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  };

  const openEditModal = (room: Room) => {
    setShowEditModal(room);
    setNewRoom({
      roomNo: room.roomNo,
      floor: room.floor,
      capacity: room.capacity,
      hostelId: (room as any).hostelId || "",
      hostelBlock: (room as any).hostelBlock || "Single",
      numTables: room.inventory?.tables?.length || 0,
      numChairs: room.inventory?.chairs?.length || 0
    });
    // We don't necessarily update inventory details here for simple edit, 
    // but we support the core fields.
  };

  const filteredRooms = rooms.filter(room => 
    room.roomNo.toLowerCase().includes(search.toLowerCase()) ||
    room.floor.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading rooms...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
            <input
              type="text"
              placeholder="Search Room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.search}
            />
            <select 
                className={styles.search} 
                style={{ maxWidth: '200px' }}
                value={selectedHostel}
                onChange={(e) => setSelectedHostel(e.target.value)}
            >
                <option value="">All Hostels</option>
                {hostels.map(h => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                ))}
            </select>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          + Add Room
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Room</th>
              <th>Floor</th>
              <th>Capacity</th>
              <th>Occupied</th>
              <th>Available</th>
              <th>Status</th>
              <th>Actions</th>
</tr>
</thead>

<tbody>
  {filteredRooms.length === 0 ? (
    <tr><td colSpan={7} style={{textAlign: 'center'}}>No rooms found</td></tr>
  ) : (
    filteredRooms.map((room) => (
      <tr key={room._id}>
        <td>{room.roomNo}</td>
        <td>{room.floor}</td>
        <td>{room.capacity}</td>
        <td>{room.occupied}</td>
        <td>{room.capacity - room.occupied}</td>
        <td>
          <span className={`${styles.statusBadge} ${styles[room.status.toLowerCase()]}`}>
            {room.status}
          </span>
        </td>
        <td>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={styles.viewBtn} onClick={() => setShowDetailsModal(room)}>
              View Specs
            </button>
            <button className={styles.editBtn} onClick={() => openEditModal(room)}>
              Edit
            </button>
            <button className={styles.deleteBtn} onClick={() => handleDeleteRoom(room._id)}>
              Delete
            </button>
          </div>
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
            <h3>Add New Room</h3>
            <form onSubmit={handleAddRoom}>
              <div className={styles.formGroup}>
                <label>Select Hostel</label>
                <select
                  required
                  value={newRoom.hostelId}
                  onChange={(e) => setNewRoom({ ...newRoom, hostelId: e.target.value })}
                >
                  <option value="">-- Choose Hostel --</option>
                  {hostels.map(h => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Room Number</label>
                  <input
                    type="text"
                    required
                    value={newRoom.roomNo}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNo: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Floor</label>
                  <select
                    required
                    value={newRoom.floor}
                    onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="3rd Floor">3rd Floor</option>
                    <option value="4th Floor">4th Floor</option>
                    <option value="5th Floor">5th Floor</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Number of Beds</label>
                  <input
                    type="number"
                    required
                    value={newRoom.capacity}
                    onChange={(e) => {
                      const val = e.target.value;
                      const count = val === "" ? 0 : parseInt(val) || 0;
                      setNewRoom({ ...newRoom, capacity: count });
                      setBedDetails(Array.from({ length: count }, (_, i) => bedDetails[i] || { bedNo: `${newRoom.roomNo || 'R'}-${i + 1}`, isOccupied: false }));
                    }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Room Type</label>
                  <select
                    required
                    value={newRoom.hostelBlock}
                    onChange={(e) => {
                      const type = e.target.value;
                      if (!type) {
                        setNewRoom({ ...newRoom, hostelBlock: "", capacity: 0 });
                        setBedDetails([]);
                        return;
                      }
                      let cap = 3;
                      if (type === "Single") cap = 1;
                      else if (type === "Double") cap = 2;
                      else if (type === "Triple") cap = 3;
                      
                      setNewRoom({ ...newRoom, hostelBlock: type, capacity: cap });
                      setBedDetails(Array.from({ length: cap }, (_, i) => ({ 
                        bedNo: `${newRoom.roomNo || 'R'}-${i + 1}`, 
                        isOccupied: false 
                      })));
                    }}
                  >
                    <option value="">-- Select Type --</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Number of Tables</label>
                  <input
                    type="number"
                    value={newRoom.numTables}
                    onChange={(e) => {
                      const val = e.target.value;
                      const count = val === "" ? 0 : parseInt(val) || 0;
                      setNewRoom({ ...newRoom, numTables: count });
                      setTableDetails(Array.from({ length: count }, (_, i) => tableDetails[i] || { serialNo: "", condition: "Good" }));
                    }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Number of Chairs</label>
                  <input
                    type="number"
                    value={newRoom.numChairs}
                    onChange={(e) => {
                      const val = e.target.value;
                      const count = val === "" ? 0 : parseInt(val) || 0;
                      setNewRoom({ ...newRoom, numChairs: count });
                      setChairDetails(Array.from({ length: count }, (_, i) => chairDetails[i] || { serialNo: "", condition: "Good" }));
                    }}
                  />
                </div>
              </div>

              {bedDetails.length > 0 && (
                <div className={styles.dynamicSection}>
                  <h4>Bed List</h4>
                  <div className={styles.scrollArea}>
                    {bedDetails.map((bd, i) => (
                      <div key={i} className={styles.inventoryRow}>
                        <input
                          placeholder={`Bed ${i + 1} Name/No`}
                          value={bd.bedNo}
                          onChange={(e) => {
                            const updated = [...bedDetails];
                            updated[i].bedNo = e.target.value;
                            setBedDetails(updated);
                          }}
                        />
                        <div className={styles.statusInfo} style={{fontSize: '12px', color: '#64748b'}}>
                          Ready to Assign
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tableDetails.length > 0 && (
                <div className={styles.dynamicSection}>
                  <h4>Table Inventory Details</h4>
                  <div className={styles.scrollArea}>
                    {tableDetails.map((td, i) => (
                      <div key={i} className={styles.inventoryRow}>
                        <input
                          placeholder={`Table ${i + 1} S/N`}
                          value={td.serialNo}
                          onChange={(e) => {
                            const updated = [...tableDetails];
                            updated[i].serialNo = e.target.value;
                            setTableDetails(updated);
                          }}
                        />
                        <select
                          value={td.condition}
                          onChange={(e) => {
                            const updated = [...tableDetails];
                            updated[i].condition = e.target.value;
                            setTableDetails(updated);
                          }}
                        >
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Poor">Poor</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {chairDetails.length > 0 && (
                <div className={styles.dynamicSection}>
                  <h4>Chair Inventory Details</h4>
                  <div className={styles.scrollArea}>
                    {chairDetails.map((cd, i) => (
                      <div key={i} className={styles.inventoryRow}>
                        <input
                          placeholder={`Chair ${i + 1} S/N`}
                          value={cd.serialNo}
                          onChange={(e) => {
                            const updated = [...chairDetails];
                            updated[i].serialNo = e.target.value;
                            setChairDetails(updated);
                          }}
                        />
                        <select
                          value={cd.condition}
                          onChange={(e) => {
                            const updated = [...chairDetails];
                            updated[i].condition = e.target.value;
                            setChairDetails(updated);
                          }}
                        >
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Poor">Poor</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Add Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Edit Room: {showEditModal.roomNo}</h3>
            <form onSubmit={handleUpdateRoom}>
              <div className={styles.formGroup}>
                <label>Select Hostel</label>
                <select
                  required
                  value={newRoom.hostelId}
                  onChange={(e) => setNewRoom({ ...newRoom, hostelId: e.target.value })}
                >
                  <option value="">-- Choose Hostel --</option>
                  {hostels.map(h => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Room Number</label>
                  <input
                    type="text"
                    required
                    value={newRoom.roomNo}
                    onChange={(e) => setNewRoom({ ...newRoom, roomNo: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Floor</label>
                  <select
                    required
                    value={newRoom.floor}
                    onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="3rd Floor">3rd Floor</option>
                    <option value="4th Floor">4th Floor</option>
                    <option value="5th Floor">5th Floor</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Number of Beds</label>
                  <input
                    type="number"
                    required
                    value={newRoom.capacity}
                    onChange={(e) => {
                      const val = e.target.value;
                      const count = val === "" ? 0 : parseInt(val) || 0;
                      setNewRoom({ ...newRoom, capacity: count });
                    }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Room Type</label>
                  <select
                    required
                    value={newRoom.hostelBlock}
                    onChange={(e) => {
                      const type = e.target.value;
                      let cap = newRoom.capacity;
                      if (type === "Single") cap = 1;
                      else if (type === "Double") cap = 2;
                      else if (type === "Triple") cap = 3;
                      setNewRoom({ ...newRoom, hostelBlock: type, capacity: cap });
                    }}
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowEditModal(null)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Update Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDetailsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: "600px" }}>
            <h3>Room {showDetailsModal.roomNo} Inventory & Details</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailSection}>
                <h4>Beds ({showDetailsModal.beds?.length || 0})</h4>
                <ul>
                  {showDetailsModal.beds?.map((b, i) => (
                    <li key={i}>{b.bedNo} - {b.isOccupied ? "Occupied" : "Free"}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.detailSection}>
                <h4>Tables ({showDetailsModal.inventory?.tables?.length || 0})</h4>
                <ul>
                  {showDetailsModal.inventory?.tables?.map((t, i) => (
                    <li key={i}>S/N: {t.serialNo || "N/A"} - {t.condition}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.detailSection}>
                <h4>Chairs ({showDetailsModal.inventory?.chairs?.length || 0})</h4>
                <ul>
                  {showDetailsModal.inventory?.chairs?.map((c, i) => (
                    <li key={i}>S/N: {c.serialNo || "N/A"} - {c.condition}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowDetailsModal(null)} className={styles.cancelBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}