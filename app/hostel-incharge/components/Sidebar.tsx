"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./Sidebar.module.scss";
import { Home, Users, Bed, CreditCard } from "lucide-react";

export default function Sidebar() {

  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>

      <h2 className={styles.logo}>Hostel Admin</h2>

      <ul className={styles.navList}>

        <li className={pathname === "/hostel-incharge" ? styles.active : ""}>
          <Link href="/hostel-incharge">
            <Home size={18} />
            Dashboard
          </Link>
        </li>

        <li className={pathname === "/student" ? styles.active : ""}>
          <Link href="/student">
            <Users size={18} />
            Students
          </Link>
        </li>

        <li className={pathname === "/rooms" ? styles.active : ""}>
          <Link href="/rooms">
            <Bed size={18} />
            Rooms
          </Link>
        </li>

        <li className={pathname === "/components/fees" ? styles.active : ""}>
          <Link href="/components/fees">
            <CreditCard size={18} />
            Fees
          </Link>
        </li>

      </ul>

    </aside>
  );
}