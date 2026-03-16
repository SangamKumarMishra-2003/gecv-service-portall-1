"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Sidebar.module.scss";
import { 
  BarChart3, 
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
  const router = useRouter();

  const navItems = [
    { href: "/hostel-incharge/dashboard", label: "Dashboard Overview", icon: BarChart3 },
    { href: "/hostel-incharge/applications", label: "Applications", icon: ClipboardList },
    { href: "/hostel-incharge/hostels", label: "Hostel Management", icon: Building2 },
    { href: "/hostel-incharge/students", label: "Student Details", icon: Contact },
    { href: "/hostel-incharge/residents", label: "Resident Directory", icon: UserCheck },
    { href: "/hostel-incharge/rooms", label: "Room Inventory", icon: Bed },
    { href: "/hostel-incharge/fees", label: "Fee Collection", icon: CreditCard },
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.topSection}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}><Bed size={22} color="#fff" /></div>
          <h2 className={styles.logo}>GECV Hostel</h2>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href} className={isActive ? styles.active : ""}>
                  <Link href={item.href}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
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
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout System</span>
        </button>
      </div>
    </aside>
  );
}
