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
          <a href="#summary">
            <Home size={18} />
            Dashboard
          </a>
        </li>

        <li>
          <a href="#requests">
            <Users size={18} />
            Requests
          </a>
        </li>

        <li>
          <a href="#students">
            <Users size={18} />
            Residents
          </a>
        </li>

        <li>
          <a href="#rooms">
            <Bed size={18} />
            Rooms
          </a>
        </li>

        <li>
          <a href="#fees">
            <CreditCard size={18} />
            Fees
          </a>
        </li>

      </ul>

    </aside>
  );
}