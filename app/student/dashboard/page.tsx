"use client";

import { useEffect, useState } from "react";
import styles from "./StudentDashboard.module.scss";
import { Bell, LogOut, X, Lock, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateBonafidePDF } from "../../utils/generateBonafidePDF";

// Types
interface Student {
  _id: string;
  name: string;
  regNo: string;
  course: string;
  branch: string;
  mobile: string;
  email: string;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  session?: string;
  semester?: number;
  year?: number;
  admissionDate?: string;
  expectedCompletionYear?: string;
}

interface ServiceRequest {
  _id: string;
  serviceType: string;
  status: "Pending" | "Approved" | "Rejected";
  purpose: string;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
  studentId?: Student;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "approval" | "rejection" | "info";
  read: boolean;
  createdAt: string;
  relatedRequestId?: { serviceType: string; status: string };
}

interface HostelApplication {
  _id: string;
  hostelType: string;
  roomPreference: string;
  status: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string;
  createdAt: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [hostelApps, setHostelApps] = useState<HostelApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [hostelAppsLoading, setHostelAppsLoading] = useState(true);

  // Modal State
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");

  // Fee input state for Fee Structure
  const [paymentDate, setPaymentDate] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [admissionFee, setAdmissionFee] = useState("");
  const [tuitionFee, setTuitionFee] = useState("");
  const [registrationFee, setRegistrationFee] = useState("");
  const [examFee, setExamFee] = useState("");
  const [developmentFee, setDevelopmentFee] = useState("");
  const [otherCharges, setOtherCharges] = useState("");
  
  // Service Specific State
  const [purposeType, setPurposeType] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("");
  const [reasonForLeaving, setReasonForLeaving] = useState<string>("");
  const [lastSemesterCompleted, setLastSemesterCompleted] = useState<string>("");
  const [organizationName, setOrganizationName] = useState<string>("");
  const [departmentClearances, setDepartmentClearances] = useState({
    library: false,
    hostel: false,
    lab: false,
    accounts: false,
    sports: false,
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Notifications Dropdown
  const [showNotifications, setShowNotifications] = useState(false);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(storedUser);
    setStudent(userData);
    setLoading(false);

    // Fetch service requests
    fetchRequests();
    // Fetch hostel applications
    fetchHostelApps();
    // Fetch notifications
    fetchNotifications();
  }, [router]);

