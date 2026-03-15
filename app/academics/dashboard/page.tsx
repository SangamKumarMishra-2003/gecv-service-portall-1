"use client";

import { useEffect, useState } from "react";
import styles from "./AcademicsDashboard.module.scss";
import { Bell, LogOut, X, Lock, Users, UserPlus, Trash2, Eye, EyeOff, Check, XCircle, Clock, Download, FileText, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateBonafidePDF } from "../../utils/generateBonafidePDF";

interface UserInfo {
  name: string;
  email: string;
  role: string;
  mobile?: string;
}

interface ManagedUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  regNo?: string;
  mobile?: string;
  course?: string;
  branch?: string;
  semester?: number;
  session?: string;
  year?: number;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  admissionDate?: string;
  expectedCompletionYear?: string;
}

interface Student {
  _id: string;
  name: string;
  regNo: string;
  email: string;
  mobile?: string;
  course?: string;
  branch?: string;
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
  studentId: Student;
  serviceType: string;
  status: "Pending" | "Approved" | "Rejected";
  purpose?: string;
  purposeType?: string;
  academicYear?: string;
  reasonForLeaving?: string;
  lastSemesterCompleted?: number;
  organizationName?: string;
  departmentClearances?: {
    library: boolean;
    hostel: boolean;
    lab: boolean;
    accounts: boolean;
    sports: boolean;
  };
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "approval" | "rejection" | "info";
  read: boolean;
  createdAt: string;
}

interface HostelApplication {
  _id: string;
  studentId: Student;
  fullName: string;
  regNo: string;
  applicationNo: string;
  gender: string;
  dob: string;
  category: string;
  nationality: string;
  bloodGroup: string;
  aadhaarNo: string;
  collegeName: string;
  course: string;
  branch: string;
  yearSemester: string;
  academicSession: string;
  admissionMode: string;
  permanentAddress: string;
  cityVillage: string;
  district: string;
  state: string;
  pinCode: string;
  fatherName: string;
  motherName: string;
  guardianName?: string;
  occupation: string;
  mobileNo: string;
  alternateMobileNo?: string;
  emailId: string;
  hostelType: string;
  roomPreference: string;
  floorPreference?: string;
  status: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string;
  createdAt: string;
}

