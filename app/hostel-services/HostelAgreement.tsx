
"use client";
import styles from "./HostelServices.module.scss";
import { useRef, useState } from "react";

export default function HostelAgreement() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!checked) {
      setError("Please confirm you have read and signed the agreement.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    try {
      const res = await fetch("/api/hostel-agreement", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.webViewLink) {
        setSuccess("Agreement uploaded successfully! ");
        // TODO: Save data.webViewLink to backend with user's hostel request
      } else {
        setError(data.error || "Upload failed. Try again.");
      }
    } catch {
      setError("Upload failed. Try again.");
    }
    setUploading(false);
  };

  return (
    <div className={styles.agreementSection}>
      <h2>Hostel Agreement</h2>
      <div className={styles.cards}>
        {/* Download Card */}
        <div className={`${styles.card} ${styles.download}`}>
          <h3>Download Agreement</h3>
          <p>
            Download the official hostel agreement, read it carefully, and sign it before submission.
          </p>
          <a href="/documents/hostel-agreement.pdf" download className={styles.btn}>
            Download Agreement
          </a>
        </div>
        {/* Submit Card */}
        <form
          className={`${styles.card} ${styles.submit}`}
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <h3>Submit Signed Agreement</h3>
          <p>Upload the signed agreement document (PDF or Image).</p>
          <div
            style={{
              border: "2px dashed #a5b4fc",
              borderRadius: 10,
              padding: "1.2rem 0.5rem",
              marginBottom: 12,
              background: file ? "#f0fdf4" : "#f8fafc",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {file ? (
              <>
                <strong>Selected:</strong> {file.name}
                <button
                  type="button"
                  style={{ marginLeft: 10, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                  onClick={e => { e.stopPropagation(); setFile(null); }}
                  aria-label="Remove file"
                >
                  Remove
                </button>
              </>
            ) : (
              <span>Click or drag & drop file here</span>
            )}
            <input
              type="file"
              accept=".pdf,image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} /> I confirm that I have read and signed the hostel agreement.
          </label>
          <button type="submit" className={styles.btn} disabled={uploading}>
            {uploading ? "Uploading..." : "Submit Agreement"}
          </button>
          {success && <div style={{ color: "#16a34a", marginTop: 10 }}>{success}</div>}
          {error && <div style={{ color: "#ef4444", marginTop: 10 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
