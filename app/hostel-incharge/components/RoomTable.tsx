interface Room {
  roomNo: string;
  floor: string;
  capacity: number;
  occupied: number;
  available: number;
  status: string;
}

export default function RoomTable() {
  const rooms: Room[] = [
    {
      roomNo: "A101",
      floor: "1",
      capacity: 3,
      occupied: 2,
      available: 1,
      status: "Available",
    },
  ];

  return (
    <table>
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
        {rooms.map((room, i) => (
          <tr key={i}>
            <td>{room.roomNo}</td>
            <td>{room.floor}</td>
            <td>{room.capacity}</td>
            <td>{room.occupied}</td>
            <td>{room.available}</td>
            <td>{room.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}