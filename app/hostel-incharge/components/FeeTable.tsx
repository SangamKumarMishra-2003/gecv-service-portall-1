"use client";

import { useEffect, useState } from "react";
import styles from "./StudentTable.module.scss";

interface Fee {
  _id: string;
  student: {
    name: string;
    regNo: string;
  };
  amount: number;
  paymentMode: string;
  paymentDate: string;
  status: string;
}

export default function FeeTable() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hostel-fees")
      .then((res) => res.json())
      .then((data) => {
        setFees(data.fees || []);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching fees:", err));
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <div>Loading fees...</div>;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Student</th>
            <th>Reg No</th>
            <th>Amount</th>
            <th>Payment Mode</th>
            <th>Payment Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {fees.length === 0 ? (
            <tr><td colSpan={6} style={{textAlign: 'center'}}>No payment records found</td></tr>
          ) : (
            fees.map((fee) => (
              <tr key={fee._id}>
                <td>{fee.student?.name || "Unknown"}</td>
                <td>{fee.student?.regNo || "N/A"}</td>
                <td>₹{fee.amount}</td>
                <td>{fee.paymentMode}</td>
                <td>{formatDate(fee.paymentDate)}</td>
                <td>
                    <span className={fee.status === "Paid" ? styles.activeBadge : ""}>
                        {fee.status}
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