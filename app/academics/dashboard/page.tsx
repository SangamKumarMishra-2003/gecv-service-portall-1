"use client";

import { useEffect, useState } from "react";
import styles from "./AcademicsDashboard.module.scss";
import {
  Bell,
  LogOut,
  X,
  Lock,
  Users,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  XCircle,
  Clock,
  Download,
  FileText,
  Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { generateBonafidePDF } from "../../utils/generateBonafidePDF";
import { generateFeeStructurePDFDashboard } from "../../utils/generateFeeStructurePDFDashboard";

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
  category?: string;
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
  const [newUserCourse, setNewUserCourse] = useState("");
  const [newUserBranch, setNewUserBranch] = useState("");
  const [newUserSemester, setNewUserSemester] = useState<number | "">("");
  const [newUserYear, setNewUserYear] = useState<number | "">("");
  const [newUserSession, setNewUserSession] = useState("");
  const [newUserFatherName, setNewUserFatherName] = useState("");
  const [newUserMotherName, setNewUserMotherName] = useState("");
  const [newUserDob, setNewUserDob] = useState("");
  const [newUserAdmissionDate, setNewUserAdmissionDate] = useState("");
  const [newUserExpectedCompletion, setNewUserExpectedCompletion] = useState("");
  const [newUserCategory, setNewUserCategory] = useState("");
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

  // CSV Import State
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [csvPreview, setCsvPreview] = useState<Partial<ManagedUser>[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvError, setCsvError] = useState("");
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvRowCount, setCsvRowCount] = useState(0);

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
    if (!storedUser || !getToken()) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, requestsFilter, filterService]);

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

  // ---------------- Notifications ----------------
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
      // update local notifications as read for UI
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read");
    }
  };

  // ---------------- Requests ----------------
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

  // ---------------- Users ----------------
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
        throw new Error(data.message || "Failed to approve");
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
      } else if (selectedRequest.serviceType === "FeeStructure") {
        generateFeeStructurePDFDashboard({
          name: student.name,
          regNo: student.regNo,
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
          paymentDate: selectedRequest.paymentDate || "",
          transactionId: selectedRequest.transactionId || "",
          admissionFee: Number(selectedRequest.admissionFee) || 0,
          tuitionFee: Number(selectedRequest.tuitionFee) || 0,
          registrationFee: Number(selectedRequest.registrationFee) || 0,
          examFee: Number(selectedRequest.examFee) || 0,
          developmentFee: Number(selectedRequest.developmentFee) || 0,
          otherCharges: Number(selectedRequest.otherCharges) || 0,
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
    } else if (request.serviceType === "FeeStructure") {
      generateFeeStructurePDFDashboard({
        name: student.name,
        regNo: student.regNo,
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
        paymentDate: request.paymentDate || "",
        transactionId: request.transactionId || "",
        admissionFee: Number(request.admissionFee) || 0,
        tuitionFee: Number(request.tuitionFee) || 0,
        registrationFee: Number(request.registrationFee) || 0,
        examFee: Number(request.examFee) || 0,
        developmentFee: Number(request.developmentFee) || 0,
        otherCharges: Number(request.otherCharges) || 0,
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
        throw new Error(data.message || "Failed to reject");
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

    // Basic validation
    if (!newUserName || !newUserEmail || !newUserPassword) {
      setCreateError("Name, email, and password are required");
      return;
    }

    // Name validation
    if (!/^[a-zA-Z\s\.]+$/.test(newUserName) || newUserName.length < 2 || newUserName.length > 50) {
      setCreateError("Name must be 2-50 characters and contain only letters, spaces, and periods");
      return;
    }

    // Email validation
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(newUserEmail)) {
      setCreateError("Please enter a valid email address");
      return;
    }

    // Password strength validation
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newUserPassword)) {
      setCreateError("Password must be at least 8 characters with uppercase, lowercase, number, and special character");
      return;
    }

    if (newUserRole === "student") {
      if (!newUserRegNo) {
        setCreateError("Registration number is required for students");
        return;
      }

      // Registration number validation
      if (!/^\d{11}$/.test(newUserRegNo)) {
        setCreateError("Registration number must be exactly 11 digits");
        return;
      }

      // Mobile validation (if provided)
      if (newUserMobile && !/^[6-9]\d{9}$/.test(newUserMobile)) {
        setCreateError("Mobile number must start with 6-9 and be 10 digits");
        return;
      }

      // Academic details validation
      if (!newUserCourse || !newUserBranch || !newUserSemester || !newUserYear || !newUserSession) {
        setCreateError("Course, branch, semester, year, and session are required for students");
        return;
      }

      // Session format validation
      if (!/^\d{4}-\d{4}$/.test(newUserSession)) {
        setCreateError("Session must be in YYYY-YYYY format");
        return;
      }

      const sessionStart = parseInt(newUserSession.split('-')[0]);
      const sessionEnd = parseInt(newUserSession.split('-')[1]);
      if (sessionEnd <= sessionStart) {
        setCreateError("Session end year must be greater than start year");
        return;
      }

      // Expected completion validation
      if (!newUserExpectedCompletion || !/^\d{4}$/.test(newUserExpectedCompletion)) {
        setCreateError("Expected completion year must be in YYYY format");
        return;
      }

      const expectedYear = parseInt(newUserExpectedCompletion);
      if (expectedYear < sessionStart || expectedYear > sessionEnd + 2) {
        setCreateError("Expected completion year should be within session range");
        return;
      }

      // Semester and year validation
      if (newUserSemester < 1 || newUserSemester > 8) {
        setCreateError("Semester must be between 1 and 8");
        return;
      }
      if (newUserYear < 1 || newUserYear > 4) {
        setCreateError("Year must be between 1 and 4");
        return;
      }

      // Personal details validation
      if (!newUserFatherName || !newUserMotherName || !newUserDob || !newUserAdmissionDate || !newUserCategory) {
        setCreateError("Father's name, mother's name, date of birth, admission date, and category are required for students");
        return;
      }

      // Parent names validation
      if (!/^[a-zA-Z\s\.]+$/.test(newUserFatherName) || newUserFatherName.length < 2 || newUserFatherName.length > 50) {
        setCreateError("Father's name must be 2-50 characters and contain only letters, spaces, and periods");
        return;
      }
      if (!/^[a-zA-Z\s\.]+$/.test(newUserMotherName) || newUserMotherName.length < 2 || newUserMotherName.length > 50) {
        setCreateError("Mother's name must be 2-50 characters and contain only letters, spaces, and periods");
        return;
      }

      // Date validations
      const today = new Date().toISOString().split('T')[0];
      if (newUserDob > today) {
        setCreateError("Date of birth cannot be in the future");
        return;
      }
      if (newUserAdmissionDate > today) {
        setCreateError("Date of admission cannot be in the future");
        return;
      }

      const dob = new Date(newUserDob);
      const admissionDate = new Date(newUserAdmissionDate);
      const ageAtAdmission = admissionDate.getFullYear() - dob.getFullYear();
      if (ageAtAdmission < 15 || ageAtAdmission > 30) {
        setCreateError("Student age at admission should be between 15-30 years");
        return;
      }
    }

    // Faculty mobile validation (if provided)
    if (newUserRole === "faculty" && newUserMobile && !/^[6-9]\d{9}$/.test(newUserMobile)) {
      setCreateError("Mobile number must start with 6-9 and be 10 digits");
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
          course: newUserCourse,
          branch: newUserBranch,
          semester: newUserSemester,
          year: newUserYear,
          session: newUserSession,
          fatherName: newUserFatherName,
          motherName: newUserMotherName,
          dob: newUserDob,
          admissionDate: newUserAdmissionDate,
          expectedCompletionYear: newUserExpectedCompletion,
          category: newUserCategory,
        }),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      setCreateSuccess(data.message || "User created");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRegNo("");
      setNewUserMobile("");
      setNewUserCourse("");
      setNewUserBranch("");
      setNewUserSemester("");
      setNewUserYear("");
      setNewUserSession("");
      setNewUserFatherName("");
      setNewUserMotherName("");
      setNewUserDob("");
      setNewUserAdmissionDate("");
      setNewUserExpectedCompletion("");
      setNewUserCategory("");
      fetchUsers();
      setTimeout(() => setShowCreateModal(false), 1200);
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
        throw new Error(data.message || "Failed to update user");
      }

      setEditSuccess("User updated successfully");
      fetchUsers();
      setTimeout(() => {
        setShowEditModal(false);
        setEditingUser(null);
        setEditSuccess("");
      }, 1200);
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
      fatherName: u.fatherName,
      motherName: u.motherName,
      dob: u.dob,
      admissionDate: u.admissionDate,
      expectedCompletionYear: u.expectedCompletionYear,
      category: u.category,
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
      } else {
        console.error("Failed to delete user");
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
        throw new Error(data.message || "Failed to change password");
      }

      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setShowPasswordModal(false), 1200);
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

  // ---------------- CSV parsing & import ----------------

  // Robust-ish CSV line splitter (handles quoted fields, double quotes inside quotes)
  const splitCSVLine = (line: string) => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            cur += '"';
            i++; // skip next quote
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          result.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
    }
    result.push(cur);
    return result;
  };

  const parseCSVText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim() !== "");
    if (lines.length === 0) return { headers: [], rows: [] as string[][] };

    const headers = splitCSVLine(lines[0]).map((h) => h.trim());
    const rows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const cols = splitCSVLine(line);
      // Normalize length
      while (cols.length < headers.length) cols.push("");
      rows.push(cols);
    }
    return { headers, rows };
  };

  const normalizeHeaderToField = (h: string) => {
    const key = h.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    // common header mappings
    if (/(name|fullname|studentname)/.test(key)) return "name";
    if (/(email|e-mail|studentemail)/.test(key)) return "email";
    if (/(reg|regno|registration|registrationno|roll)/.test(key)) return "regNo";
    if (/(mobile|phone|contact)/.test(key)) return "mobile";
    if (/(course)/.test(key)) return "course";
    if (/(branch|dept|department)/.test(key)) return "branch";
    if (/(semester|sem)/.test(key)) return "semester";
    if (/(session)/.test(key)) return "session";
    if (/(year)/.test(key)) return "year";
    if (/(father|fathername)/.test(key)) return "fatherName";
    if (/(mother|mothername)/.test(key)) return "motherName";
    if (/(dob|dateofbirth)/.test(key)) return "dob";
    if (/(admissiondate|admission)/.test(key)) return "admissionDate";
    if (/(expectedcompletion|expectedcompletionyear|completion)/.test(key)) return "expectedCompletionYear";
    if (/(category|cat)/.test(key)) return "category";
    return ""; // unknown
  };

  const handleCSVFileChange = (file: File | null) => {
    setCsvError("");
    setCsvFileName("");
    setCsvPreview([]);
    setCsvHeaders([]);
    setCsvRowCount(0);
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      try {
        const { headers, rows } = parseCSVText(text);
        if (headers.length === 0) {
          setCsvError("No headers found in CSV");
          return;
        }
        setCsvHeaders(headers);

        // Map rows to objects
        const mapped = rows.map((cols) => {
          const obj: Partial<ManagedUser> = {};
          for (let i = 0; i < headers.length; i++) {
            const field = normalizeHeaderToField(headers[i]);
            if (!field) continue;
            const val = cols[i] ? cols[i].trim() : "";
            // try basic conversions
            if (field === "semester" || field === "year") {
              const num = Number(val);
              (obj as any)[field] = isNaN(num) ? undefined : num;
            } else {
              (obj as any)[field] = val;
            }
          }
          // default role student for CSV import
          (obj as any).role = "student";
          return obj;
        });

        setCsvRowCount(mapped.length);
        // show preview up to 50 rows
        setCsvPreview(mapped.slice(0, 50));
      } catch (e) {
        setCsvError("Failed to parse CSV");
        console.error(e);
      }
    };
    reader.onerror = () => {
      setCsvError("Failed to read file");
    };
    reader.readAsText(file);
  };

  // ---------------- CSV import (updated default password) ----------------
