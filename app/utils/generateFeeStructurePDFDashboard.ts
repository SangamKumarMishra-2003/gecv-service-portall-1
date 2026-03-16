// Helper to convert number to words (Indian system)
function numberToWords(num: number): string {
  if (num === 0) return "zero";
  const a = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const units = ["", "thousand", "lakh", "crore"];
  let word = "";
  let u = 0;
  while (num > 0) {
    let n = 0;
    if (u === 0) {
      n = num % 1000;
      num = Math.floor(num / 1000);
    } else {
      n = num % 100;
      num = Math.floor(num / 100);
    }
    if (n !== 0) {
      let str = "";
      if (n > 99) {
        str += a[Math.floor(n / 100)] + " hundred ";
        n = n % 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + " ";
        n = n % 10;
      }
      if (n > 0) {
        str += a[n] + " ";
      }
      word = str + units[u] + " " + word;
    }
    u++;
  }
  return word.trim() + " only";
}

import { label } from "framer-motion/client";
import { jsPDF } from "jspdf";

// Helper to load images
const loadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas error");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
};

// Accept all student and fee data as arguments
export const generateFeeStructurePDFDashboard = async (data: {
  name: string;
  regNo?: string;
  registrationNo?: string;
  course?: string;
  branch?: string;
  semester?: string | number;
  year?: string | number;
  session?: string;
  dob?: string;
  fatherName?: string;
  motherName?: string;
  admissionDate?: string;
  expectedCompletionYear?: string;
  paymentDate: string | Date;
  admissionFee: number;
  tuitionFee: number;
  registrationFee: number;
  examFee: number;
  developmentFee: number;
  otherCharges: number;
  transactionId?: string;
}) => {
  const student = data;

  const doc = new jsPDF();

  /* ================= LOGOS ================= */

  const collegeLogo = await loadImage("/logos/college-logo.png");
  const biharLogo = await loadImage("/logos/bihar-sarkar.png");

  doc.addImage(collegeLogo, "PNG", 20, 10, 25, 25);
  doc.addImage(biharLogo, "PNG", 165, 10, 25, 25);

  /* ================= HEADER ================= */

  doc.setFont("times", "bold");
  doc.setFontSize(12);

  doc.text(
    "Department of Science & Technology, Govt of Bihar",
    105,
    12,
    { align: "center" }
  );

  doc.text(
    "GOVERNMENT ENGINEERING COLLEGE, VAISHALI",
    105,
    18,
    { align: "center" }
  );

  doc.text(
    "Shyampur, Mansurpur, Bidupur, Vaishali-844115",
    105,
    24,
    { align: "center" }
  );

  doc.setFontSize(10);

  doc.text(
    "Email Id: principalgecvaishali@gmail.com",
    105,
    30,
    { align: "center" }
  );

  doc.text(
    "Website: www.gecvaishali.ac.in",
    105,
    36,
    { align: "center" }
  );

  doc.line(20, 45, 190, 45);

  /* ================= LETTER ================= */

  doc.setFont("times", "normal");
  doc.setFontSize(10);

  const regNo = student.regNo || student.registrationNo;

  doc.text(`Letter No: GEC/ACAD/PMS/${regNo}`, 20, 55);

  doc.text(
    `Date: ${new Date().toLocaleDateString("en-GB")}`,
    150,
    55
  );

  /* ================= TITLE ================= */

  doc.setFont("times", "bold");
  doc.setFontSize(14);

  doc.text("FEE STRUCTURE", 105, 70, { align: "center" });

  let y = 85;

  /* ================= STUDENT DETAILS ================= */

  doc.setFont("times", "normal");
  doc.setFontSize(11);

  doc.text(`Name of the Student: ${student.name}`, 20, y);
  y += 8;
  doc.text(`Father's Name: ${student.fatherName || ""}`, 20, y);
  y += 8;
  doc.text(`Roll No: ${(student.regNo || student.registrationNo || "")}`, 20, y);
  y += 8;
  doc.text(`Registration No: ${regNo || ""}`, 20, y);
  y += 8;
  doc.text(`Course: ${student.course || ""}`, 20, y);
  y += 8;
  doc.text(`Session: ${student.session || ""}`, 20, y);
  y += 12;

  /* ================= FEE DETAILS ================= */

  doc.setFont("times", "bold");
  doc.text("DETAILS OF THE FEE", 100, y, { align: "center" });

  y += 10;

  doc.setFont("times", "normal");

  const fees = [
    {label: "Date of Payment:", amount: student.paymentDate ? new Date(student.paymentDate).toLocaleDateString("en-GB") : ""},
    {label: "Mode of Payment: Online", amount: "Online"},
    { label: "Transaction Id:", amount: student.transactionId !== undefined ? String(student.transactionId) : "" },
    { label: "1. Admission Fee:", amount: student.admissionFee },
    { label: "2. Tuition Fee:", amount: student.tuitionFee },
    { label: "3. Registration Fee:", amount: student.registrationFee },
    { label: "4. Exam Fee:", amount: student.examFee },
    { label: "5. Development Fee:", amount: student.developmentFee },
    { label: "6. Other Charges:", amount: student.otherCharges },
  ];

  fees.forEach((fee, idx) => {
    doc.text(fee.label, 30, y);
    // Always show value for first three rows (date, mode, transaction id)
    if (idx <= 2) {
      doc.text(fee.amount !== undefined && fee.amount !== null ? String(fee.amount) : "", 150, y);
    } else {
      doc.text(`Rs. ${fee.amount}`, 150, y);
    }
    y += 8;
  });

  /* ================= TOTAL ================= */

  const total =
    (student.admissionFee || 0) +
    (student.tuitionFee || 0) +
    (student.registrationFee || 0) +
    (student.examFee || 0) +
    (student.developmentFee || 0) +
    (student.otherCharges || 0);

  y += 5;

  doc.setFont("times", "bold");

  doc.text(`Total Amount: Rs. ${total}`, 30, y);
  y += 8;
  doc.setFont("times", "normal");
  doc.text(`(Rupees ${numberToWords(total)})`, 30, y);

  /* ================= SIGNATURE ================= */

  y = 270;

  doc.text(
    "Signature of the competent authority",
    130,
    y
  );

  doc.text("Seal", 130, y + 10);

  /* ================= SAVE ================= */

  doc.save(`FeeStructure_${regNo}.pdf`);
};