  const getToken = () => localStorage.getItem("token");

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch("/api/service-requests", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Failed to fetch requests");
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchHostelApps = async () => {
    setHostelAppsLoading(true);
    try {
      const res = await fetch("/api/hostel-applications", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setHostelApps(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to fetch hostel applications");
    } finally {
      setHostelAppsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markNotificationsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read");
    }
  };

  // Service type mapping for display
  const serviceLabels: Record<string, string> = {
    Bonafide: "Bonafide Certificate",
    FeeStructure: "Fee Structure",
    TC: "Transfer Certificate",
    CharacterCertificate: "Character Certificate",
    NOC: "No Objection Certificate",
    NoDues: "No Dues Certificate",
  };

  // Send Request Handler
  const handleSendRequest = async () => {
    // Basic validation
    if (!selectedService) return;
    
    // Service-specific validation
    if (selectedService === "Bonafide" && !purposeType) { setSubmitError("Please select a purpose type"); return; }
    if (selectedService === "FeeStructure") {
      if (!academicYear) { setSubmitError("Please enter academic year"); return; }
      if (!purposeType) { setSubmitError("Please select purpose"); return; }
      const yearMatch = academicYear.match(/^(\d{4})-(\d{4})$/);
      if (!yearMatch) { setSubmitError("Academic year must be in YYYY-YYYY format"); return; }
      const start = parseInt(yearMatch[1]);
      const end = parseInt(yearMatch[2]);
      if (end <= start) { setSubmitError("End year must be greater than start year"); return; }
    }
    if (selectedService === "TC" && (!reasonForLeaving || !lastSemesterCompleted)) { setSubmitError("Please fill all required fields"); return; }
    if (selectedService === "NOC" && (!purposeType || !organizationName)) { setSubmitError("Please fill all required fields"); return; }
    if (selectedService === "CharacterCertificate" && !purposeType) { setSubmitError("Please select a purpose type"); return; }

    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          serviceType: selectedService,
          purpose: purpose.trim(),
          // Send all fields (server will ignore irrelevant ones)
          purposeType,
          academicYear,
          reasonForLeaving,
          lastSemesterCompleted: Number(lastSemesterCompleted),
          organizationName,
          departmentClearances: selectedService === "NoDues" ? departmentClearances : undefined,
          // Fee fields for Fee Structure
          admissionFee: selectedService === "FeeStructure" ? admissionFee : undefined,
          tuitionFee: selectedService === "FeeStructure" ? tuitionFee : undefined,
          registrationFee: selectedService === "FeeStructure" ? registrationFee : undefined,
          examFee: selectedService === "FeeStructure" ? examFee : undefined,
          developmentFee: selectedService === "FeeStructure" ? developmentFee : undefined,
          otherCharges: selectedService === "FeeStructure" ? otherCharges : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setSubmitSuccess("Request submitted successfully!");
      fetchRequests();
      setTimeout(() => {
        setSelectedService(null);
        setPurpose("");
        setPurposeType("");
        setAcademicYear("");
        setReasonForLeaving("");
        setLastSemesterCompleted("");
        setOrganizationName("");
        setDepartmentClearances({
          library: false,
          hostel: false,
          lab: false,
          accounts: false,
          sports: false,
        });
        setAdmissionFee("");
        setTuitionFee("");
        setRegistrationFee("");
        setExamFee("");
        setDevelopmentFee("");
        setOtherCharges("");
        setSubmitSuccess("");
      }, 1500);
    } catch (err: unknown) {
      const error = err as Error;
      setSubmitError(error.message || "Failed to submit request");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Download approved document
  const handleDownload = (request: ServiceRequest) => {
    if (!student) return;

    // Generate PDF based on service type
    if (request.serviceType === "Bonafide") {
      generateBonafidePDF({
        name: student.name,
        registrationNo: student.regNo,
        course: student.course || "B.Tech",
        branch: student.branch || "",
        semester: String(student.semester || ""),
        year: String(student.year || ""),
        session: student.session || "",
        dob: student.dob ? new Date(student.dob).toLocaleDateString() : "",
        fatherName: student.fatherName || "",
        motherName: student.motherName || "",
        admissionDate: student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "",
        expectedCompletionYear: student.expectedCompletionYear || "",
      });
    }
    // Add other document types as needed
  };

  // Change Password Handler
  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err: unknown) {
      const error = err as Error;
      setPasswordError(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      {/* TOP BAR */}
      <div className={styles.topBar}>
        <h2 className={styles.title}>Student Dashboard</h2>

        <div className={styles.rightSection}>
          {/* Notifications */}
          <div className={styles.notificationWrapper}>
            <button
              className={styles.notification}
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) {
                  markNotificationsRead();
                }
              }}
            >
              <Bell size={22} />
              {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <div className={styles.notificationHeader}>
                  <h4>Notifications</h4>
                  <button onClick={() => setShowNotifications(false)}>
                    <X size={18} />
                  </button>
                </div>
                <div className={styles.notificationList}>
                  {notifications.length === 0 ? (
                    <p className={styles.noNotifications}>No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`${styles.notificationItem} ${!n.read ? styles.unread : ""} ${styles[n.type]}`}
                      >
                        <div className={styles.notificationIcon}>
                          {n.type === "approval" ? (
                            <CheckCircle size={18} />
                          ) : n.type === "rejection" ? (
                            <XCircle size={18} />
                          ) : (
                            <Bell size={18} />
                          )}
                        </div>
                        <div className={styles.notificationContent}>
                          <p className={styles.notificationTitle}>{n.title}</p>
                          <p className={styles.notificationMessage}>{n.message}</p>
                          <span className={styles.notificationDate}>{formatDate(n.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {student && (
            <div className={styles.profile}>
              <div className={styles.avatar}>{student.name.charAt(0).toUpperCase()}</div>
              <div>
                <p className={styles.name}>{student.name}</p>
                <button className={styles.logout} onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Info */}
      {student && (
        <section className={styles.studentInfo}>
          <h2>Profile Information</h2>
          <div className={styles.infoGrid}>
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Registration No:</strong> {student.regNo}</p>
            <p><strong>Course:</strong> {student.course || "N/A"}</p>
            <p><strong>Branch:</strong> {student.branch || "N/A"}</p>
            <p><strong>Session:</strong> {student.session || "N/A"}</p>
            <p><strong>Semester:</strong> {student.semester || "N/A"}</p>
            <p><strong>Year:</strong> {student.year || "N/A"}</p>
            {student.mobile && <p><strong>Mobile:</strong> {student.mobile}</p>}
            {student.email && <p><strong>Email:</strong> {student.email}</p>}
          </div>
          <button className={styles.changePasswordBtn} onClick={() => setShowPasswordModal(true)}>
            <Lock size={16} /> Change Password
          </button>
        </section>
      )}

      {/* Services */}
      <section className={styles.services}>
        <h2>Apply for Services</h2>
        <div className={styles.serviceGrid}>
          {Object.entries(serviceLabels).map(([key, label]) => (
            <button
              key={key}
              className={styles.serviceCard}
              onClick={() => setSelectedService(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Service Request Modal */}
      {selectedService && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Apply for {serviceLabels[selectedService]}</h3>
              <button onClick={() => setSelectedService(null)}>
                <X />
              </button>
            </div>

            {/* Dynamic Fields based on Service Type */}
            
            {/* Bonafide Certificate */}
            {selectedService === "Bonafide" && (
              <>
                <label>Purpose Type *</label>
                <select 
                  value={purposeType} 
                  onChange={(e) => setPurposeType(e.target.value)}
                  className={styles.selectInput}
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="Education">Education Loan</option>
                  <option value="Scholarship">Scholarship</option>
                  <option value="Internship">Internship</option>
                  <option value="Other">Other</option>
                </select>
              </>
            )}

            {/* Fee Structure */}
            {selectedService === "FeeStructure" && (
              <>
                <label>Academic Year *</label>
                <input
                  type="text"
                  placeholder="e.g., 2025-2026"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className={styles.textInput}
                  pattern="^\d{4}-\d{4}$"
                  title="Academic year must be in YYYY-YYYY format"
                  required
                />
                <label>Purpose *</label>
                <select 
                  value={purposeType} 
                  onChange={(e) => setPurposeType(e.target.value)}
                  className={styles.selectInput}
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="State Level">State Level PMS</option>
                  <option value="Central Level">Central Level NSP</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Loan">Bank Loan</option>
                </select>

                {/* Fee Input Form - visible after purpose is selected */}
                {purposeType && (
                  <div style={{marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: 8}}>
                    <h4 style={{marginBottom: 8}}>Enter Fee Details</h4>
                    <label>paymentDate</label>
                    <input type="date" className={styles.textInput} value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required />
                    <label>Transaction ID</label>
                    <input type="string" min="0" className={styles.textInput} placeholder="Transaction ID" value={transactionId} onChange={e => setTransactionId(e.target.value)} required />
                    <label>Admission Fee</label>
                    <input type="number" min="0" className={styles.textInput} placeholder="Admission Fee" value={admissionFee} onChange={e => setAdmissionFee(e.target.value)} required />
                    <label>Tuition Fee</label>
                    <input type="number" min="0" className={styles.textInput} placeholder="Tuition Fee" value={tuitionFee} onChange={e => setTuitionFee(e.target.value)} required />
                    <label>Registration Fee</label>
                    <input type="number" min="0" className={styles.textInput} placeholder="Registration Fee" value={registrationFee} onChange={e => setRegistrationFee(e.target.value)} required />
                    <label>Exam Fee</label>
                    <input type="number" min="0" className={styles.textInput} placeholder="Exam Fee" value={examFee} onChange={e => setExamFee(e.target.value)} required />
                    <label>Development Fee</label>
                    <input type="number" min="0" className={styles.textInput} placeholder="Development Fee" value={developmentFee} onChange={e => setDevelopmentFee(e.target.value)} required />
                    <label>Other Charges</label>
                    <input type="number" min="0" className={styles.textInput} placeholder="Other Charges" value={otherCharges} onChange={e => setOtherCharges(e.target.value)} required />
                  </div>
                )}
              </>
            )}
{/* // Fee input state for Fee Structure
  const [admissionFee, setAdmissionFee] = useState("");
  const [tuitionFee, setTuitionFee] = useState("");
  const [registrationFee, setRegistrationFee] = useState("");
  const [examFee, setExamFee] = useState("");
  const [developmentFee, setDevelopmentFee] = useState("");
  const [otherCharges, setOtherCharges] = useState(""); */}

            {/* Transfer Certificate */}
            {selectedService === "TC" && (
              <>
                <label>Reason for Leaving *</label>
                <textarea
                  placeholder="Reason for applying for TC..."
                  value={reasonForLeaving}
                  onChange={(e) => setReasonForLeaving(e.target.value)}
                  required
                  minLength={10}
                />
                <label>Last Semester Completed *</label>
                <input
                  type="number"
                  placeholder="e.g., 8"
                  value={lastSemesterCompleted}
                  onChange={(e) => setLastSemesterCompleted(e.target.value)}
                  className={styles.textInput}
                  required
                  min="1"
                  max="8"
                />
              </>
            )}

            {/* Character Certificate */}
            {selectedService === "CharacterCertificate" && (
              <>
                <label>Purpose Type *</label>
                <select 
                  value={purposeType} 
                  onChange={(e) => setPurposeType(e.target.value)}
                  className={styles.selectInput}
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="HigherStudies">Higher Studies</option>
                  <option value="Job">Job Application</option>
                  <option value="Other">Other</option>
                </select>
              </>
            )}

            {/* NOC */}
            {selectedService === "NOC" && (
              <>
                <label>Purpose Type *</label>
                <select 
                  value={purposeType} 
                  onChange={(e) => setPurposeType(e.target.value)}
                  className={styles.selectInput}
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="Internship">Internship</option>
                  <option value="Event">Event Participation</option>
                  <option value="Visit">Industrial Visit</option>
                </select>
                <label>Organization Name *</label>
                <input
                  type="text"
                  placeholder="Name of organization/company"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className={styles.textInput}
                  required
                />
              </>
            )}

            {/* No Dues */}
            {selectedService === "NoDues" && (
              <>
                <label>Department Clearances</label>
                <div className={styles.checkboxGroup}>
                  {Object.entries(departmentClearances).map(([key, checked]) => (
                    <label key={key} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setDepartmentClearances((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                      />
                      {key.charAt(0).toUpperCase() + key.slice(1)} Clearance
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* Generic Purpose Field (always visible as Description/Remarks) */}
            <label>
              {selectedService === "TC" ? "Additional Remarks" : 
               selectedService === "NoDues" ? "Purpose of No Dues" :
               "Description / Purpose *"}
            </label>
            <textarea
              placeholder="Enter details..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              minLength={10}
            />

            {submitError && <p className={styles.errorMsg}>{submitError}</p>}
            {submitSuccess && <p className={styles.successMsg}>{submitSuccess}</p>}

            <button
              className={styles.sendBtn}
              onClick={handleSendRequest}
              disabled={submitLoading}
            >
              {submitLoading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      )}

      {/* Request Status */}
      <section className={styles.status}>
        <h2>Request Status</h2>
        {requestsLoading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className={styles.noData}>No service requests yet. Apply for a service above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Purpose</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>{serviceLabels[req.serviceType] || req.serviceType}</td>
                  <td className={styles.purposeCell}>{req.purpose}</td>
                  <td>{formatDate(req.createdAt)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[req.status.toLowerCase()]}`}>
                      {req.status === "Pending" && <Clock size={14} />}
                      {req.status === "Approved" && <CheckCircle size={14} />}
                      {req.status === "Rejected" && <XCircle size={14} />}
                      {req.status}
                    </span>
                    {req.status === "Rejected" && req.rejectionReason && (
                      <p className={styles.rejectionReason}>Reason: {req.rejectionReason}</p>
                    )}
                  </td>
                  <td>
                    {req.status === "Approved" && (
                      <button
                        className={styles.downloadBtn}
                        onClick={() => handleDownload(req)}
                      >
                        <Download size={16} /> Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Hostel Applications Status */}
      <section className={styles.status}>
        <h2>Hostel Application Status</h2>
        {hostelAppsLoading ? (
          <p>Loading hostel applications...</p>
        ) : hostelApps.length === 0 ? (
          <div className={styles.noData} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <p>No hostel applications submitted.</p>
            <button 
              className={styles.sendBtn} 
              style={{ width: 'auto', padding: '0.5rem 1rem' }}
              onClick={() => router.push('/hostel-services')}
            >
              Apply for Hostel
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Hostel Type</th>
                <th>Room Preference</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {hostelApps.map((app) => (
                <tr key={app._id}>
                  <td>{app.hostelType}</td>
                  <td>{app.roomPreference}</td>
                  <td>{formatDate(app.createdAt)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[app.status.toLowerCase()]}`}>
                      {app.status === "Pending" && <Clock size={14} />}
                      {app.status === "Approved" && <CheckCircle size={14} />}
                      {app.status === "Rejected" && <XCircle size={14} />}
                      {app.status}
                    </span>
                    {app.status === "Rejected" && app.rejectionReason && (
                      <p className={styles.rejectionReason}>Reason: {app.rejectionReason}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)}>
                <X />
              </button>
            </div>

            <label>Current Password *</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <label>New Password *</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label>Confirm New Password *</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {passwordError && <p className={styles.errorMsg}>{passwordError}</p>}
            {passwordSuccess && <p className={styles.successMsg}>{passwordSuccess}</p>}

            <button
              className={styles.sendBtn}
              onClick={handleChangePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