const handleImportCSV = async (rawText?: string) => {
  setCsvError("");
  setCsvUploading(true);
  try {
    // Use the parsed preview rows (preview contains mapped fields).
    // Ensure each row includes the default password for new students.
    const rowsToSend: Partial<ManagedUser & { password?: string }>[] = csvPreview.map((r) => ({
      ...r,
      role: (r as any).role || "student",
      password: "Student@123", // DEFAULT PASSWORD FOR CSV IMPORT
    }));

    // Attempt bulk endpoint first (includes passwords)
    const bulkRes = await fetch("/api/users/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ users: rowsToSend }),
    });

    if (bulkRes.ok) {
      // success
      await bulkRes.json().catch(() => ({}));
      setCsvUploading(false);
      setShowCSVModal(false);
      setCsvPreview([]);
      setCsvHeaders([]);
      setCsvFileName("");
      fetchUsers();
      return;
    }

    // Bulk failed — fallback to sequential creates using the same default password
    const fallbackErrors: string[] = [];
    for (let i = 0; i < rowsToSend.length; i++) {
      const u = rowsToSend[i];
      try {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            name: u.name || "",
            email: u.email || "",
            password: u.password || "Student@123",
            role: u.role || "student",
            regNo: u.regNo || "",
            mobile: u.mobile || "",
            course: u.course || "",
            branch: u.branch || "",
            semester: u.semester,
            session: u.session,
            year: u.year,
            fatherName: u.fatherName,
            motherName: u.motherName,
            dob: u.dob,
            admissionDate: u.admissionDate,
            expectedCompletionYear: u.expectedCompletionYear,
            category: u.category,
          }),
        });

        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          fallbackErrors.push(`Row ${i + 1}: ${d.message || "failed"}`);
        }
      } catch (err) {
        fallbackErrors.push(`Row ${i + 1}: network error`);
      }
    }

    if (fallbackErrors.length) {
      setCsvError(`Import completed with errors:\n${fallbackErrors.join("\n")}`);
    } else {
      setShowCSVModal(false);
      setCsvPreview([]);
      setCsvHeaders([]);
      setCsvFileName("");
    }
    fetchUsers();
  } catch (err) {
    console.error(err);
    setCsvError("Import failed");
  } finally {
    setCsvUploading(false);
  }
};

  // If you want to allow user to paste CSV content manually and import -> utility
  const handlePasteCSVTextAndImport = (text: string) => {
    const { headers, rows } = parseCSVText(text);
    setCsvHeaders(headers);
    const mapped = rows.map((cols) => {
      const obj: Partial<ManagedUser> = {};
      for (let i = 0; i < headers.length; i++) {
        const field = normalizeHeaderToField(headers[i]);
        if (!field) continue;
        const val = cols[i] ? cols[i].trim() : "";
        if (field === "semester" || field === "year") {
          const num = Number(val);
          (obj as any)[field] = isNaN(num) ? undefined : num;
        } else {
          (obj as any)[field] = val;
        }
      }
      (obj as any).role = "student";
      return obj;
    });
    setCsvPreview(mapped.slice(0, 50));
    setCsvRowCount(mapped.length);
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
                    <td className={styles.purposeCell}>{req.purpose || req.purposeType}</td>
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
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> Academics
            </p>
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
            <div style={{ display: "flex", gap: "8px" }}>
              <button className={styles.addBtn} onClick={() => setShowCreateModal(true)}>
                <UserPlus size={18} /> Add User
              </button>
              <button
                className={styles.addBtn}
                onClick={() => {
                  setShowCSVModal(true);
                  setCsvError("");
                  setCsvPreview([]);
                  setCsvHeaders([]);
                  setCsvFileName("");
                }}
              >
                <FileText size={16} /> Import CSV
              </button>
            </div>
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
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      No users found
                    </td>
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
                          style={{ marginRight: "8px", background: "#e0f2fe", color: "#0284c7" }}
                          onClick={() => handleEditClick(u)}
                        >
                          <Edit size={16} />
                        </button>
                        <button className={styles.deleteBtn} onClick={() => handleDeleteUser(u._id, u.name)}>
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
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                }}
              >
                <X />
              </button>
            </div>

            <div className={styles.requestDetails}>
              <p>
                <strong>Student:</strong> {selectedRequest.studentId?.name}
              </p>
              <p>
                <strong>Reg No:</strong> {selectedRequest.studentId?.regNo}
              </p>
              <p>
                <strong>Service:</strong> {serviceLabels[selectedRequest.serviceType]}
              </p>

              {selectedRequest.purposeType && <p><strong>Purpose Type:</strong> {selectedRequest.purposeType}</p>}
              {selectedRequest.academicYear && <p><strong>Academic Year:</strong> {selectedRequest.academicYear}</p>}
              {selectedRequest.reasonForLeaving && <p><strong>Reason for Leaving:</strong> {selectedRequest.reasonForLeaving}</p>}
              {selectedRequest.lastSemesterCompleted && <p><strong>Last Sem Completed:</strong> {selectedRequest.lastSemesterCompleted}</p>}
              {selectedRequest.organizationName && <p><strong>Organization:</strong> {selectedRequest.organizationName}</p>}

              {selectedRequest.departmentClearances && (
                <div>
                  <strong>Clearances:</strong>
                  <ul style={{ paddingLeft: "20px", margin: "5px 0" }}>
                    {Object.entries(selectedRequest.departmentClearances).map(([dept, cleared]) => (
                      <li key={dept} style={{ color: cleared ? "#16a34a" : "#dc2626" }}>
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
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                }}
              >
                Cancel
              </button>
              <button className={styles.confirmApproveBtn} onClick={handleApprove} disabled={actionLoading}>
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
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                  setRejectionReason("");
                }}
              >
                <X />
              </button>
            </div>

            <div className={styles.requestDetails}>
              <p>
                <strong>Student:</strong> {selectedRequest.studentId?.name}
              </p>
              <p>
                <strong>Service:</strong> {serviceLabels[selectedRequest.serviceType]}
              </p>
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
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </button>
              <button className={styles.confirmRejectBtn} onClick={handleReject} disabled={actionLoading || !rejectionReason.trim()}>
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
          <div className={styles.modal} style={{ width: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className={styles.modalHeader}>
              <h3>Create New User</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label>Role *</label>
                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as "student" | "faculty")}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>

              <div>
                <label>Student Name *</label>
                <input
                  type="text"
                  placeholder="Full name (e.g., John Doe)"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                  pattern="^[a-zA-Z\s\.]+$"
                  title="Name can only contain letters, spaces, and periods"
                />
              </div>

              <div>
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="Email address (e.g., student@college.edu)"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                  title="Please enter a valid email address"
                />
              </div>

              <div>
                <label>Password *</label>
                <div className={styles.passwordInput}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (min 8 chars, include uppercase, lowercase, number, special char)"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                    minLength={8}
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                    title="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {newUserRole === "student" && (
                <>
                  <div>
                    <label>Registration No *</label>
                    <input
                      type="text"
                      placeholder="e.g., 21105152003 (11 digits)"
                      value={newUserRegNo}
                      onChange={(e) => setNewUserRegNo(e.target.value)}
                      required
                      pattern="^\d{11}$"
                      title="Registration number must be exactly 11 digits"
                      maxLength={11}
                    />
                  </div>

                  <div>
                    <label>Mobile</label>
                    <input
                      type="tel"
                      placeholder="Mobile number (10 digits)"
                      value={newUserMobile}
                      onChange={(e) => setNewUserMobile(e.target.value)}
                      pattern="^[6-9]\d{9}$"
                      title="Mobile number must start with 6-9 and be 10 digits"
                      maxLength={10}
                    />
                  </div>

                  <hr style={{ margin: "10px 0", border: "0", borderTop: "1px solid #eee" }} />
                  <strong style={{ fontSize: "14px", color: "#555" }}>Academic Details</strong>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div>
                      <label>Course *</label>
                      <select
                        value={newUserCourse}
                        onChange={(e) => setNewUserCourse(e.target.value)}
                        required
                      >
                        <option value="">Select Course</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="B.Sc">B.Sc</option>
                        <option value="M.Sc">M.Sc</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label>Branch *</label>
                      <select
                        value={newUserBranch}
                        onChange={(e) => setNewUserBranch(e.target.value)}
                        required
                      >
                        <option value="">Select Branch</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label>Semester *</label>
                      <input
                        type="number"
                        placeholder="1-8"
                        value={newUserSemester}
                        onChange={(e) => setNewUserSemester(e.target.value ? Number(e.target.value) : "")}
                        required
                        min="1"
                        max="8"
                      />
                    </div>
                    <div>
                      <label>Year *</label>
                      <input
                        type="number"
                        placeholder="1-4"
                        value={newUserYear}
                        onChange={(e) => setNewUserYear(e.target.value ? Number(e.target.value) : "")}
                        required
                        min="1"
                        max="4"
                      />
                    </div>
                    <div>
                      <label>Academic Session *</label>
                      <input
                        type="text"
                        placeholder="YYYY-YYYY (e.g., 2024-2028)"
                        value={newUserSession}
                        onChange={(e) => setNewUserSession(e.target.value)}
                        required
                        pattern="^\d{4}-\d{4}$"
                        title="Session must be in YYYY-YYYY format (e.g., 2024-2028)"
                        maxLength={9}
                      />
                    </div>
                    <div>
                      <label>Expected Completion *</label>
                      <input
                        type="text"
                        placeholder="YYYY (e.g., 2028)"
                        value={newUserExpectedCompletion}
                        onChange={(e) => setNewUserExpectedCompletion(e.target.value)}
                        required
                        pattern="^\d{4}$"
                        title="Expected completion year must be in YYYY format"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <hr style={{ margin: "10px 0", border: "0", borderTop: "1px solid #eee" }} />
                  <strong style={{ fontSize: "14px", color: "#555" }}>Personal Details</strong>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div>
                      <label>Father's Name *</label>
                      <input
                        type="text"
                        placeholder="Father's full name"
                        value={newUserFatherName}
                        onChange={(e) => setNewUserFatherName(e.target.value)}
                        required
                        minLength={2}
                        maxLength={50}
                        pattern="^[a-zA-Z\s\.]+$"
                        title="Name can only contain letters, spaces, and periods"
                      />
                    </div>
                    <div>
                      <label>Mother's Name *</label>
                      <input
                        type="text"
                        placeholder="Mother's full name"
                        value={newUserMotherName}
                        onChange={(e) => setNewUserMotherName(e.target.value)}
                        required
                        minLength={2}
                        maxLength={50}
                        pattern="^[a-zA-Z\s\.]+$"
                        title="Name can only contain letters, spaces, and periods"
                      />
                    </div>
                    <div>
                      <label>Date of Birth *</label>
                      <input
                        type="date"
                        value={newUserDob}
                        onChange={(e) => setNewUserDob(e.target.value)}
                        required
                        max={new Date().toISOString().split('T')[0]}
                        min="1990-01-01"
                        title="Date of birth must be between 1990 and today"
                      />
                    </div>
                    <div>
                      <label>Date of Admission *</label>
                      <input
                        type="date"
                        value={newUserAdmissionDate}
                        onChange={(e) => setNewUserAdmissionDate(e.target.value)}
                        required
                        max={new Date().toISOString().split('T')[0]}
                        min="2000-01-01"
                        title="Date of admission must be between 2000 and today"
                      />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label>Category *</label>
                      <select
                        value={newUserCategory}
                        onChange={(e) => setNewUserCategory(e.target.value)}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="General">General</option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                        <option value="OBC">OBC (Other Backward Class)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {newUserRole === "faculty" && (
                <div>
                  <label>Mobile (Optional)</label>
                  <input
                    type="tel"
                    placeholder="Mobile number (10 digits)"
                    value={newUserMobile}
                    onChange={(e) => setNewUserMobile(e.target.value)}
                    pattern="^[6-9]\d{9}$"
                    title="Mobile number must start with 6-9 and be 10 digits"
                    maxLength={10}
                  />
                </div>
              )}
            </div>

            {createError && <p className={styles.errorMsg}>{createError}</p>}
            {createSuccess && <p className={styles.successMsg}>{createSuccess}</p>}

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>

              <button className={styles.submitBtn} onClick={handleCreateUser} disabled={createLoading}>
                {createLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ width: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className={styles.modalHeader}>
              <h3>Edit User: {editingUser.name}</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              <label>Full Name</label>
              <input value={editFormData.name || ""} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />

              <label>Email</label>
              <input value={editFormData.email || ""} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} />

              <label>Mobile</label>
              <input
                value={editFormData.mobile || ""}
                onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                placeholder="Mobile Number"
              />

              {editingUser.role === "student" && (
                <>
                  <label>Registration Number</label>
                  <input value={editFormData.regNo || ""} onChange={(e) => setEditFormData({ ...editFormData, regNo: e.target.value })} />

                  <hr style={{ margin: "10px 0", border: "0", borderTop: "1px solid #eee" }} />
                  <strong style={{ fontSize: "14px", color: "#555" }}>Academic Details</strong>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label>Course</label>
                      <input placeholder="e.g. B.Tech" value={editFormData.course || ""} onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })} />
                    </div>
                    <div>
                      <label>Branch</label>
                      <input placeholder="e.g. CSE" value={editFormData.branch || ""} onChange={(e) => setEditFormData({ ...editFormData, branch: e.target.value })} />
                    </div>
                    <div>
                      <label>Semester</label>
                      <input type="number" placeholder="e.g. 1-8" value={editFormData.semester || ""} onChange={(e) => setEditFormData({ ...editFormData, semester: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label>Session (Start-End)</label>
                      <input placeholder="e.g. 2021-2025" value={editFormData.session || ""} onChange={(e) => setEditFormData({ ...editFormData, session: e.target.value })} />
                    </div>
                    <div>
                      <label>Year</label>
                      <input type="number" placeholder="e.g. 1-4" value={editFormData.year || ""} onChange={(e) => setEditFormData({ ...editFormData, year: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label>Expected Completion</label>
                      <input placeholder="e.g. 2025" value={editFormData.expectedCompletionYear || ""} onChange={(e) => setEditFormData({ ...editFormData, expectedCompletionYear: e.target.value })} />
                    </div>
                  </div>

                  <hr style={{ margin: "10px 0", border: "0", borderTop: "1px solid #eee" }} />
                  <strong style={{ fontSize: "14px", color: "#555" }}>Personal Details</strong>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label>Father's Name</label>
                      <input placeholder="Father's full name" value={editFormData.fatherName || ""} onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })} />
                    </div>
                    <div>
                      <label>Mother's Name</label>
                      <input placeholder="Mother's full name" value={editFormData.motherName || ""} onChange={(e) => setEditFormData({ ...editFormData, motherName: e.target.value })} />
                    </div>
                    <div>
                      <label>Date of Birth</label>
                      <input type="date" value={editFormData.dob || ""} onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })} />
                    </div>
                    <div>
                      <label>Date of Admission</label>
                      <input type="date" value={editFormData.admissionDate || ""} onChange={(e) => setEditFormData({ ...editFormData, admissionDate: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label>Category</label>
                      <select
                        value={editFormData.category || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      >
                        <option value="">Select Category</option>
                        <option value="General">General</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="OBC">OBC</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {editError && (
              <p className={styles.errorMsg} style={{ marginTop: "10px" }}>
                {editError}
              </p>
            )}
            {editSuccess && (
              <p className={styles.successMsg} style={{ marginTop: "10px" }}>
                {editSuccess}
              </p>
            )}

            <div className={styles.modalActions} style={{ marginTop: "20px" }}>
              <button className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className={styles.submitBtn} onClick={handleUpdateUser} disabled={editLoading}>
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
            <input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />

            <label>New Password *</label>
            <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

            <label>Confirm New Password *</label>
            <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            {passwordError && <p className={styles.errorMsg}>{passwordError}</p>}
            {passwordSuccess && <p className={styles.successMsg}>{passwordSuccess}</p>}

            <button className={styles.submitBtn} onClick={handleChangePassword} disabled={passwordLoading}>
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCSVModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ width: "800px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className={styles.modalHeader}>
              <h3>Import Students from CSV</h3>
              <button
                onClick={() => {
                  setShowCSVModal(false);
                  setCsvPreview([]);
                  setCsvHeaders([]);
                  setCsvFileName("");
                  setCsvError("");
                }}
              >
                <X />
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  handleCSVFileChange(f);
                }}
              />
              {csvFileName && <div style={{ fontSize: "13px" }}>{csvFileName} ({csvRowCount} rows parsed)</div>}
              <div style={{ marginLeft: "auto", fontSize: "13px", color: "#666" }}>
                Preview shows up to 50 rows.
              </div>
            </div>

            {csvError && <p className={styles.errorMsg}>{csvError}</p>}

            {csvHeaders.length > 0 && (
              <>
                <strong>Detected headers:</strong>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "8px 0 12px 0" }}>
                  {csvHeaders.map((h, idx) => (
                    <span key={idx} style={{ padding: "6px 10px", background: "#f3f4f6", borderRadius: 6, fontSize: 13 }}>
                      {h}
                    </span>
                  ))}
                </div>
              </>
            )}

            {csvPreview.length > 0 ? (
              <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 6 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      <th style={{ padding: "8px", borderBottom: "1px solid #eee" }}>#</th>
                      <th style={{ padding: "8px", borderBottom: "1px solid #eee" }}>Name</th>
                      <th style={{ padding: "8px", borderBottom: "1px solid #eee" }}>Email</th>
                      <th style={{ padding: "8px", borderBottom: "1px solid #eee" }}>Reg No</th>
                      <th style={{ padding: "8px", borderBottom: "1px solid #eee" }}>Course</th>
                      <th style={{ padding: "8px", borderBottom: "1px solid #eee" }}>Branch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((r, i) => (
                      <tr key={i}>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{i + 1}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{r.name || "-"}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{r.email || "-"}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{r.regNo || "-"}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{r.course || "-"}</td>
                        <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{r.branch || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "#666" }}>No preview available. Upload a CSV to preview rows.</p>
            )}

            <div className={styles.modalActions} style={{ marginTop: "12px" }}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowCSVModal(false);
                  setCsvError("");
                  setCsvPreview([]);
                  setCsvHeaders([]);
                }}
              >
                Cancel
              </button>

              <button className={styles.submitBtn} onClick={() => handleImportCSV()} disabled={csvUploading || csvPreview.length === 0}>
                {csvUploading ? "Importing..." : `Import ${csvRowCount > csvPreview.length ? `${csvPreview.length}/${csvRowCount}` : csvPreview.length} rows`}
              </button>
            </div>

            <div style={{ marginTop: 12, color: "#666", fontSize: 13 }}>
              Tip: CSV headers should contain at least <strong>name</strong> and <strong>email</strong>. Common headers recognized: name, full name, email, regno, registrationno, mobile, course, branch, semester, session, year, fathername, mothername, dob, admissiondate.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}