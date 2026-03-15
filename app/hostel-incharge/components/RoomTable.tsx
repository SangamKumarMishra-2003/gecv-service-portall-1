"use client";

import { useEffect, useState } from "react";
import styles from "./RoomTable.module.scss";

interface Room {
  _id: string;
  roomNo: string;
  floor: string;
  capacity: number;
  occupied: number;
  status: string;
}

export default function RoomTable() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        setRooms(data.rooms || []);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching rooms:", err));
  }, []);

  if (loading) return <div>Loading rooms...</div>;

  return (
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
          </tr>
        </thead>

        <tbody>
          {rooms.length === 0 ? (
            <tr><td colSpan={6} style={{textAlign: 'center'}}>No rooms found</td></tr>
          ) : (
            rooms.map((room) => (
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}