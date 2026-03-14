"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentFeeStructurePage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [fees, setFees] = useState({
    paymentDate: "",
    transactionId: "",
    admissionFee: "",
    tuitionFee: "",
    registrationFee: "",
    examFee: "",
    developmentFee: "",
    otherCharges: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch student info from API (assume /api/users/me returns current student)
    async function fetchStudent() {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) throw new Error("Failed to fetch student info");
        const data = await res.json();
        setStudent(data.user);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchStudent();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFees({ ...fees, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass student info and fees to preview page
    router.push(
      `/academic/fee-receipt/preview?` +
        new URLSearchParams({
          ...student,
          ...fees,
          serviceType: "Fee Structure",
        }).toString()
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!student) return <div>No student data found.</div>;

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: 24, background: "#fff", borderRadius: 8 }}>
      <h2>Fee Structure Request</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Payment Date</label>
          <input name="paymentDate" value={fees.paymentDate} onChange={handleChange} required type="date" />
        </div>
        <div>
          <label>Transaction ID</label>
          <input name="transactionId" value={fees.transactionId} onChange={handleChange} required />
        </div>
        <div>
          <label>Admission Fee</label>
          <input name="admissionFee" value={fees.admissionFee} onChange={handleChange} required pattern="\\d+" />
        </div>
        <div>
          <label>Tuition Fee</label>
          <input name="tuitionFee" value={fees.tuitionFee} onChange={handleChange} required pattern="\\d+" />
        </div>
        <div>
          <label>Registration Fee</label>
          <input name="registrationFee" value={fees.registrationFee} onChange={handleChange} required pattern="\\d+" />
        </div>
        <div>
          <label>Exam Fee</label>
          <input name="examFee" value={fees.examFee} onChange={handleChange} required pattern="\\d+" />
        </div>
        <div>
          <label>Development Fee</label>
          <input name="developmentFee" value={fees.developmentFee} onChange={handleChange} required pattern="\\d+" />
        </div>
        <div>
          <label>Other Charges</label>
          <input name="otherCharges" value={fees.otherCharges} onChange={handleChange} required pattern="\\d+" />
        </div>
        <button type="submit" style={{ marginTop: 16 }}>Submit & Preview</button>
      </form>
    </div>
  );
}
