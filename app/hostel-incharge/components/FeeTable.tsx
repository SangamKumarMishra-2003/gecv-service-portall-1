import { useEffect, useState } from "react";
import styles from "./FeeTable.module.scss";

interface Fee {
  _id: string;
  student: {
    _id: string;
    name: string;
    regNo: string;
  };
  amount: number;
  paymentMode: string;
  paymentDate: string;
  transactionId?: string;
  status: string;
}

interface Student {
  _id: string;
  name: string;
  regNo: string;
  rollNo?: string;
}

export default function FeeTable() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    paymentMode: "Net Banking",
    transactionId: "",
  });

  const fetchFees = () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/hostel-fees", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setFees(data.fees || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching fees:", err);
        setLoading(false);
      });
  };

  const fetchStudents = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/users?role=student", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setStudents(data.users || []))
      .catch((err) => console.error("Error fetching students:", err));
  };

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, []);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return alert("Please select a student");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/hostel-fees", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student: selectedStudent._id,
          amount: Number(newPayment.amount),
          paymentMode: newPayment.paymentMode,
          transactionId: newPayment.transactionId,
          status: "Paid",
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setSelectedStudent(null);
        setNewPayment({ amount: "", paymentMode: "Net Banking", transactionId: "" });
        fetchFees();
      }
    } catch (err) {
      console.error("Error adding payment:", err);
    }
  };

  const filteredFees = fees.filter((fee) =>
    fee.student?.name.toLowerCase().includes(search.toLowerCase()) ||
    fee.student?.regNo.toLowerCase().includes(search.toLowerCase()) ||
    fee.transactionId?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.regNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.rollNo?.toLowerCase().includes(studentSearch.toLowerCase())
  ).slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <div>Loading fees...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <input
          type="text"
          placeholder="Search by student or transaction..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          + Record Payment
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Reg No</th>
              <th>Amount</th>
              <th>Payment Details</th>
              <th>Payment Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredFees.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No records found</td></tr>
            ) : (
              filteredFees.map((fee) => (
                <tr key={fee._id}>
                   <td>{fee.student?.name || "Unknown"}</td>
                  <td>{fee.student?.regNo || "N/A"}</td>
                  <td>
                      <div style={{fontWeight: 'bold', color: '#16a34a'}}>₹{fee.amount}</div>
                  </td>
                  <td>
                      <div>{fee.paymentMode}</div>
                      {fee.transactionId && <div style={{fontSize: '11px', color: '#64748b'}}>ID: {fee.transactionId}</div>}
                  </td>
                  <td>{formatDate(fee.paymentDate)}</td>
                  <td>
                    <span className={styles.activeBadge}>
                      {fee.status}
                    </span>
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
            <h3>Record New Payment</h3>
            <form onSubmit={handleAddPayment}>
              <div className={styles.formGroup}>
                <label>Find Student (Name or Registration No)</label>
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                <div className={styles.studentSearchList}>
                  {filteredStudents.map(s => (
                    <div
                      key={s._id}
                      className={`${styles.studentItem} ${selectedStudent?._id === s._id ? styles.selected : ""}`}
                      onClick={() => {
                        setSelectedStudent(s);
                        setStudentSearch(s.name);
                      }}
                    >
                      {s.name} - {s.regNo}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Payment Mode</label>
                <select
                  value={newPayment.paymentMode}
                  onChange={(e) => setNewPayment({ ...newPayment, paymentMode: e.target.value })}
                >
                  <option value="Net Banking">Net Banking</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Transaction ID / Reference</label>
                <input
                  type="text"
                  value={newPayment.transactionId}
                  onChange={(e) => setNewPayment({ ...newPayment, transactionId: e.target.value })}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}