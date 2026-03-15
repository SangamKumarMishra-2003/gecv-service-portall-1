import styles from "./SummaryCards.module.scss";

export default function SummaryCards() {
  const data = [
    { title: "Total Students", value: 320 },
    { title: "Total Rooms", value: 120 },
    { title: "Occupied Rooms", value: 95 },
    { title: "Available Rooms", value: 25 },
    { title: "Pending Requests", value: 12 },
  ];

  return (
    <div className={styles.cards}>
      {data.map((item, index) => (
        <div key={index} className={styles.card}>
          <h4>{item.title}</h4>
          <p>{item.value}</p>
        </div>
      ))}
    </div>
  );
}