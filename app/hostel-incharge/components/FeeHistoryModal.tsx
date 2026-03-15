"use client";

import styles from "./FeeModal.module.scss";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FeeHistoryModal({ open, onClose }: Props) {

  if (!open) return null;

  const payments = [
    { amount: 12000, mode: "UPI", date: "2026-01-10" },
    { amount: 12000, mode: "Cash", date: "2026-03-10" },
  ];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        <h3>Fee Payment History</h3>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Payment Mode</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p, i) => (
              <tr key={i}>
                <td>{p.amount}</td>
                <td>{p.mode}</td>
                <td>{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={onClose} className={styles.closeBtn}>
          Close
        </button>

      </div>
    </div>
  );
}