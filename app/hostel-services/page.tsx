"use client";

import { useState, useEffect } from "react";
import styles from "./HostelServices.module.scss";
import HostelAgreement from "./HostelAgreement";
import { useRouter } from "next/navigation";

type ServiceType =
  | ""
  | "allotment"
  | "agreement"
  | "hostelPayment"
  | "messPayment";

export default function HostelServicesPage() {
  const router = useRouter();
  const [service, setService] = useState<ServiceType>("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [hasExistingApp, setHasExistingApp] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    regNo: "",
    applicationNo: "",
    gender: "",
    dob: "",
    category: "",
    nationality: "",
    bloodGroup: "",
    aadhaarNo: "",
    collegeName: "",
    course: "",
    branch: "",
    yearSemester: "",
    academicSession: "",
    admissionMode: "",
    permanentAddress: "",
    cityVillage: "",
    district: "",
    state: "",
    pinCode: "",
    fatherName: "",
    motherName: "",
    guardianName: "",
    occupation: "",
    mobileNo: "",
    alternateMobileNo: "",
    emailId: "",
    hostelType: "",
    roomPreference: "",
    floorPreference: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = getToken();
      if (!token) {
        // Not logged in, can't autofill or check apps
        return;
      }

      // 1. Autofill from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setFormData((prev) => ({
            ...prev,
            fullName: user.name || prev.fullName,
            regNo: user.regNo || prev.regNo,
            emailId: user.email || prev.emailId,
            mobileNo: user.mobile || prev.mobileNo,
            course: user.course || prev.course,
            branch: user.branch || prev.branch,
            fatherName: user.fatherName || prev.fatherName,
            motherName: user.motherName || prev.motherName,
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : prev.dob,
            academicSession: user.session || prev.academicSession,
            yearSemester: user.semester ? String(user.semester) : prev.yearSemester,
          }));
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }

      // 2. Check for existing applications
      try {
        const res = await fetch("/api/hostel-applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.applications && data.applications.length > 0) {
          // Check if there is any application that is NOT rejected
          const activeApp = data.applications.find((app: any) => app.status !== "Rejected");
          if (activeApp) {
            setHasExistingApp(true);
            setService("allotment"); // Force view to allotment to see the message
          }
        }
      } catch (err) {
        console.error("Failed to fetch existing applications", err);
      }
    };

    fetchInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const token = getToken();
    if (!token) {
      setErrorMsg("You must be logged in to apply for the hostel.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/hostel-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // We exclude the actual files from formData for now
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong while submitting your application.");
      }

      setSuccessMsg("Your hostel application has been submitted successfully!");
      // Reset form
      setFormData({
        fullName: "",
        regNo: "",
        applicationNo: "",
        gender: "",
        dob: "",
        category: "",
        nationality: "",
        bloodGroup: "",
        aadhaarNo: "",
        collegeName: "",
        course: "",
        branch: "",
        yearSemester: "",
        academicSession: "",
        admissionMode: "",
        permanentAddress: "",
        cityVillage: "",
        district: "",
        state: "",
        pinCode: "",
        fatherName: "",
        motherName: "",
        guardianName: "",
        occupation: "",
        mobileNo: "",
        alternateMobileNo: "",
        emailId: "",
        hostelType: "",
        roomPreference: "",
        floorPreference: "",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.hostelServices}>
      <h1>Hostel Services</h1>

      {/* Service Selection */}
      <div className={styles.serviceSelect}>
        <label>Select Service Type *</label>
        <select
          value={service}
          onChange={(e) => {
            setService(e.target.value as ServiceType);
            setSuccessMsg("");
            setErrorMsg("");
          }}
          required
        >
          <option value="">-- Select Service --</option>
          <option value="allotment">Hostel Allotment Request</option>
          <option value="agreement">Hostel Agreement</option>
        </select>
      </div>

      {/* Messages */}
      {successMsg && <div className={styles.successMessage}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

      {/* Allotment Form */}
      {service === "allotment" && !successMsg && (
        hasExistingApp ? (
            <div className={styles.infoMessage} style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1rem', borderRadius: '8px', textAlign: 'center', margin: '2rem 0' }}>
                <p>You have already submitted a hostel application. You can view its status on your <a href="/student/dashboard" style={{textDecoration: 'underline', fontWeight: 'bold'}}>Dashboard</a>.</p>
            </div>
        ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Hostel Allotment Application</h2>

          {/* Personal Details */}
          <fieldset>
            <legend>Personal Details</legend>
            <input name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Full Name" />
            <input name="regNo" value={formData.regNo} onChange={handleChange} required placeholder="Registration / Roll Number" />
            <input name="applicationNo" value={formData.applicationNo} onChange={handleChange} required placeholder="Application Number" />
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input name="dob" value={formData.dob} onChange={handleChange} type="date" required max={new Date().toISOString().split("T")[0]} />
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Category</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
            <input name="nationality" value={formData.nationality} onChange={handleChange} required placeholder="Nationality" />
            <input name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required placeholder="Blood Group" />
            <input name="aadhaarNo" value={formData.aadhaarNo} onChange={handleChange} required placeholder="Aadhaar Number" pattern="[0-9]{12}" title="Aadhaar must be 12 digits" />
          </fieldset>

          {/* Academic Details */}
          <fieldset>
            <legend>Academic Details</legend>
            <input name="collegeName" value={formData.collegeName} onChange={handleChange} required placeholder="College / University Name" />
            <input name="course" value={formData.course} onChange={handleChange} required placeholder="Course" />
            <input name="branch" value={formData.branch} onChange={handleChange} required placeholder="Branch / Specialization" />
            <input name="yearSemester" value={formData.yearSemester} onChange={handleChange} required placeholder="Year / Semester" />
            <input name="academicSession" value={formData.academicSession} onChange={handleChange} required placeholder="Academic Session (e.g., 2025–26)" />
            <select name="admissionMode" value={formData.admissionMode} onChange={handleChange} required>
              <option value="">Mode of Admission</option>
              <option value="Entrance">Entrance</option>
              <option value="Direct">Direct</option>
              <option value="Lateral">Lateral</option>
            </select>
          </fieldset>

          {/* Address */}
          <fieldset>
            <legend>Residential Address</legend>
            <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} required placeholder="Permanent Address" />
            <input name="cityVillage" value={formData.cityVillage} onChange={handleChange} required placeholder="Village / City" />
            <input name="district" value={formData.district} onChange={handleChange} required placeholder="District" />
            <input name="state" value={formData.state} onChange={handleChange} required placeholder="State" />
            <input name="pinCode" value={formData.pinCode} onChange={handleChange} required placeholder="PIN Code" pattern="[0-9]{6}" title="PIN must be 6 digits" />
          </fieldset>

          {/* Parent / Guardian */}
          <fieldset>
            <legend>Parent / Guardian Details</legend>
            <input name="fatherName" value={formData.fatherName} onChange={handleChange} required placeholder="Father’s Name" />
            <input name="motherName" value={formData.motherName} onChange={handleChange} required placeholder="Mother’s Name" />
            <input name="guardianName" value={formData.guardianName} onChange={handleChange} placeholder="Guardian’s Name (if any)" />
            <input name="occupation" value={formData.occupation} onChange={handleChange} required placeholder="Occupation" />
            <input name="mobileNo" value={formData.mobileNo} onChange={handleChange} required placeholder="Mobile Number" pattern="[0-9]{10}" title="Enter valid 10-digit number" />
            <input name="alternateMobileNo" value={formData.alternateMobileNo} onChange={handleChange} placeholder="Alternate Contact Number" />
            <input name="emailId" value={formData.emailId} onChange={handleChange} required type="email" placeholder="Email ID" />
          </fieldset>

          {/* Hostel Preference */}
          <fieldset>
            <legend>Hostel Preference</legend>
            <select name="hostelType" value={formData.hostelType} onChange={handleChange} required>
              <option value="">Hostel Type</option>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
            </select>
            <select name="roomPreference" value={formData.roomPreference} onChange={handleChange} required>
              <option value="">Room Preference</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
            </select>
            <input name="floorPreference" value={formData.floorPreference} onChange={handleChange} placeholder="Floor Preference (optional)" />
          </fieldset>

          {/* Uploads (File inputs kept for visual continuity but not wired to backend) */}
          <fieldset>
            <legend>Uploads (Images Optional)</legend>
            <label>
              Passport Size Photograph
              <input type="file" accept="image/*" />
            </label>
            <label>
              Aadhaar Card (PDF/JPG)
              <input type="file" accept=".pdf,image/*" />
            </label>
            <label>
              College ID / Admission Letter
              <input type="file" accept=".pdf,image/*" />
            </label>
            <p className={styles.uploadNote}>
              <small>File uploads are currently not saved to the server.</small>
            </p>
          </fieldset>

          {/* Declaration */}
          <div className={styles.declaration}>
            <label>
              <input type="checkbox" required /> I hereby declare that the
              information provided above is true and I agree to follow hostel
              rules.
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
        )
      )}
      {service === "agreement" && <HostelAgreement />}
    </section>
  );
}