export default function AcademicsDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Service Requests State
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsFilter, setRequestsFilter] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [filterService, setFilterService] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Approve/Reject Modal State
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"student" | "faculty">("student");
  const [newUserRegNo, setNewUserRegNo] = useState("");
  const [newUserMobile, setNewUserMobile] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Edit User Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ManagedUser>>({});
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Hostel Applications State
  const [hostelApps, setHostelApps] = useState<HostelApplication[]>([]);
  const [loadingHostelApps, setLoadingHostelApps] = useState(false);
  const [hostelAppsFilter, setHostelAppsFilter] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [selectedHostelApp, setSelectedHostelApp] = useState<HostelApplication | null>(null);
  const [hostelActionType, setHostelActionType] = useState<"approve" | "reject" | null>(null);
  const [hostelRejectionReason, setHostelRejectionReason] = useState("");
  const [hostelActionLoading, setHostelActionLoading] = useState(false);
  const [hostelActionError, setHostelActionError] = useState("");

  // Active Tab
  const [activeTab, setActiveTab] = useState<"profile" | "requests" | "users" | "hostel">("requests");

  const getToken = () => localStorage.getItem("token");

  const getTokenOrRedirect = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("user");
      router.push("/login");
      return null;
    }
    return token;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchNotifications();
  }, [router]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "requests") {
      fetchRequests();
    } else if (activeTab === "hostel") {
      fetchHostelApps();
    }
  }, [activeTab, requestsFilter, filterService, hostelAppsFilter]);

  // Service type mapping
  const serviceLabels: Record<string, string> = {
    Bonafide: "Bonafide Certificate",
    FeeStructure: "Fee Structure",
    TC: "Transfer Certificate",
    CharacterCertificate: "Character Certificate",
    NOC: "No Objection Certificate",
    NoDues: "No Dues Certificate",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Fetch Notifications
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
    } catch (err) {
      console.error("Failed to mark notifications as read");
    }
  };

  // Fetch Service Requests
  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      let url = `/api/service-requests?status=${requestsFilter}`;
      if (filterService) {
        url += `&serviceType=${filterService}`;
      }
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Failed to fetch requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  // Fetch Hostel Applications
  const fetchHostelApps = async () => {
    setLoadingHostelApps(true);
    try {
      const res = await fetch(`/api/hostel-applications?status=${hostelAppsFilter}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setHostelApps(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to fetch hostel applications");
    } finally {
      setLoadingHostelApps(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = getTokenOrRedirect();
      if (!token) return;
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Approve Request
  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    setActionError("");

    try {
      const res = await fetch(`/api/service-requests/${selectedRequest._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ action: "approve" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      // Generate and download PDF based on service type
      const student = selectedRequest.studentId;
      if (selectedRequest.serviceType === "Bonafide") {
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

      // Close modal and refresh
      setSelectedRequest(null);
      setActionType(null);
      fetchRequests();
    } catch (err: unknown) {
      const error = err as Error;
      setActionError(error.message || "Failed to approve request");
    } finally {
      setActionLoading(false);
    }
  };

  // Download document for approved request
  const handleDownloadDocument = (request: ServiceRequest) => {
    const student = request.studentId;
    if (!student) return;

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

  // Reject Request
  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      setActionError("Please provide a reason for rejection");
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      const res = await fetch(`/api/service-requests/${selectedRequest._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ action: "reject", rejectionReason: rejectionReason.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      // Close modal and refresh
      setSelectedRequest(null);
      setActionType(null);
      setRejectionReason("");
      fetchRequests();
    } catch (err: unknown) {
      const error = err as Error;
      setActionError(error.message || "Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  // Approve Hostel App
  const handleApproveHostelApp = async () => {
    if (!selectedHostelApp) return;
    setHostelActionLoading(true);
    setHostelActionError("");

    try {
      const res = await fetch(`/api/hostel-applications/${selectedHostelApp._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ action: "approve" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setSelectedHostelApp(null);
      setHostelActionType(null);
      fetchHostelApps();
    } catch (err: any) {
      setHostelActionError(err.message || "Failed to approve application");
    } finally {
      setHostelActionLoading(false);
    }
  };

  // Reject Hostel App
  const handleRejectHostelApp = async () => {
    if (!selectedHostelApp || !hostelRejectionReason.trim()) {
      setHostelActionError("Please provide a reason for rejection");
      return;
    }

    setHostelActionLoading(true);
    setHostelActionError("");

    try {
      const res = await fetch(`/api/hostel-applications/${selectedHostelApp._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ action: "reject", rejectionReason: hostelRejectionReason.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setSelectedHostelApp(null);
      setHostelActionType(null);
      setHostelRejectionReason("");
      fetchHostelApps();
    } catch (err: any) {
      setHostelActionError(err.message || "Failed to reject application");
    } finally {
      setHostelActionLoading(false);
    }
  };

  // Create User
  const handleCreateUser = async () => {
    setCreateError("");
    setCreateSuccess("");

    if (!newUserName || !newUserEmail || !newUserPassword) {
      setCreateError("Name, email, and password are required");
      return;
    }

    if (newUserRole === "student" && !newUserRegNo) {
      setCreateError("Registration number is required for students");
      return;
    }

    setCreateLoading(true);

    try {
      const token = getTokenOrRedirect();
      if (!token) return;
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          regNo: newUserRegNo,
          mobile: newUserMobile,
        }),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setCreateSuccess(data.message);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRegNo("");
      setNewUserMobile("");
      fetchUsers();
      setTimeout(() => setShowCreateModal(false), 1500);
    } catch (err: unknown) {
      const error = err as Error;
      setCreateError(error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Update User
  const handleUpdateUser = async () => {
    setEditError("");
    setEditSuccess("");
    if (!editingUser) return;

    setEditLoading(true);

    try {
      const res = await fetch(`/api/users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ ...editFormData, _id: editingUser._id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setEditSuccess("User updated successfully");
      fetchUsers();
      setTimeout(() => {
        setShowEditModal(false);
        setEditingUser(null);
        setEditSuccess("");
      }, 1500);
    } catch (err: unknown) {
      const error = err as Error;
      setEditError(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditClick = (u: ManagedUser) => {
    setEditingUser(u);
    setEditFormData({
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        regNo: u.regNo,
        course: u.course,
        branch: u.branch,
        semester: u.semester,
        session: u.session,
        year: u.year,
        // Add other fields as needed
    });
    setShowEditModal(true);
  };

  // Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"?`)) return;

    try {
      const token = getTokenOrRedirect();
      if (!token) return;
      const res = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to delete user");
    }
  };

  // Change Password
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
      const token = getTokenOrRedirect();
      if (!token) return;
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <h2 className={styles.title}>Academics Dashboard</h2>
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
                      <div key={n._id} className={`${styles.notificationItem} ${!n.read ? styles.unread : ""}`}>
                        <p className={styles.notificationTitle}>{n.title}</p>
                        <p className={styles.notificationMessage}>{n.message}</p>
                        <span className={styles.notificationDate}>{formatDate(n.createdAt)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.profile}>
            <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <p className={styles.name}>{user.name}</p>
              <button className={styles.logout} onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "requests" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          <FileText size={18} /> Service Requests
        </button>
        <button
          className={`${styles.tab} ${activeTab === "hostel" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("hostel")}
        >
          <FileText size={18} /> Hostel Applications
        </button>
        <button
          className={`${styles.tab} ${activeTab === "users" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={18} /> Manage Users
        </button>
        <button
          className={`${styles.tab} ${activeTab === "profile" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
      </div>

      {/* Service Requests Tab */}
      {activeTab === "requests" && (
        <section className={styles.requestsSection}>
          <div className={styles.requestsHeader}>
            <h2>Service Requests</h2>
            <div className={styles.filterTabs}>
              {/* Service Type Filter */}
              <select
                className={styles.serviceFilter}
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
              >
                <option value="">All Services</option>
                {Object.entries(serviceLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              {(["Pending", "Approved", "Rejected"] as const).map((status) => (
                <button
                  key={status}
                  className={`${styles.filterBtn} ${requestsFilter === status ? styles.activeFilter : ""}`}
                  onClick={() => setRequestsFilter(status)}
                >
                  {status === "Pending" && <Clock size={16} />}
                  {status === "Approved" && <Check size={16} />}
                  {status === "Rejected" && <XCircle size={16} />}
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loadingRequests ? (
            <p className={styles.loadingText}>Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className={styles.noData}>No {requestsFilter.toLowerCase()} requests found.</p>
          ) : (
            <table className={styles.requestsTable}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Reg No</th>
                  <th>Service</th>
                  <th>Purpose</th>
                  <th>Date</th>
                  {requestsFilter === "Rejected" && <th>Reason</th>}
                  {requestsFilter === "Pending" && <th>Actions</th>}
                  {requestsFilter === "Approved" && <th>Download</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.studentId?.name || "N/A"}</td>
                    <td>{req.studentId?.regNo || "N/A"}</td>
                    <td>{serviceLabels[req.serviceType] || req.serviceType}</td>
                    <td className={styles.purposeCell}>{req.purpose}</td>
                    <td>{formatDate(req.createdAt)}</td>
                    {requestsFilter === "Rejected" && (
                      <td className={styles.rejectionCell}>{req.rejectionReason}</td>
                    )}
                    {requestsFilter === "Pending" && (
                      <td className={styles.actionsCell}>
                        <button
                          className={styles.approveBtn}
                          onClick={() => {
                            setSelectedRequest(req);
                            setActionType("approve");
                          }}
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button
                          className={styles.rejectBtn}
                          onClick={() => {
                            setSelectedRequest(req);
                            setActionType("reject");
                          }}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </td>
                    )}
                    {requestsFilter === "Approved" && (
                      <td>
                        <button
                          className={styles.downloadBtn}
                          onClick={() => handleDownloadDocument(req)}
                        >
                          <Download size={16} /> Download
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Hostel Applications Tab */}
      {activeTab === "hostel" && (
        <section className={styles.requestsSection}>
          <div className={styles.requestsHeader}>
            <h2>Hostel Applications</h2>
            <div className={styles.filterTabs}>
              {(["Pending", "Approved", "Rejected"] as const).map((status) => (
                <button
                  key={status}
                  className={`${styles.filterBtn} ${hostelAppsFilter === status ? styles.activeFilter : ""}`}
                  onClick={() => setHostelAppsFilter(status)}
                >
                  {status === "Pending" && <Clock size={16} />}
                  {status === "Approved" && <Check size={16} />}
                  {status === "Rejected" && <XCircle size={16} />}
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loadingHostelApps ? (
            <p className={styles.loadingText}>Loading applications...</p>
          ) : hostelApps.length === 0 ? (
            <p className={styles.noData}>No {hostelAppsFilter.toLowerCase()} applications found.</p>
          ) : (
            <table className={styles.requestsTable}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Reg No</th>
                  <th>Hostel Type</th>
                  <th>Room Pref</th>
                  <th>Date</th>
                  {hostelAppsFilter === "Pending" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {hostelApps.map((app) => (
                  <tr key={app._id}>
                    <td>{app.fullName}</td>
                    <td>{app.regNo}</td>
                    <td>{app.hostelType}</td>
                    <td>{app.roomPreference}</td>
                    <td>{formatDate(app.createdAt)}</td>
                    {hostelAppsFilter === "Pending" && (
                      <td className={styles.actionsCell}>
                        <button
                          className={styles.approveBtn}
                          onClick={() => {
                            setSelectedHostelApp(app);
                            setHostelActionType("approve");
                          }}
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button
                          className={styles.rejectBtn}
                          onClick={() => {
                            setSelectedHostelApp(app);
                            setHostelActionType("reject");
                          }}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <section className={styles.infoSection}>
          <h2>Profile Information</h2>
          <div className={styles.infoGrid}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> Academics</p>
          </div>
          <button className={styles.changePasswordBtn} onClick={() => setShowPasswordModal(true)}>
            <Lock size={16} /> Change Password
          </button>
        </section>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <section className={styles.usersSection}>
          <div className={styles.usersHeader}>
            <h2>Manage Students & Faculty</h2>
            <button className={styles.addBtn} onClick={() => setShowCreateModal(true)}>
              <UserPlus size={18} /> Add User
            </button>
          </div>

          {loadingUsers ? (
            <p>Loading users...</p>
          ) : (
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Reg No</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>No users found</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td className={styles[u.role]}>{u.role}</td>
                      <td>{u.regNo || "-"}</td>
                      <td>
                        <button
                          className={styles.editBtn}
                          style={{ marginRight: '8px', background: '#e0f2fe', color: '#0284c7' }}
                          onClick={() => handleEditClick(u)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteUser(u._id, u.name)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Approve Modal */}
      {selectedRequest && actionType === "approve" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Approve Request</h3>
              <button onClick={() => { setSelectedRequest(null); setActionType(null); }}>
                <X />
              </button>
            </div>

            <div className={styles.requestDetails}>
              <p><strong>Student:</strong> {selectedRequest.studentId?.name}</p>
              <p><strong>Reg No:</strong> {selectedRequest.studentId?.regNo}</p>
              <p><strong>Service:</strong> {serviceLabels[selectedRequest.serviceType]}</p>
              
              {selectedRequest.purposeType && <p><strong>Purpose Type:</strong> {selectedRequest.purposeType}</p>}
              {selectedRequest.academicYear && <p><strong>Academic Year:</strong> {selectedRequest.academicYear}</p>}
              {selectedRequest.reasonForLeaving && <p><strong>Reason for Leaving:</strong> {selectedRequest.reasonForLeaving}</p>}
              {selectedRequest.lastSemesterCompleted && <p><strong>Last Sem Completed:</strong> {selectedRequest.lastSemesterCompleted}</p>}
              {selectedRequest.organizationName && <p><strong>Organization:</strong> {selectedRequest.organizationName}</p>}
              
              {selectedRequest.departmentClearances && (
                <div>
                  <strong>Clearances:</strong>
                  <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                    {Object.entries(selectedRequest.departmentClearances).map(([dept, cleared]) => (
                      <li key={dept} style={{ color: cleared ? '#16a34a' : '#dc2626' }}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}: {cleared ? "Cleared" : "Pending"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedRequest.purpose && <p><strong>Details:</strong> {selectedRequest.purpose}</p>}
            </div>

            <p className={styles.confirmText}>
              Approving this request will generate and download the document. The student will be notified.
            </p>

            {actionError && <p className={styles.errorMsg}>{actionError}</p>}

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => { setSelectedRequest(null); setActionType(null); }}
              >
                Cancel
              </button>
              <button
                className={styles.confirmApproveBtn}
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Approve & Download"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {selectedRequest && actionType === "reject" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Reject Request</h3>
              <button onClick={() => { setSelectedRequest(null); setActionType(null); setRejectionReason(""); }}>
                <X />
              </button>
            </div>

            <div className={styles.requestDetails}>
              <p><strong>Student:</strong> {selectedRequest.studentId?.name}</p>
              <p><strong>Service:</strong> {serviceLabels[selectedRequest.serviceType]}</p>
            </div>

            <label>Reason for Rejection *</label>
            <textarea
              placeholder="Enter reason for rejecting this request..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />

            {actionError && <p className={styles.errorMsg}>{actionError}</p>}

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => { setSelectedRequest(null); setActionType(null); setRejectionReason(""); }}
              >
                Cancel
              </button>
              <button
                className={styles.confirmRejectBtn}
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? "Processing..." : "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Hostel App Modal */}
      {selectedHostelApp && hostelActionType === "approve" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className={styles.modalHeader}>
              <h3>Approve Hostel Application</h3>
              <button onClick={() => { setSelectedHostelApp(null); setHostelActionType(null); }}>
                <X />
              </button>
            </div>

            <div className={styles.requestDetails}>
              <p><strong>Name:</strong> {selectedHostelApp.fullName}</p>
              <p><strong>Reg No:</strong> {selectedHostelApp.regNo}</p>
              <p><strong>Course & Branch:</strong> {selectedHostelApp.course} ({selectedHostelApp.branch})</p>
              <p><strong>Hostel Type:</strong> {selectedHostelApp.hostelType}</p>
              <p><strong>Room Pref:</strong> {selectedHostelApp.roomPreference}</p>
              {selectedHostelApp.floorPreference && <p><strong>Floor Pref:</strong> {selectedHostelApp.floorPreference}</p>}
              <p><strong>Address:</strong> {selectedHostelApp.cityVillage}, {selectedHostelApp.district}, {selectedHostelApp.state}</p>
              <p><strong>Father:</strong> {selectedHostelApp.fatherName}</p>
              <p><strong>Mobile:</strong> {selectedHostelApp.mobileNo}</p>
            </div>

            <p className={styles.confirmText}>
              Are you sure you want to approve this hostel application?
            </p>

            {hostelActionError && <p className={styles.errorMsg}>{hostelActionError}</p>}

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => { setSelectedHostelApp(null); setHostelActionType(null); }}
              >
                Cancel
              </button>
              <button
                className={styles.confirmApproveBtn}
                onClick={handleApproveHostelApp}
                disabled={hostelActionLoading}
              >
                {hostelActionLoading ? "Processing..." : "Approve Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Hostel App Modal */}
      {selectedHostelApp && hostelActionType === "reject" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Reject Hostel Application</h3>
              <button onClick={() => { setSelectedHostelApp(null); setHostelActionType(null); setHostelRejectionReason(""); }}>
                <X />
              </button>
            </div>

            <div className={styles.requestDetails}>
              <p><strong>Name:</strong> {selectedHostelApp.fullName}</p>
              <p><strong>Reg No:</strong> {selectedHostelApp.regNo}</p>
            </div>

            <label>Reason for Rejection *</label>
            <textarea
              placeholder="Enter reason for rejecting..."
              value={hostelRejectionReason}
              onChange={(e) => setHostelRejectionReason(e.target.value)}
            />

            {hostelActionError && <p className={styles.errorMsg}>{hostelActionError}</p>}

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => { setSelectedHostelApp(null); setHostelActionType(null); setHostelRejectionReason(""); }}
              >
                Cancel
              </button>
              <button
                className={styles.confirmRejectBtn}
                onClick={handleRejectHostelApp}
                disabled={hostelActionLoading || !hostelRejectionReason.trim()}
              >
                {hostelActionLoading ? "Processing..." : "Reject Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Create New User</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X />
              </button>
            </div>

            <label>Role *</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as "student" | "faculty")}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>

            <label>Name *</label>
            <input
              type="text"
              placeholder="Full name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />

            <label>Email *</label>
            <input
              type="email"
              placeholder="Email address"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
            />

            <label>Password *</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {newUserRole === "student" && (
              <>
                <label>Registration Number *</label>
                <input
                  type="text"
                  placeholder="e.g., 21105152003"
                  value={newUserRegNo}
                  onChange={(e) => setNewUserRegNo(e.target.value)}
                />
              </>
            )}

            <label>Mobile (Optional)</label>
            <input
              type="text"
              placeholder="Mobile number"
              value={newUserMobile}
              onChange={(e) => setNewUserMobile(e.target.value)}
            />

            {createError && <p className={styles.errorMsg}>{createError}</p>}
            {createSuccess && <p className={styles.successMsg}>{createSuccess}</p>}

            <button
              className={styles.submitBtn}
              onClick={handleCreateUser}
              disabled={createLoading}
            >
              {createLoading ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className={styles.modalOverlay}>
            <div className={styles.modal} style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className={styles.modalHeader}>
                    <h3>Edit User: {editingUser.name}</h3>
                    <button onClick={() => setShowEditModal(false)}><X /></button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <label>Full Name</label>
                    <input 
                        value={editFormData.name || ""} 
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    />
                    
                    <label>Email</label>
                    <input 
                        value={editFormData.email || ""} 
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    />

                    <label>Mobile</label>
                    <input 
                        value={editFormData.mobile || ""} 
                        onChange={(e) => setEditFormData({...editFormData, mobile: e.target.value})}
                        placeholder="Mobile Number"
                    />

                    {editingUser.role === 'student' && (
                        <>
                            <label>Registration Number</label>
                            <input 
                                value={editFormData.regNo || ""} 
                                onChange={(e) => setEditFormData({...editFormData, regNo: e.target.value})}
                            />
                            
                            <hr style={{ margin: '10px 0', border: '0', borderTop: '1px solid #eee' }} />
                            <strong style={{ fontSize: '14px', color: '#555' }}>Academic Details</strong>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label>Course</label>
                                    <input 
                                        placeholder="e.g. B.Tech"
                                        value={editFormData.course || ""} 
                                        onChange={(e) => setEditFormData({...editFormData, course: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label>Branch</label>
                                    <input 
                                        placeholder="e.g. CSE"
                                        value={editFormData.branch || ""} 
                                        onChange={(e) => setEditFormData({...editFormData, branch: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label>Semester</label>
                                    <input 
                                        type="number"
                                        placeholder="e.g. 1-8"
                                        value={editFormData.semester || ""} 
                                        onChange={(e) => setEditFormData({...editFormData, semester: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label>Session (Start-End)</label>
                                    <input 
                                        placeholder="e.g. 2021-2025"
                                        value={editFormData.session || ""} 
                                        onChange={(e) => setEditFormData({...editFormData, session: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label>Year</label>
                                    <input 
                                        type="number"
                                        placeholder="e.g. 1-4"
                                        value={editFormData.year || ""} 
                                        onChange={(e) => setEditFormData({...editFormData, year: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {editError && <p className={styles.errorMsg} style={{ marginTop: '10px' }}>{editError}</p>}
                {editSuccess && <p className={styles.successMsg} style={{ marginTop: '10px' }}>{editSuccess}</p>}

                <div className={styles.modalActions} style={{ marginTop: '20px' }}>
                    <button className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>Cancel</button>
                    <button 
                        className={styles.submitBtn} 
                        onClick={handleUpdateUser}
                        disabled={editLoading}
                    >
                        {editLoading ? "Updating..." : "Update User"}
                    </button>
                </div>
            </div>
        </div>
      )}

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
              className={styles.submitBtn}
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
