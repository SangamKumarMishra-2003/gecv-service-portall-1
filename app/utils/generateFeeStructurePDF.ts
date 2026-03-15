import { jsPDF } from "jspdf";

export interface FeeStructureData {
  receiptNo: string;
  institute: string;
  studentName: string;
  fatherName: string;
  rollNo: string;
  regNo: string;
  email: string;
  course: string;
  session: string;
  year: string;
  dob: string;
  admissionDate: string;
  purpose: string;
  admissionFee: string;
  tuitionFee: string;
  registrationFee: string;
  examFee: string;
  developmentFee: string;
  otherFee: string;
}

export const generateFeeStructurePDF = async (data: FeeStructureData) => {
  const doc = new jsPDF();

  /* ================= LOAD LOGOS ================= */
  const collegeLogo = await loadImage("/logos/college-logo.png");
  const biharLogo = await loadImage("/logos/bihar-sarkar.png");

  doc.addImage(collegeLogo, "PNG", 20, 10, 25, 25);
  doc.addImage(biharLogo, "PNG", 165, 10, 25, 25);

  /* ================= HEADER ================= */
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("Department of Science & Technology, Govt of Bihar", 105, 12, { align: "center" });
  doc.text("GOVERNMENT ENGINEERING COLLEGE,VAISHALI", 105, 18, { align: "center" });
  doc.text("Shyampur, Mansurpur, Bidupur, Vaishali-844115", 105, 24, { align: "center" });
  doc.setFontSize(10);
  doc.text("Email Id: principalgecvaishali@gmail.com", 105, 30, { align: "center" });
  doc.text("Website: www.gecvaishali.ac.in", 105, 36, { align: "center" });

  doc.line(30, 45, 180, 45);

  /* ================= TITLE ================= */
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("FEE STRUCTURE", 105, 57, { align: "center" });

  const titleWidth = doc.getTextWidth("FEE STRUCTURE");
  doc.line(105 - titleWidth / 2, 59, 105 + titleWidth / 2, 59);

  /* ================= STUDENT DETAILS ================= */
  doc.setFont("times", "normal");
  doc.setFontSize(11);

  let y = 70;
  doc.text(`Student Name: ${data.studentName}`, 20, y); y += 8;
  doc.text(`Father's Name: ${data.fatherName}`, 20, y); y += 8;
  doc.text(`Roll No: ${data.rollNo}`, 20, y); y += 8;
  doc.text(`Registration No: ${data.regNo}`, 20, y); y += 8;
  doc.text(`Email: ${data.email}`, 20, y); y += 8;
  doc.text(`Course: ${data.course}`, 20, y); y += 8;
  doc.text(`Session: ${data.session}`, 20, y); y += 8;
  doc.text(`Year: ${data.year}`, 20, y); y += 8;
  doc.text(`Date of Birth: ${data.dob ? new Date(data.dob).toLocaleDateString() : "N/A"}`, 20, y); y += 8;
  doc.text(`Admission Date: ${data.admissionDate ? new Date(data.admissionDate).toLocaleDateString() : "N/A"}`, 20, y); y += 8;
  doc.text(`Purpose: ${data.purpose}`, 20, y); y += 15;

  /* ================= FEE DETAILS ================= */
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("Fee Breakdown:", 20, y); y += 10;

  doc.setFont("times", "normal");
  doc.setFontSize(11);

  const fees = [
    { label: "Admission Fee", value: data.admissionFee },
    { label: "Tuition Fee", value: data.tuitionFee },
    { label: "Registration Fee", value: data.registrationFee },
    { label: "Exam Fee", value: data.examFee },
    { label: "Development Fee", value: data.developmentFee },
    { label: "Other Fee", value: data.otherFee },
  ];

  fees.forEach((fee) => {
    if (fee.value && fee.value !== "0") {
      doc.text(`${fee.label}: ₹${fee.value}`, 30, y);
      y += 8;
    }
  });

  const total = fees.reduce((sum, fee) => sum + (parseInt(fee.value) || 0), 0);
  y += 5;
  doc.setFont("times", "bold");
  doc.text(`Total Fee: ₹${total}`, 30, y);

  /* ================= SIGNATURE ================= */
  y = 230;
  doc.setFont("times", "bold");
  doc.text("Authorized Signatory", 130, y);
  doc.text("Name :", 130, y + 8);
  doc.text("Designation :", 130, y + 16);
  doc.text("Seal & Signature", 130, y + 24);

  /* ================= SAVE ================= */
  doc.save(`Fee_Structure_${data.studentName}.pdf`);
};

/* ================= IMAGE LOADER ================= */
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