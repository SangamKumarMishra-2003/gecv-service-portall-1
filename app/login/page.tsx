"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import animationData from "../../public/lottie/login.json";
import animationDataStudent from "../../public/lottie/student.json";
import animationDatafaculty from "../../public/lottie/Teaching.json";
import animationDataacedemics from "../../public/lottie/acedemics.json";
import styles from "./Login.module.scss";
import LoginModal from "../../components/LoginModal";
export default function LoginPage() {
  const [activeRole, setActiveRole] = useState<
    "Student" | "Faculty" | "Academics" | "Hostel Incharge" | null
  >(null);

  return (
    <section className={styles.loginPage}>
      {/* LEFT */}
      <div className={styles.left}>
        <div className={styles.lottieWrap}>
          <Lottie animationData={animationData} loop />
        </div>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <h1>Login Portal</h1>
        <p>Select your role to continue</p>

        <motion.div
          className={styles.cards}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {/* STUDENT */}
          <motion.button
            type="button"
            className={`${styles.card} ${styles.cardStudent} ${
              activeRole === "Student" ? styles.activeCard : ""
            }`}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
            onClick={() => setActiveRole("Student")}
          >
            <Lottie animationData={animationDataStudent}/>
            <h3>Student Login</h3>
            <span>Click to continue</span>
          </motion.button>

          {/* FACULTY */}
          <motion.button
            type="button"
            className={`${styles.card} ${styles.cardFaculty} ${
              activeRole === "Faculty" ? styles.activeCard : ""
            }`}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
            onClick={() => setActiveRole("Faculty")}
          >
              <Lottie animationData={animationDatafaculty}/>
            <h3>Faculty Login</h3>
            <span>Click to continue</span>
          </motion.button>

          {/* ACADEMICS */}
          <motion.button
            type="button"
            className={`${styles.card} ${styles.cardAcademics} ${
              activeRole === "Academics" ? styles.activeCard : ""
            }`}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
            onClick={() => setActiveRole("Academics")}
          >
              <Lottie animationData={animationDataacedemics}/>
            <h3>Academics Login</h3>
            <span>Click to continue</span>
          </motion.button>
          {/* HOSTEL INCHARGE */}
          <motion.button
            type="button"
            className={`${styles.card} ${styles.cardHostelIncharge} ${
              activeRole === "Hostel Incharge" ? styles.activeCard : ""
            }`}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
            onClick={() => setActiveRole("Hostel Incharge")}
          >
            <Lottie animationData={animationDataacedemics}/>
            <h3>Hostel Incharge Login</h3>
            <span>Click to continue</span>
          </motion.button>
        </motion.div>
      </div>

      {/* MODAL */}
      {activeRole && (
        <LoginModal role={activeRole} onClose={() => setActiveRole(null)} />
      )}
    </section>
  );
}
