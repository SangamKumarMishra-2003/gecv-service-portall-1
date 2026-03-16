"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.scss";
import { 
  BarChart3, 
  Users, 
  Bed, 
  CreditCard, 
  ClipboardList,
  LogOut,
  UserCircle,
  Building2,
  UserCheck,
  Contact
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}><Bed size={22} color="#fff" /></div>
          <h2 className={styles.logo}>GECV Hostel</h2>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li className={pathname.includes("/hostel-incharge/dashboard") ? styles.active : ""}>
              <a href="/hostel-incharge/dashboard">
                <BarChart3 size={18} />
                <span>Dashboard Overview</span>
              </a>
            </li>

            <li className={pathname.includes("/hostel-incharge/applications") ? styles.active : ""}>
              <a href="/hostel-incharge/applications">
                <ClipboardList size={18} />
                <span>Applications</span>
              </a>
            </li>

            <li className={pathname.includes("/hostel-incharge/hostels") ? styles.active : ""}>
              <a href="/hostel-incharge/hostels">
                <Building2 size={18} />
                <span>Hostel Management</span>
              </a>
            </li>

            <li className={pathname.includes("/hostel-incharge/students") ? styles.active : ""}>
              <a href="/hostel-incharge/students">
                <Contact size={18} />
                <span>Student Details</span>
              </a>
            </li>

            <li className={pathname.includes("/hostel-incharge/residents") ? styles.active : ""}>
              <a href="/hostel-incharge/residents">
                <UserCheck size={18} />
                <span>Resident Directory</span>
              </a>
            </li>

            <li className={pathname.includes("/hostel-incharge/rooms") ? styles.active : ""}>
              <a href="/hostel-incharge/rooms">
                <Bed size={18} />
                <span>Room Inventory</span>
              </a>
            </li>

            <li className={pathname.includes("/hostel-incharge/fees") ? styles.active : ""}>
              <a href="/hostel-incharge/fees">
                <CreditCard size={18} />
                <span>Fee Collection</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.userProfile}>
          <UserCircle size={32} color="#475569" />
          <div className={styles.userInfo}>
            <p className={styles.userName}>Admin</p>
            <p className={styles.userRole}>Hostel Incharge</p>
          </div>
        </div>
        <button className={styles.logoutBtn}>
          <LogOut size={16} />
          <span>Logout System</span>
        </button>
      </div>
    </aside>
  );
}