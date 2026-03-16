"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { generateFeeReceiptPDF } from "@/app/utils/generateFeeReceiptPDF";
import { generateFeeStructurePDF } from "@/app/utils/generateFeeStructurePDF";

function PreviewContent() {
  const params = useSearchParams();
  const data = Object.fromEntries(params.entries());

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>{data.serviceType} Preview</h2>

        <div style={styles.grid}>
          <div>
            <p><span style={styles.label}>Receipt No:</span> {data.receiptNo}</p>
            <p><span style={styles.label}>Student Name:</span> {data.studentName}</p>
            <p><span style={styles.label}>Father’s Name:</span> {data.fatherName}</p>
            <p><span style={styles.label}>Roll No:</span> {data.rollNo}</p>
            <p><span style={styles.label}>Registration No:</span> {data.regNo}</p>
            <p><span style={styles.label}>Email:</span> {data.email}</p>
            <p><span style={styles.label}>Year:</span> {data.year}</p>
            <p><span style={styles.label}>Date of Birth:</span> {data.dob ? new Date(data.dob).toLocaleDateString() : "N/A"}</p>
            <p><span style={styles.label}>Admission Date:</span> {data.admissionDate ? new Date(data.admissionDate).toLocaleDateString() : "N/A"}</p>
            <p><span style={styles.label}>Purpose:</span> {data.purpose}</p>
          </div>

          <div>
            <p><span style={styles.label}>Course:</span> {data.course}</p>
            <p><span style={styles.label}>Session:</span> {data.session}</p>
            <p><span style={styles.label}>Payment Mode:</span> {data.paymentMode}</p>
            <p><span style={styles.label}>Transaction ID:</span> {data.transactionId}</p>
            <p><span style={styles.label}>Payment Date:</span> {data.paymentDate ? new Date(data.paymentDate).toLocaleDateString() : "N/A"}</p>
          </div>
        </div>

        <hr style={styles.divider} />

        <button
          onClick={async () => {
            console.log("Service Type:", data.serviceType);
            try {
              if (data.serviceType === "Fee Structure") {
                console.log("Generating Fee Structure PDF");
                await generateFeeStructurePDF(data as any);
              } else {
                console.log("Generating Fee Receipt PDF");
                await generateFeeReceiptPDF(data);
              }
            } catch (error) {
              console.error("Error generating PDF:", error);
              alert("Error generating PDF: " + (error instanceof Error ? error.message : "Unknown error"));
            }
          }}
          style={styles.button}
        >
          Download / Print PDF
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewContent />
    </Suspense>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px",
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "750px",
    padding: "30px 40px",
    borderRadius: "8px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  heading: {
    textAlign: "center" as const,
    marginBottom: "30px",
    fontSize: "22px",
    letterSpacing: "0.5px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    fontSize: "15px",
    lineHeight: "1.8",
  },
  label: {
    fontWeight: 600,
  },
  divider: {
    margin: "30px 0",
    border: "none",
    borderTop: "1px solid #ddd",
  },
  button: {
    display: "block",
    margin: "0 auto",
    padding: "12px 28px",
    fontSize: "15px",
    fontWeight: 600,
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
