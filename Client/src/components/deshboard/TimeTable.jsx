import React, { useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import apiClient from "../../services/apiClient";
import { toPng } from "html-to-image";
import { exportToICS } from "../../utils/calendarExport";

//* Subject color mapping for different subjects across MCA, MBA, and MTech
const SUBJECT_COLORS = {
  // MCA Subjects
  "Data Analytics & Visualization": { bg: "bg-emerald-800", text: "text-white" },
  "Ethical Hacking & security operations": { bg: "bg-emerald-800", text: "text-white" },
  "Cyber Security Analytics": { bg: "bg-emerald-800", text: "text-white" },
  "Operating System": { bg: "bg-red-900", text: "text-white" },
  "Core Java Programming": { bg: "bg-orange-600", text: "text-white" },
  "Advance Java Programming": { bg: "bg-orange-600", text: "text-white" },
  "Web Technologies": { bg: "bg-cyan-700", text: "text-white" },
  "Advanced Web Technology": { bg: "bg-cyan-700", text: "text-white" },
  "ADBMS": { bg: "bg-amber-800", text: "text-white" },
  "Advanced Database Management System": { bg: "bg-amber-800", text: "text-white" },
  "DAA": { bg: "bg-blue-900", text: "text-white" },
  "Design & Analysis of Algorithms": { bg: "bg-blue-900", text: "text-white" },
  "Cloud Computing Integrated with AI": { bg: "bg-sky-800", text: "text-white" },
  "Cloud Architecture": { bg: "bg-sky-800", text: "text-white" },
  "Data Structures using Python": { bg: "bg-teal-700", text: "text-white" },
  "Software Engineering & OOAD": { bg: "bg-purple-800", text: "text-white" },
  "Optimization Techniques": { bg: "bg-blue-800", text: "text-white" },

  // MBA Subjects
  "Financial Accounting & Costing with AI Tools": { bg: "bg-amber-700", text: "text-white" },
  "Managerial Economics in Digital Age": { bg: "bg-indigo-900", text: "text-white" },
  "Marketing in Digital Age": { bg: "bg-pink-700", text: "text-white" },
  "Business Statistics & Data Interpretation": { bg: "bg-blue-700", text: "text-white" },
  "Corporate Ethics & Responsible AI": { bg: "bg-purple-900", text: "text-white" },
  "Consumer Behaviour": { bg: "bg-rose-800", text: "text-white" },
  "Financial Services & Markets": { bg: "bg-yellow-700", text: "text-white" },
  "Introduction to Human Resource Management": { bg: "bg-violet-800", text: "text-white" },
  "Introduction to Logistics & Supply Chain Management": { bg: "bg-blue-900", text: "text-white" },
  "Data Interpretation & Social Media Lab": { bg: "bg-green-700", text: "text-white" },

  // MTech Subjects
  "Construction Techniques": { bg: "bg-amber-900", text: "text-white" },
  "Estimation, Tendering & Contracting": { bg: "bg-stone-800", text: "text-white" },
  "Project Resource Management": { bg: "bg-slate-800", text: "text-white" },
  "Real Estate Project Development": { bg: "bg-amber-800", text: "text-white" },
  "Infrastructure Project Development": { bg: "bg-blue-900", text: "text-white" },
  "Computer Lab - I (MSP & Primavera)": { bg: "bg-teal-800", text: "text-white" },
  "AutoCAD Lab": { bg: "bg-red-700", text: "text-white" },
  "Computer Lab - II (R & Python)": { bg: "bg-teal-700", text: "text-white" },
  "Field Work & Site Inspection": { bg: "bg-green-800", text: "text-white" },

  // Common / General
  "Logical Aptitude": { bg: "bg-gray-700", text: "text-white" },
  "Mentorship": { bg: "bg-gray-600", text: "text-white" },
  "Mentoring Session": { bg: "bg-gray-600", text: "text-white" },
  "Guest Lecture": { bg: "bg-cyan-600", text: "text-white" },
  "Library Session": { bg: "bg-gray-600", text: "text-white" },
  "Self Study": { bg: "bg-gray-700", text: "text-white" },
  default: { bg: "bg-gray-600", text: "text-white" },
};

//* Time slots configuration
const TIME_SLOTS = [
  { time: "8:40 am to 9:40 am", label: "1" },
  { time: "9:40 a.m. to 10:40 am", label: "2" },
  { time: "10:40 am to 10:50 am", label: "SHORT BREAK", isBreak: true },
  { time: "10:50 am to 11:50 am", label: "3" },
  { time: "11.50 am to 12.50 pm", label: "4" },
  { time: "12.50 pm to 1.20 pm", label: "LUNCH BREAK", isBreak: true },
  { time: "1:20 pm to 2:20 pm", label: "5" },
  { time: "2:20 pm to 3:20 pm", label: "6" },
  { time: "3:20 pm to 3:30 pm", label: "SHORT BREAK", isBreak: true },
  { time: "3:30 pm to 4:30 pm", label: "7" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

//* Sample timetable datasets for MCA, MBA, and MTech
//* Sample timetable datasets for MCA, MBA, and MTech across Sem 1 and Sem 3
const MCA_SEM1_SAMPLE_DATA = {
  monday: [
    { subject: "Organization Design and Emotional Intelligence", faculty: "Prof. Vinod Charawande", room: "N 709" },
    { subject: "Data Structure using Python", faculty: "Prof. Pallavi Gaikwad", room: "N 709" },
    null,
    { subject: "Business Statistics using Python", faculty: "Prof. Namrata Soni Valecha", room: "N 709" },
    { subject: "Quantum Aware- Computer Organization & Design", faculty: "Prof. Harshitkumar", room: "N 709" },
    null,
    { subject: "Lab - Business Statistics using Python", faculty: "Prof. Namrata Soni Valecha", room: "Lab C" },
    null, null,
    { subject: "Computer Networks and Management", faculty: "Prof. Vinod Charawande", room: "N 709" },
  ],
  tuesday: [
    { subject: "Business Communication in Digital Age", faculty: "Prof. Anjali Sharma", room: "N 709" },
    { subject: "Cloud Computing Integrated with AI", faculty: "Prof. Pratibha Tiwari", room: "N 709" },
    null,
    { subject: "Organization Design and Emotional Intelligence", faculty: "Prof. Vinod Charawande", room: "N 709" },
    { subject: "Data Structure using Python", faculty: "Prof. Pallavi Gaikwad", room: "N 709" },
    null,
    { subject: "Lab - Data Structure using Python", faculty: "Prof. Pallavi Gaikwad", room: "Lab B" },
    null, null,
    { subject: "Business Statistics using Python", faculty: "Prof. Namrata Soni Valecha", room: "N 709" },
  ],
  wednesday: [
    { subject: "Quantum Aware- Computer Organization & Design", faculty: "Prof. Harshitkumar", room: "N 709" },
    { subject: "Computer Networks and Management", faculty: "Prof. Vinod Charawande", room: "N 709" },
    null,
    { subject: "Introduction to Data Science & AI", faculty: "Prof. Dr. Satyakam Rahul", room: "N 709" },
    { subject: "Business Communication in Digital Age", faculty: "Prof. Anjali Sharma", room: "N 709" },
    null,
    { subject: "Introduction to Cyber Security & Defense", faculty: "Prof. Pratibha Upadhye", room: "N 709" },
    { subject: "Mentoring Session", faculty: "Prof. Vinod Charawande", room: "N 709" },
    null,
    { subject: "Self Study", faculty: "", room: "N 709" },
  ],
  thursday: [
    { subject: "Lab - Business Statistics using Python", faculty: "Prof. Namrata Soni Valecha", room: "Lab C" },
    null, null,
    { subject: "Data Structure using Python", faculty: "Prof. Pallavi Gaikwad", room: "N 709" },
    { subject: "Organization Design and Emotional Intelligence", faculty: "Prof. Vinod Charawande", room: "N 709" },
    null,
    { subject: "Business Statistics using Python", faculty: "Prof. Namrata Soni Valecha", room: "N 709" },
    { subject: "Quantum Aware- Computer Organization & Design", faculty: "Prof. Harshitkumar", room: "N 709" },
    null,
    { subject: "Library Session", faculty: "Librarian", room: "Library" },
  ],
  friday: [
    { subject: "Computer Networks and Management", faculty: "Prof. Vinod Charawande", room: "N 709" },
    { subject: "Business Communication in Digital Age", faculty: "Prof. Anjali Sharma", room: "N 709" },
    null,
    { subject: "Lab - Data Structure using Python", faculty: "Prof. Pallavi Gaikwad", room: "Lab B" },
    null, null,
    { subject: "Cloud Computing Integrated with AI", faculty: "Prof. Pratibha Tiwari", room: "N 709" },
    { subject: "Introduction to Data Science & AI", faculty: "Prof. Dr. Satyakam Rahul", room: "N 709" },
    null,
    { subject: "Mentorship", faculty: "Prof. Vinod Charawande", room: "N 709" },
  ],
  saturday: [
    null, null, null,
    { subject: "Guest Lecture / Workshop", faculty: "Guest Speaker", room: "Auditorium" },
    { subject: "Guest Lecture / Workshop", faculty: "Guest Speaker", room: "Auditorium" },
    null, null, null, null, null
  ]
};

const MCA_SEM3_SAMPLE_DATA = {
  monday: [
    { subject: "Software Engineering & Object Oriented Analysis Design", faculty: "Prof. Hanifkhan Pathan", room: "N 709" },
    { subject: "Advance Java Programming", faculty: "Dr. Alkawati Magadum", room: "N 709" },
    null,
    { subject: "Optimization Techniques", faculty: "Prof. Jagruti Kambari", room: "N 709" },
    { subject: "Advanced Web Technology", faculty: "Prof. Dharmendra Singh", room: "N 709" },
    null,
    { subject: "Lab - Advance Java Programming", faculty: "Dr. Alkawati Magadum", room: "Lab C" },
    null, null,
    { subject: "Research Methodology & Research Tools", faculty: "Dr. Pradnya Muley", room: "N 709" },
  ],
  tuesday: [
    { subject: "Cloud Architecture", faculty: "Prof. Hanifkhan Pathan", room: "N 709" },
    { subject: "Cloud Economics, Security with Data Visualization", faculty: "Prof. Dr. Satyakam Rahul", room: "N 709" },
    null,
    { subject: "Software Engineering & Object Oriented Analysis Design", faculty: "Prof. Hanifkhan Pathan", room: "N 709" },
    { subject: "Advance Java Programming", faculty: "Dr. Alkawati Magadum", room: "N 709" },
    null,
    { subject: "Lab - Advanced Web Technology & OOAD Lab", faculty: "Prof. Dharmendra Singh", room: "Lab B" },
    null, null,
    { subject: "Optimization Techniques", faculty: "Prof. Jagruti Kambari", room: "N 709" },
  ],
  wednesday: [
    { subject: "Advanced Web Technology", faculty: "Prof. Dharmendra Singh", room: "N 709" },
    { subject: "Research Methodology & Research Tools", faculty: "Dr. Pradnya Muley", room: "N 709" },
    null,
    { subject: "Data Analytics Application using AI & ML", faculty: "Prof. Deepak V Ulape", room: "N 709" },
    { subject: "Data Handling & Preprocessing", faculty: "Prof. Pratibha Tiwari", room: "N 709" },
    null,
    { subject: "Summer Internship Program", faculty: "Prof. Deepak V Ulape", room: "N 709" },
    { subject: "Cyber Security Analytics", faculty: "Prof. Pallavi Gaikwad", room: "N 709" },
    null,
    { subject: "Mentorship", faculty: "Prof. Dr. Satyakam Rahul", room: "N 709" },
  ],
  thursday: [
    { subject: "Lab - Cloud Architecture / Data Analytics Lab", faculty: "Prof. Hanifkhan Pathan", room: "Lab C" },
    null, null,
    { subject: "Advance Java Programming", faculty: "Dr. Alkawati Magadum", room: "N 709" },
    { subject: "Software Engineering & Object Oriented Analysis Design", faculty: "Prof. Hanifkhan Pathan", room: "N 709" },
    null,
    { subject: "Optimization Techniques", faculty: "Prof. Jagruti Kambari", room: "N 709" },
    { subject: "Advanced Web Technology", faculty: "Prof. Dharmendra Singh", room: "N 709" },
    null,
    { subject: "Library Session", faculty: "Librarian", room: "Library" },
  ],
  friday: [
    { subject: "Research Methodology & Research Tools", faculty: "Dr. Pradnya Muley", room: "N 709" },
    { subject: "Cloud Architecture", faculty: "Prof. Hanifkhan Pathan", room: "N 709" },
    null,
    { subject: "Data Mining and Data Warehousing", faculty: "Prof. Rahul Sharma", room: "N 709" },
    null, null,
    { subject: "Cyber Threat Analytics", faculty: "Prof. Harshit Kumar", room: "N 709" },
    { subject: "Summer Internship Program", faculty: "Prof. Deepak V Ulape", room: "N 709" },
    null,
    { subject: "Self Study", faculty: "", room: "N 709" },
  ],
  saturday: [
    null, null, null,
    { subject: "Guest Lecture / Tech Seminar", faculty: "Guest Speaker", room: "Auditorium" },
    { subject: "Guest Lecture / Tech Seminar", faculty: "Guest Speaker", room: "Auditorium" },
    null, null, null, null, null
  ]
};

const MBA_SAMPLE_DATA = {
  monday: [
    { subject: "Financial Accounting & Costing with AI Tools", faculty: "Dr. Laveena Bhatia", room: "M 101" },
    { subject: "Managerial Economics in Digital Age", faculty: "Prof. Anand Bhaskar", room: "M 101" },
    null,
    { subject: "Marketing in Digital Age", faculty: "Prof. Hanifkhan Pathan", room: "M 101" },
    { subject: "Business Statistics & Data Interpretation", faculty: "Dr. Chandresh Chakraborty", room: "M 101" },
    null,
    { subject: "Corporate Ethics & Responsible AI", faculty: "Prof. Snehal Belkhode", room: "M 101" },
    null, null,
    { subject: "Introduction to Human Resource Management", faculty: "Prof. Swati Sayankar", room: "M 101" },
  ],
  tuesday: [
    { subject: "Consumer Behaviour", faculty: "Prof. Snehal Patil", room: "M 101" },
    { subject: "Financial Services & Markets", faculty: "Dr. Laveena Bhatia", room: "M 101" },
    null,
    { subject: "Introduction to Logistics & Supply Chain Management", faculty: "Prof. Dharmendra", room: "M 101" },
    { subject: "Financial Accounting & Costing with AI Tools", faculty: "Dr. Laveena Bhatia", room: "M 101" },
    null,
    { subject: "Managerial Economics in Digital Age", faculty: "Prof. Anand Bhaskar", room: "M 101" },
    null, null,
    { subject: "Marketing in Digital Age", faculty: "Prof. Hanifkhan Pathan", room: "M 101" },
  ],
  wednesday: [
    { subject: "Business Statistics & Data Interpretation", faculty: "Dr. Chandresh Chakraborty", room: "M 101" },
    { subject: "Corporate Ethics & Responsible AI", faculty: "Prof. Snehal Belkhode", room: "M 101" },
    null,
    { subject: "Lab - Data Interpretation & Social Media Lab", faculty: "Prof. Dharmendra", room: "Computer Center 1" },
    { subject: "Lab - Data Interpretation & Social Media Lab", faculty: "Prof. Dharmendra", room: "Computer Center 1" },
    null,
    { subject: "Introduction to Human Resource Management", faculty: "Prof. Swati Sayankar", room: "M 101" },
    { subject: "Consumer Behaviour", faculty: "Prof. Snehal Patil", room: "M 101" },
    null,
    { subject: "Financial Services & Markets", faculty: "Dr. Laveena Bhatia", room: "M 101" },
  ],
  thursday: [
    { subject: "Managerial Economics in Digital Age", faculty: "Prof. Anand Bhaskar", room: "M 101" },
    { subject: "Financial Services & Markets", faculty: "Dr. Laveena Bhatia", room: "M 101" },
    null,
    { subject: "Marketing in Digital Age", faculty: "Prof. Hanifkhan Pathan", room: "M 101" },
    { subject: "Introduction to Logistics & Supply Chain Management", faculty: "Prof. Dharmendra", room: "M 101" },
    null,
    { subject: "Business Statistics & Data Interpretation", faculty: "Dr. Chandresh Chakraborty", room: "M 101" },
    { subject: "Financial Accounting & Costing with AI Tools", faculty: "Dr. Laveena Bhatia", room: "M 101" },
    null,
    { subject: "Corporate Ethics & Responsible AI", faculty: "Prof. Snehal Belkhode", room: "M 101" },
  ],
  friday: [
    { subject: "Corporate Ethics & Responsible AI", faculty: "Prof. Snehal Belkhode", room: "M 101" },
    { subject: "Consumer Behaviour", faculty: "Prof. Snehal Patil", room: "M 101" },
    null,
    { subject: "Introduction to Human Resource Management", faculty: "Prof. Swati Sayankar", room: "M 101" },
    { subject: "Introduction to Logistics & Supply Chain Management", faculty: "Prof. Dharmendra", room: "M 101" },
    null,
    { subject: "Managerial Economics in Digital Age", faculty: "Prof. Anand Bhaskar", room: "M 101" },
    { subject: "Financial Accounting & Costing with AI Tools", faculty: "Dr. Laveena Bhatia", room: "M 101" },
    null,
    { subject: "Mentorship", faculty: "Class Teacher", room: "M 101" },
  ],
  saturday: [
    null, null, null,
    { subject: "Guest Lecture / Industry Seminar", faculty: "Corporate Guest", room: "Seminar Hall" },
    { subject: "Guest Lecture / Industry Seminar", faculty: "Corporate Guest", room: "Seminar Hall" },
    null, null, null, null, null
  ]
};

const MTECH_SAMPLE_DATA = {
  monday: [
    { subject: "Construction Techniques", faculty: "Dr. Rahul Satyakam", room: "T 302" },
    { subject: "Estimation, Tendering & Contracting", faculty: "Prof. Vinod Charawande", room: "T 302" },
    null,
    { subject: "Project Resource Management", faculty: "Dr. Netra Patil", room: "T 302" },
    { subject: "Infrastructure Project Development", faculty: "Prof. Harshit Kumar", room: "T 302" },
    null,
    { subject: "Computer Lab - I (MSP & Primavera)", faculty: "Prof. Dharmendra", room: "CAD Lab" },
    null, null,
    { subject: "Computer Lab - I (MSP & Primavera)", faculty: "Prof. Dharmendra", room: "CAD Lab" },
  ],
  tuesday: [
    { subject: "Real Estate Project Development", faculty: "Prof. Anand Bhaskar", room: "T 302" },
    { subject: "Construction Techniques", faculty: "Dr. Rahul Satyakam", room: "T 302" },
    null,
    { subject: "Estimation, Tendering & Contracting", faculty: "Prof. Vinod Charawande", room: "T 302" },
    { subject: "AutoCAD Lab", faculty: "Prof. Harshit Kumar", room: "CAD Lab" },
    null,
    { subject: "AutoCAD Lab", faculty: "Prof. Harshit Kumar", room: "CAD Lab" },
    null, null,
    { subject: "Project Resource Management", faculty: "Dr. Netra Patil", room: "T 302" },
  ],
  wednesday: [
    { subject: "Infrastructure Project Development", faculty: "Prof. Harshit Kumar", room: "T 302" },
    { subject: "Real Estate Project Development", faculty: "Prof. Anand Bhaskar", room: "T 302" },
    null,
    { subject: "Construction Techniques", faculty: "Dr. Rahul Satyakam", room: "T 302" },
    { subject: "Estimation, Tendering & Contracting", faculty: "Prof. Vinod Charawande", room: "T 302" },
    null,
    { subject: "Field Work & Site Inspection", faculty: "Site Supervisor", room: "Construction Site" },
    { subject: "Field Work & Site Inspection", faculty: "Site Supervisor", room: "Construction Site" },
    null,
    { subject: "Project Resource Management", faculty: "Dr. Netra Patil", room: "T 302" },
  ],
  thursday: [
    { subject: "Project Resource Management", faculty: "Dr. Netra Patil", room: "T 302" },
    { subject: "Computer Lab - II (R & Python)", faculty: "Dr. Pradnya Mulye", room: "Computing Center" },
    null,
    { subject: "Computer Lab - II (R & Python)", faculty: "Dr. Pradnya Mulye", room: "Computing Center" },
    { subject: "Infrastructure Project Development", faculty: "Prof. Harshit Kumar", room: "T 302" },
    null,
    { subject: "Real Estate Project Development", faculty: "Prof. Anand Bhaskar", room: "T 302" },
    { subject: "Construction Techniques", faculty: "Dr. Rahul Satyakam", room: "T 302" },
    null,
    { subject: "Estimation, Tendering & Contracting", faculty: "Prof. Vinod Charawande", room: "T 302" },
  ],
  friday: [
    { subject: "Estimation, Tendering & Contracting", faculty: "Prof. Vinod Charawande", room: "T 302" },
    { subject: "Infrastructure Project Development", faculty: "Prof. Harshit Kumar", room: "T 302" },
    null,
    { subject: "Real Estate Project Development", faculty: "Prof. Anand Bhaskar", room: "T 302" },
    { subject: "Construction Techniques", faculty: "Dr. Rahul Satyakam", room: "T 302" },
    null,
    { subject: "Computer Lab - I (MSP & Primavera)", faculty: "Prof. Dharmendra", room: "CAD Lab" },
    { subject: "Computer Lab - I (MSP & Primavera)", faculty: "Prof. Dharmendra", room: "CAD Lab" },
    null,
    { subject: "Mentorship / Site Seminar", faculty: "Faculty Advisor", room: "T 302" },
  ],
  saturday: [
    null, null, null,
    { subject: "Technical Seminar / Workshop", faculty: "Industry Expert", room: "Seminar Room 2" },
    { subject: "Technical Seminar / Workshop", faculty: "Industry Expert", room: "Seminar Room 2" },
    null, null, null, null, null
  ]
};

const SAMPLE_TIMETABLE_BY_CLASS = {
  MCA_S001: MCA_SEM1_SAMPLE_DATA,
  MCA_S003: MCA_SEM3_SAMPLE_DATA,
  MBA_S001: MBA_SAMPLE_DATA,
  MBA_S003: MBA_SAMPLE_DATA,
  MTech_S001: MTECH_SAMPLE_DATA,
  MTech_S003: MTECH_SAMPLE_DATA,
};

const getSampleTimetable = (targetClass = "MCA", semId = "S001") => {
  const key = `${targetClass}_${semId}`;
  return SAMPLE_TIMETABLE_BY_CLASS[key] || SAMPLE_TIMETABLE_BY_CLASS[`${targetClass}_S001`] || MCA_SEM1_SAMPLE_DATA;
};

const MCA_SAMPLE_DATA = MCA_SEM1_SAMPLE_DATA;

const isCourseForClass = (courseId, courseName = "", targetClass = "MCA") => {
  if (!courseId) return true;
  const idStr = String(courseId).toUpperCase();
  const nameStr = String(courseName || "").toUpperCase();

  if (targetClass === "MCA") {
    if (idStr.includes("MCA") || idStr.startsWith("26MCA") || idStr.startsWith("25MCA") || idStr.startsWith("26MCC") || idStr.startsWith("25MCC") || idStr.startsWith("26MCD") || idStr.startsWith("25MCD")) return true;
    if (nameStr.includes("JAVA") || nameStr.includes("PYTHON") || nameStr.includes("DATA STRUCTURE") || nameStr.includes("WEB TECH") || nameStr.includes("QUANTUM") || nameStr.includes("CYBER") || nameStr.includes("OPTIMIZATION") || nameStr.includes("OOAD") || nameStr.includes("CLOUD") || nameStr.includes("SOFTWARE ENGINEERING") || nameStr.includes("COMPUTER") || nameStr.includes("STATISTICS") || nameStr.includes("ORGANIZATION DESIGN")) return true;
    if (/^C1[0-9]{2}/.test(idStr) || /^C2[0-9]{2}/.test(idStr)) return true;
    return false;
  }
  if (targetClass === "MBA") {
    if (idStr.includes("MBA") || idStr.startsWith("26MBA") || idStr.startsWith("25MBA")) return true;
    if (/^C0[0-9]{2}/.test(idStr) || /^C1[0-4][0-9]/.test(idStr)) return true;
    if (nameStr.includes("MANAGEMENT") || nameStr.includes("MARKETING") || nameStr.includes("FINANCE") || nameStr.includes("ECONOMICS") || nameStr.includes("BUSINESS") || nameStr.includes("ACCOUNTING") || nameStr.includes("ORGANIZATIONAL") || nameStr.includes("CONSUMER") || nameStr.includes("LOGISTICS") || nameStr.includes("HR") || nameStr.includes("AGRI") || nameStr.includes("PROJECT")) return true;
    return false;
  }
  if (targetClass === "MTech") {
    if (idStr.includes("MTECH") || idStr.startsWith("26MTECH") || idStr.startsWith("25MTECH")) return true;
    if (/^C2[0-9]{2}/.test(idStr)) return true;
    if (nameStr.includes("ENGINEERING") || nameStr.includes("ADVANCED") || nameStr.includes("MTECH") || nameStr.includes("VLSI") || nameStr.includes("SIGNAL") || nameStr.includes("AUTOCAD") || nameStr.includes("PRIMAVERA")) return true;
    return false;
  }
  return true;
};

//! Get color for a subject
const getSubjectColor = (subject) => {
  if (!subject) return { bg: "bg-transparent", text: "text-transparent" };
  
  for (const [key, color] of Object.entries(SUBJECT_COLORS)) {
    if (subject.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  
  // Consistent color generation using hash of subject name
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Choose beautiful, professional dark-toned HSL values
  const h = Math.abs(hash) % 360;
  return {
    bg: `hsl(${h}, 55%, 35%)`,
    text: "text-white",
    isCustomHSL: true
  };
};

// Timetable Header Component
const TimetableHeader = ({ collegeInfo }) => (
  <div className="bg-black text-white p-4">
    <div className="text-center space-y-1">
      <h1 className="text-xl font-bold tracking-wide">{collegeInfo.name}</h1>
      <div className="flex justify-center items-center gap-8 text-sm">
        <span className="font-semibold">{collegeInfo.batch}</span>
        <span className="font-semibold">{collegeInfo.semester}</span>
        <span>Effective From {collegeInfo.effectiveDate}</span>
      </div>
      <div className="flex justify-center items-center gap-8 text-sm pt-1">
        <span className="font-semibold">{collegeInfo.classInfo}</span>
        <span>Class Teacher - {collegeInfo.classTeacher}</span>
        <span>Class Room No - {collegeInfo.roomNo}</span>
      </div>
    </div>
  </div>
);

// Action Buttons Component
const ActionButtons = ({
  onPrint,
  onExport,
  onExportCalendar,
  onRefresh,
  onGenerate,
  viewMode,
  setViewMode,
  isRefreshing,
  isExporting,
  isAdmin,
  selectedClass,
  setSelectedClass,
  selectedSemester,
  setSelectedSemester,
  selectedDivision,
  setSelectedDivision,
  role,
  facultyViewMode,
  setFacultyViewMode,
  facultyTaughtDivisions = []
}) => (
  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface border-b border-border">
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 bg-background border border-border rounded-md p-1">
        <button
          onClick={() => setViewMode("week")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            viewMode === "week"
              ? "bg-primary text-white"
              : "text-text/70 hover:text-text hover:bg-surface-hover"
          }`}
        >
          Week View
        </button>
        <button
          onClick={() => setViewMode("day")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            viewMode === "day"
              ? "bg-primary text-white"
              : "text-text/70 hover:text-text hover:bg-surface-hover"
          }`}
        >
          Day View
        </button>
      </div>

      {role === "faculty" && (
        <div className="flex items-center gap-1 bg-background border border-border rounded-md p-1">
          <button
            onClick={() => setFacultyViewMode("my_schedule")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              facultyViewMode === "my_schedule"
                ? "bg-purple-600 text-white shadow-xs font-bold"
                : "text-text/70 hover:text-text hover:bg-surface-hover"
            }`}
          >
            👤 My Personal Schedule
          </button>
          <button
            onClick={() => setFacultyViewMode("class_timetable")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              facultyViewMode === "class_timetable"
                ? "bg-purple-600 text-white shadow-xs font-bold"
                : "text-text/70 hover:text-text hover:bg-surface-hover"
            }`}
          >
            🏫 Class Timetables
          </button>
        </div>
      )}

      {role !== "student" && (role !== "faculty" || facultyViewMode === "class_timetable") && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text/80">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => {
                const newClass = e.target.value;
                setSelectedClass(newClass);
                const targetSem = newClass === "TY BBA" ? "S005" : (selectedSemester === "S005" ? "S001" : selectedSemester);
                if (newClass === "TY BBA") setSelectedSemester("S005");
                else if (selectedSemester === "S005") setSelectedSemester("S001");

                const divs = getAvailableDivisions(newClass, targetSem);
                if (divs && divs.length > 0 && !divs.some(d => d.id === selectedDivision)) {
                  setSelectedDivision(divs[0].id);
                }
              }}
              className="px-3 py-1.5 border border-border bg-background rounded-md text-text text-xs font-medium focus:outline-none focus:border-primary font-bold"
            >
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
              <option value="MTech">MTech</option>
              <option value="TY BBA">TY BBA</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text/80">Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => {
                const newSem = e.target.value;
                setSelectedSemester(newSem);
                const divs = getAvailableDivisions(selectedClass, newSem);
                if (divs && divs.length > 0 && !divs.some(d => d.id === selectedDivision)) {
                  setSelectedDivision(divs[0].id);
                }
              }}
              className="px-3 py-1.5 border border-border bg-background rounded-md text-text text-xs font-medium focus:outline-none focus:border-primary"
            >
              <option value="S001">Sem I (Active)</option>
              <option value="S002">Sem II (Not Available)</option>
              <option value="S003">Sem III (Active)</option>
              <option value="S004">Sem IV (Not Available)</option>
              {selectedClass === "TY BBA" && <option value="S005">Sem V (Active)</option>}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text/80">Division:</span>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="px-3 py-1.5 border border-border bg-background rounded-md text-text text-xs font-medium focus:outline-none focus:border-primary"
            >
              {getAvailableDivisions(selectedClass, selectedSemester).map((div) => {
                const isTaught = facultyTaughtDivisions.includes(div.id);
                return (
                  <option key={div.id} value={div.id}>
                    {div.name} {isTaught ? " (Teaches)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </>
      )}
    </div>
    
    <div className="flex items-center gap-2">
      {isAdmin && (
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Generate Timetable
        </button>
      )}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-surface-hover border border-border text-text hover:bg-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRefreshing ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>
      <button
        onClick={onExportCalendar}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-amber-600 hover:bg-amber-700 text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Calendar
      </button>
      <button
        onClick={onExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        {isExporting ? "Exporting..." : "Export PNG"}
      </button>
      <button
        onClick={onPrint}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print
      </button>
    </div>
  </div>
);

//! Check if a subject is a lab session
const isLabSession = (subject) => {
  if (!subject) return false;
  const labKeywords = ['lab', 'practical', 'workshop', 'session'];
  return labKeywords.some(keyword => subject.toLowerCase().includes(keyword));
};

//* Process timetable data to handle lab sessions spanning 2 consecutive periods
//* Process timetable data to handle lab sessions spanning 2 consecutive periods
const processTimetableData = (timetableData, timeSlots) => {
  const processed = {};
  
  DAYS.forEach(day => {
    const dayKey = day.toLowerCase();
    const dayData = timetableData[dayKey] || [];
    processed[dayKey] = [];
    
    const skipIndices = new Set();
    
    dayData.forEach((cell, index) => {
      if (skipIndices.has(index)) {
        processed[dayKey].push({ isContinued: true, parentIndex: index - 1 });
        return;
      }
      
      //! Check if current slot is a break
      if (timeSlots[index]?.isBreak) {
        processed[dayKey].push(cell);
        return;
      }
      
      //! Check if this is a lab session
      if (cell && isLabSession(cell.subject)) {
        // Look ahead for the second slot of this lab
        let nextClassIdx = index + 1;
        while (nextClassIdx < dayData.length && timeSlots[nextClassIdx]?.isBreak) {
          nextClassIdx++;
        }
        
        const nextCell = dayData[nextClassIdx];
        if (nextCell && nextCell.subject === cell.subject) {
          // Mark all intermediate break slots and the next class slot as continued
          for (let i = index + 1; i <= nextClassIdx; i++) {
            skipIndices.add(i);
          }
          const rowSpan = nextClassIdx - index + 1;
          processed[dayKey].push({ ...cell, isLab: true, spansTwoPeriods: true, customRowSpan: rowSpan });
        } else {
          processed[dayKey].push(cell);
        }
      } else {
        processed[dayKey].push(cell);
      }
    });
  });
  
  return processed;
};

// Week View Component
const WeekView = ({ timetableData, timeSlots }) => {
  const processedData = processTimetableData(timetableData, timeSlots);
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-border bg-surface-hover p-2 text-sm font-semibold text-text w-32">
              Timing
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="border border-border bg-surface-hover p-2 text-sm font-semibold text-text min-w-[150px]"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot, slotIndex) => (
            <tr key={slotIndex}>
              <td className="border border-border bg-surface-hover p-2 text-xs text-text text-center">
                <div className="font-semibold">{slot.label}</div>
                {!slot.isBreak && <div className="text-text/60 mt-1">{slot.time}</div>}
              </td>
              {slot.isBreak ? (
                DAYS.map((day) => {
                  const dayKey = day.toLowerCase();
                  const cellData = processedData[dayKey]?.[slotIndex];
                  
                  if (cellData?.isContinued) {
                    return null;
                  }
                  
                  return (
                    <td
                      key={`${day}-${slotIndex}`}
                      className="border border-border bg-yellow-100 dark:bg-yellow-900/30 p-2 text-center text-xs font-bold text-yellow-800 dark:text-yellow-200"
                    >
                      {slot.label}
                    </td>
                  );
                })
              ) : (
                DAYS.map((day) => {
                  const dayKey = day.toLowerCase();
                  const cellData = processedData[dayKey]?.[slotIndex];
                  
                  //* Skip rendering if this is a continued lab cell (merged above)
                  if (cellData?.isContinued) {
                    return null;
                  }
                  
                  const color = getSubjectColor(cellData?.subject);
                  const rowSpan = cellData?.customRowSpan || 1;
                  
                  return (
                    <td
                      key={`${day}-${slotIndex}`}
                      rowSpan={rowSpan}
                      className={`border border-border p-1 text-xs ${
                        cellData ? (color.isCustomHSL ? "" : color.bg) : "bg-transparent"
                      } ${cellData ? color.text : "text-text"} ${
                        cellData?.spansTwoPeriods ? "align-middle" : ""
                      }`}
                      style={{ 
                        minHeight: cellData?.spansTwoPeriods ? '120px' : '60px',
                        backgroundColor: cellData && color.isCustomHSL ? color.bg : undefined
                      }}
                    >
                      {cellData && !cellData.isContinued && (
                        <div className="p-1">
                          <div className="font-semibold leading-tight">
                            {cellData.subject}
                            {cellData.isLab && (
                              <span className="ml-1 text-[10px] bg-white/20 px-1 rounded">LAB</span>
                            )}
                          </div>
                          {cellData.faculty && (
                            <div className="text-[10px] mt-1 opacity-90">{cellData.faculty}</div>
                          )}
                          {cellData.room && (
                            <div className="text-[10px] opacity-75">{cellData.room}</div>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Day View Component
const DayView = ({ timetableData, timeSlots, selectedDay, setSelectedDay }) => {
  const processedData = processTimetableData(timetableData, timeSlots);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day.toLowerCase())}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              selectedDay === day.toLowerCase()
                ? "bg-primary text-white"
                : "bg-surface-hover border border-border text-text hover:bg-border"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
      
      <div className="space-y-2">
        {timeSlots.map((slot, slotIndex) => {
          if (slot.isBreak) {
            return (
              <div
                key={slotIndex}
                className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-md text-center text-sm font-bold text-yellow-800 dark:text-yellow-200"
              >
                {slot.label} ({slot.time})
              </div>
            );
          }
          
          const cellData = processedData[selectedDay]?.[slotIndex];
          
          //* Skip rendering if this is a continued lab cell
          if (cellData?.isContinued) {
            return null;
          }
          
          const color = getSubjectColor(cellData?.subject);
          const isLab = cellData?.isLab;
          const nextSlot = timeSlots[slotIndex + 1];
          const timeDisplay = isLab && nextSlot && !nextSlot.isBreak
            ? `${slot.time} - ${nextSlot.time}`
            : slot.time;
          
          return (
            <div
              key={slotIndex}
              className={`flex items-center gap-4 p-3 rounded-md border border-border ${
                cellData ? (color.isCustomHSL ? "" : color.bg) : "bg-surface"
              } ${cellData ? color.text : "text-text"} ${
                isLab ? "min-h-[100px]" : ""
              }`}
              style={{
                backgroundColor: cellData && color.isCustomHSL ? color.bg : undefined
              }}
            >
              <div className="w-40 shrink-0 text-sm font-semibold">
                {timeDisplay}
                {isLab && (
                  <span className="block text-[10px] mt-1 opacity-75">(2 Hours)</span>
                )}
              </div>
              <div className="flex-1">
                {cellData ? (
                  <div>
                    <div className="font-semibold">
                      {cellData.subject}
                      {isLab && (
                        <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">LAB SESSION</span>
                      )}
                    </div>
                    {(cellData.faculty || cellData.room) && (
                      <div className="text-xs mt-1 opacity-90">
                        {cellData.faculty && <span>{cellData.faculty}</span>}
                        {cellData.faculty && cellData.room && <span> • </span>}
                        {cellData.room && <span>{cellData.room}</span>}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-text/50 italic">No class scheduled</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Legend Component
const Legend = ({ subjectsWithTeachers }) => {
  const entries = Object.entries(subjectsWithTeachers || {});
  if (entries.length === 0) return null;

  return (
    <div className="p-4 bg-surface border border-border rounded-lg shadow-xs mt-4">
      <h3 className="text-sm font-semibold text-text mb-3">Subject & Faculty Legend</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {entries.map(([subject, teachers]) => {
          const color = getSubjectColor(subject);
          const teachersStr = Array.from(teachers).join(", ");
          return (
            <div
              key={subject}
              className="flex items-start gap-2.5 p-2 rounded-lg border border-border bg-background"
            >
              <div
                className={`w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 ${color.isCustomHSL ? "" : color.bg}`}
                style={{ backgroundColor: color.isCustomHSL ? color.bg : undefined }}
              />
              <div className="text-xs">
                <div className="font-semibold text-text leading-tight">{subject}</div>
                <div className="text-text/70 mt-1">
                  Faculty: <span className="font-medium text-text">{teachersStr}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-xs text-text/70 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-white/20 border border-text/30 rounded text-[10px]">LAB</span>
          <span>Lab sessions span 2 consecutive periods</span>
        </div>
      </div>
    </div>
  );
};

const getDivisionName = (id) => {
  const mapping = {
    "D001": "Div A",
    "D002": "Div B",
    "D003": "Div C",
    "D004": "Div D"
  };
  return mapping[id] || "Div A";
};

const DIVISIONS_BY_CLASS_AND_SEM = {
  // MCA Sem 1 (Div A, B, C)
  "MCA_S001": [
    { id: "D001", name: "Div A (Cloud Computing)" },
    { id: "D002", name: "Div B (Data Science)" },
    { id: "D003", name: "Div C (Data Science)" },
  ],
  // MCA Sem 3 (Div A, B, C, D)
  "MCA_S003": [
    { id: "D001", name: "Div A (Cloud Computing)" },
    { id: "D002", name: "Div B (Data Science)" },
    { id: "D003", name: "Div C (Data Science)" },
    { id: "D004", name: "Div D (Cyber Security & Data Science)" },
  ],

  // MBA Sem 1 & Sem 3 (Div A - H)
  "MBA_S001": [
    { id: "D001", name: "Div A (Marketing Management)" },
    { id: "D002", name: "Div B (Finance Management)" },
    { id: "D003", name: "Div C (Finance Technology)" },
    { id: "D004", name: "Div D (HR / Logistics & SCM)" },
    { id: "D005", name: "Div E (IB / Healthcare / Port / Banking)" },
    { id: "D006", name: "Div F (Digital Mkt / BA / Media / Event)" },
    { id: "D007", name: "Div G (Agri & Food Business)" },
    { id: "D008", name: "Div H (Project & Construction)" },
  ],
  "MBA_S003": [
    { id: "D001", name: "Div A (Marketing Management)" },
    { id: "D002", name: "Div B (Finance Management)" },
    { id: "D003", name: "Div C (Finance Technology)" },
    { id: "D004", name: "Div D (HR / Logistics & SCM)" },
    { id: "D005", name: "Div E (IB / Healthcare)" },
    { id: "D006", name: "Div F (Digital Mkt / BA)" },
    { id: "D007", name: "Div G (Agri & Food Business)" },
    { id: "D008", name: "Div H (Project & Construction)" },
  ],

  // MTech Sem 1 & Sem 3 (Div H)
  "MTech_S001": [
    { id: "D008", name: "Div H (Construction Management)" },
  ],
  "MTech_S003": [
    { id: "D008", name: "Div H (Construction Management)" },
  ],

  // TY BBA Sem 5 (Div C)
  "TY BBA_S005": [
    { id: "D003", name: "Div C (Data Science & Business Analytics)" },
  ]
};

const getAvailableDivisions = (targetClass = "MCA", semId = "S001") => {
  const key = `${targetClass}_${semId}`;
  return DIVISIONS_BY_CLASS_AND_SEM[key] || 
         DIVISIONS_BY_CLASS_AND_SEM[`${targetClass}_S001`] || 
         DIVISIONS_BY_CLASS_AND_SEM["MCA_S001"];
};

//* Master mapping table for Class + Semester + Division -> Class Teacher & Classroom
const CLASS_TEACHER_ROOM_TABLE = {
  // MCA Sem 1 (S001)
  "MCA_S001_D001": { teacher: "Prof. Vinod Charawande", room: "N 709" },
  "MCA_S001_D002": { teacher: "Prof. Pallavi Gaikwad", room: "N 710" },
  "MCA_S001_D003": { teacher: "Dr. Pradnya Mulye", room: "S 703" },
  "MCA_S001_D004": { teacher: "Prof. Harshitkumar", room: "N 715" },

  // MCA Sem 3 (S003)
  "MCA_S003_D001": { teacher: "Prof. Dr. Satyakam Rahul", room: "N 709" },
  "MCA_S003_D002": { teacher: "Prof. Hanifkha Pathan", room: "N 710" },
  "MCA_S003_D003": { teacher: "Prof. Deepak Ulape", room: "S 703" },
  "MCA_S003_D004": { teacher: "Prof. Harshitkumar", room: "N 715" },

  // MBA Sem 1 (S001)
  "MBA_S001_D001": { teacher: "Dr. Manju Rughwani", room: "M 101" },
  "MBA_S001_D002": { teacher: "Dr. Dipak Sahoo", room: "M 102" },
  "MBA_S001_D003": { teacher: "Dr. Dipak Sahoo", room: "M 103" },
  "MBA_S001_D004": { teacher: "Prof. Supriya Bhagat", room: "M 104" },
  "MBA_S001_D005": { teacher: "Dr. Amol Gajdhane", room: "M 105" },
  "MBA_S001_D006": { teacher: "Dr. Ravindra Khedkar", room: "M 106" },
  "MBA_S001_D007": { teacher: "Dr. Ritesh Watharkar", room: "M 107" },
  "MBA_S001_D008": { teacher: "Prof. Priyanka S. Patil", room: "M 108" },

  // MBA Sem 3 (S003)
  "MBA_S003_D001": { teacher: "Dr. Ganesh Waghmare", room: "M 201" },
  "MBA_S003_D002": { teacher: "Prof. Rajesh Sasane", room: "M 202" },
  "MBA_S003_D003": { teacher: "Dr. Sachin Lad", room: "M 203" },
  "MBA_S003_D004": { teacher: "Dr. Twinkle Choudhary", room: "M 204" },
  "MBA_S003_D005": { teacher: "Dr. Priyanka Pradhan / Prof. Chandresh Chakraborty", room: "M 205" },
  "MBA_S003_D006": { teacher: "Prof. Chandresh Chakraborty", room: "M 206" },
  "MBA_S003_D007": { teacher: "Dr. Sushma Lokhande", room: "M 207" },
  "MBA_S003_D008": { teacher: "Prof. Aishwarya Kadoo", room: "M 208" },

  // MTech Sem 1 (S001) & Sem 3 (S003)
  "MTech_S001_D008": { teacher: "Prof. Priyanka S. Patil", room: "T 302" },
  "MTech_S003_D008": { teacher: "Prof. Aishwarya Kadoo", room: "T 402" },

  // TY BBA Sem 5 (S005)
  "TY BBA_S005_D003": { teacher: "Prof. Dinesh Suthar", room: "B 501" },
  "TY BBA_S001_D003": { teacher: "Prof. Dinesh Suthar", room: "B 501" },
};

const getDivisionDetails = (divId, targetClass = "MCA", semId = "S001") => {
  const key = `${targetClass}_${semId}_${divId}`;
  if (CLASS_TEACHER_ROOM_TABLE[key]) {
    return CLASS_TEACHER_ROOM_TABLE[key];
  }
  const fallbackKey = `${targetClass}_S001_${divId}`;
  return CLASS_TEACHER_ROOM_TABLE[fallbackKey] || { teacher: "Class Teacher", room: "Class Room" };
};

// Main TimeTable Component
const TimeTable = () => {
  const { userData } = useSelector((state) => state.auth || {});
  const isAdmin = userData?.role === "admin";

  const [viewMode, setViewMode] = useState("week");
  const [selectedDay, setSelectedDay] = useState("monday");
  const [facultyViewMode, setFacultyViewMode] = useState("my_schedule");
  const [timetableData, setTimetableData] = useState(MCA_SAMPLE_DATA);
  const [rawEntries, setRawEntries] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("D001");
  const [selectedClass, setSelectedClass] = useState("MCA");
  const [selectedSemester, setSelectedSemester] = useState("S001");
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genSemester, setGenSemester] = useState("S001");
  const [genAcademicYear, setGenAcademicYear] = useState("2026-2027");
  const [genBy, setGenBy] = useState("ADMIN");
  const [isGenerating, setIsGenerating] = useState(false);
  const timetableRef = useRef(null);
  const exportRef = useRef(null);

  // Derive current faculty ID & Name
  const currentFacultyId = React.useMemo(() => {
    if (userData?.role !== "faculty") return null;
    if (userData?.faculty_id) return userData.faculty_id;
    if (userData?.user_id && userData.user_id.startsWith("FAC")) {
      return userData.user_id.replace(/^FAC/, "");
    }
    return null;
  }, [userData]);

  const currentFacultyName = React.useMemo(() => {
    if (userData?.user_name) return userData.user_name;
    const found = faculties.find(f => f.faculty_id === currentFacultyId);
    return found ? found.faculty_name : (userData?.user_id || "Faculty");
  }, [userData, currentFacultyId, faculties]);

  // Find all divisions taught by this faculty member
  const facultyTaughtDivisions = React.useMemo(() => {
    if (!currentFacultyId || rawEntries.length === 0) return [];
    const set = new Set();
    rawEntries.forEach(entry => {
      if (entry.faculty_id === currentFacultyId) {
        set.add(entry.class_group);
      }
    });
    return Array.from(set);
  }, [currentFacultyId, rawEntries]);

  // Map student class to division ID
  const getDivisionIdFromClass = (classStr) => {
    if (!classStr) return "D001";
    const parts = classStr.trim().split(/\s+/);
    const lastPart = parts[parts.length - 1].toUpperCase();
    const mapping = {
      "A": "D001",
      "B": "D002",
      "C": "D003",
      "D": "D004"
    };
    return mapping[lastPart] || "D001";
  };

  const activeDivisionId = userData?.role === "student"
    ? getDivisionIdFromClass(userData?.class_group)
    : selectedDivision;

  // Compute subjects and their teachers for the active division
  const subjectsWithTeachers = React.useMemo(() => {
    const courseMap = {};
    courses.forEach(c => {
      courseMap[c.course_id] = c.course_name;
    });

    const facultyMap = {};
    faculties.forEach(f => {
      facultyMap[f.faculty_id] = f.faculty_name;
    });

    const isFacultyMySchedule = userData?.role === "faculty" && facultyViewMode === "my_schedule";

    const filtered = isFacultyMySchedule
      ? rawEntries.filter(entry => entry.faculty_id === currentFacultyId)
      : rawEntries.filter(entry => entry.class_group === activeDivisionId && isCourseForClass(entry.course_id, courseMap[entry.course_id], selectedClass));

    const mapping = {};
    filtered.forEach(entry => {
      const subjectName = courseMap[entry.course_id] || entry.course_id;
      const facultyName = isFacultyMySchedule
        ? `Class: ${getDivisionName(entry.class_group)}`
        : (facultyMap[entry.faculty_id] || entry.faculty_id);

      if (subjectName && facultyName) {
        if (!mapping[subjectName]) {
          mapping[subjectName] = new Set();
        }
        mapping[subjectName].add(facultyName);
      }
    });

    // Fallback to class-specific sample data if no database allocations exist for this class
    if (Object.keys(mapping).length === 0) {
      const fallbackSample = SAMPLE_TIMETABLE_BY_CLASS[selectedClass] || MCA_SAMPLE_DATA;
      Object.values(fallbackSample).forEach(dayList => {
        dayList.forEach(cell => {
          if (cell && cell.subject) {
            const names = cell.subject.split('/');
            names.forEach(name => {
              const cleaned = name.trim();
              if (cleaned) {
                if (!mapping[cleaned]) {
                  mapping[cleaned] = new Set();
                }
                mapping[cleaned].add(isFacultyMySchedule ? "Your Assigned Classes" : "Class Faculty");
              }
            });
          }
        });
      });
    }

    return mapping;
  }, [rawEntries, activeDivisionId, courses, faculties, userData, facultyViewMode, currentFacultyId]);

  const getSemesterLabel = (semId) => {
    const map = { "S001": "SEM - I", "S002": "SEM - II", "S003": "SEM - III", "S004": "SEM - IV" };
    return map[semId] || "SEM - II";
  };

  const getSemesterRoman = (semId) => {
    const map = { "S001": "I", "S002": "II", "S003": "III", "S004": "IV" };
    return map[semId] || "II";
  };

  //* College information (can be fetched from API)
  const collegeInfo = React.useMemo(() => {
    if (userData?.role === "faculty" && facultyViewMode === "my_schedule") {
      const taughtNames = facultyTaughtDivisions.map(getDivisionName).join(", ");
      return {
        name: "MIT COLLEGE OF MANAGEMENT & COMPUTER APPLICATIONS",
        batch: "BATCH 2026 ( A. Y. - 2026-27)",
        semester: getSemesterLabel(selectedSemester),
        effectiveDate: "1 September 2026",
        classInfo: `Personal Teaching Schedule - ${currentFacultyName}`,
        classTeacher: `Faculty ID: ${currentFacultyId || "F001"}`,
        roomNo: taughtNames ? `Assigned Classes: ${taughtNames}` : "All Classes",
      };
    }

    return {
      name: "MIT COLLEGE OF MANAGEMENT & COMPUTER APPLICATIONS",
      batch: "BATCH 2026 ( A. Y. - 2026-27)",
      semester: getSemesterLabel(selectedSemester),
      effectiveDate: "1 September 2026",
      classInfo: userData?.role === "student" && userData?.class_group 
        ? `${selectedClass} - ${userData.class_group}` 
        : `${selectedClass} - ${getSemesterRoman(selectedSemester)} ${getDivisionName(activeDivisionId)}`,
      classTeacher: getDivisionDetails(activeDivisionId, selectedClass, selectedSemester).teacher,
      roomNo: getDivisionDetails(activeDivisionId, selectedClass, selectedSemester).room,
    };
  }, [userData, facultyViewMode, activeDivisionId, currentFacultyName, currentFacultyId, facultyTaughtDivisions, selectedClass, selectedSemester]);

  //! Handle Print functionality
  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the timetable');
      return;
    }

    const timetableHTML = timetableRef.current?.innerHTML || '';
    const printStyles = `
      <style>
        @media print {
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; text-align: center; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .bg-green-700 { background-color: #15803d !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-red-900 { background-color: #7f1d1d !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-yellow-600 { background-color: #ca8a04 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-orange-500 { background-color: #f97316 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-green-500 { background-color: #22c55e !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-yellow-700 { background-color: #a16207 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-blue-900 { background-color: #1e3a8a !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-yellow-800 { background-color: #854d0e !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-gray-700 { background-color: #374151 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-gray-600 { background-color: #4b5563 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-cyan-400 { background-color: #22d3ee !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-green-600 { background-color: #16a34a !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-yellow-100 { background-color: #fef9c3 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .text-white { color: white !important; }
          .text-black { color: black !important; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          .text-xl { font-size: 1.25rem; }
          .text-sm { font-size: 0.875rem; }
          .text-xs { font-size: 0.75rem; }
          .space-y-1 > * + * { margin-top: 0.25rem; }
          .pt-1 { padding-top: 0.25rem; }
          .p-4 { padding: 1rem; }
          .p-2 { padding: 0.5rem; }
          .p-1 { padding: 0.25rem; }
          .gap-8 { gap: 2rem; }
          .flex { display: flex; }
          .justify-center { justify-content: center; }
          .items-center { align-items: center; }
          .tracking-wide { letter-spacing: 0.025em; }
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Timetable - ${collegeInfo.classInfo}</title>
          ${printStyles}
        </head>
        <body>
          <div class="p-4">
            <div style="background-color: #000; color: #fff; padding: 16px; text-align: center; margin-bottom: 20px;">
              <h1 style="font-size: 1.25rem; font-weight: bold; margin: 0;">${collegeInfo.name}</h1>
              <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 8px; font-size: 0.875rem;">
                <span><strong>${collegeInfo.batch}</strong></span>
                <span><strong>${collegeInfo.semester}</strong></span>
                <span>Effective From ${collegeInfo.effectiveDate}</span>
              </div>
              <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 4px; font-size: 0.875rem;">
                <span><strong>${collegeInfo.classInfo}</strong></span>
                <span>Class Teacher - ${collegeInfo.classTeacher}</span>
                <span>Class Room No - ${collegeInfo.roomNo}</span>
              </div>
            </div>
            ${timetableHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    
    //* Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }, [collegeInfo]);

  //! Handle Export to PDF functionality
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const element = exportRef.current;
      if (!element) {
        throw new Error('Export container element not found');
      }

      // Render the element as a PNG data URL using html-to-image
      const dataUrl = await toPng(element, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: window.getComputedStyle(element).backgroundColor || '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `Timetable_${collegeInfo.classInfo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export timetable. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [collegeInfo]);

  const handleExportCalendar = useCallback(() => {
    try {
      exportToICS(timetableData, TIME_SLOTS, collegeInfo);
    } catch (error) {
      console.error('Calendar export failed:', error);
      alert('Failed to export calendar. Please try again.');
    }
  }, [timetableData, collegeInfo]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      //* Fetch fresh timetable entries from API (bypass cache)
      const response = await apiClient.get('/timetable-entries', { params: { limit: 2000 }, cache: false });
      if (response.data?.data?.data) {
        setRawEntries(response.data.data.data);
      } else if (Array.isArray(response.data?.data)) {
        setRawEntries(response.data.data);
      }

      // Fetch all courses and faculties to map names
      const coursesRes = await apiClient.get('/courses', { params: { limit: 1000 }, cache: false });
      const facultiesRes = await apiClient.get('/faculties', { params: { limit: 1000 }, cache: false });
      if (coursesRes.data?.data?.data) {
        setCourses(coursesRes.data.data.data);
      }
      if (facultiesRes.data?.data?.data) {
        setFaculties(facultiesRes.data.data.data);
      }
    } catch (error) {
      console.error('Failed to refresh timetable:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  React.useEffect(() => {
    if (rawEntries.length === 0) return;

    // Create lookup maps for actual names
    const courseMap = {};
    courses.forEach(c => {
      courseMap[c.course_id] = c.course_name;
    });

    const facultyMap = {};
    faculties.forEach(f => {
      facultyMap[f.faculty_id] = f.faculty_name;
    });

    const formattedData = {
      monday: new Array(10).fill(null),
      tuesday: new Array(10).fill(null),
      wednesday: new Array(10).fill(null),
      thursday: new Array(10).fill(null),
      friday: new Array(10).fill(null),
      saturday: new Array(10).fill(null)
    };

    const isFacultyMySchedule = userData?.role === "faculty" && facultyViewMode === "my_schedule";

    const filtered = isFacultyMySchedule
      ? rawEntries.filter(entry => entry.faculty_id === currentFacultyId)
      : rawEntries.filter(entry => 
          entry.class_group === activeDivisionId && 
          (entry.semester_id ? entry.semester_id === selectedSemester : true) &&
          isCourseForClass(entry.course_id, courseMap[entry.course_id], selectedClass)
        );

    if (filtered.length === 0 && !isFacultyMySchedule) {
      const classSample = getSampleTimetable(selectedClass, selectedSemester);
      setTimetableData(classSample);
      return;
    }

    filtered.forEach(entry => {
      const day = entry.day_of_week.toLowerCase();
      
      // Parse database slot ID (e.g. TS001 -> 1, TS009 -> 9 -> slotNum 1)
      const num = parseInt(entry.slot_id.replace("TS", "")) || 1;
      const slotNum = (num - 1) % 8 + 1; // 1 to 8

      // Map daily slot number to the 10-period React layout (including breaks)
      let index = 0;
      if (slotNum === 1) index = 0;
      else if (slotNum === 2) index = 1;
      else if (slotNum === 3) index = 3;
      else if (slotNum === 4) index = 4; // Period 4
      else if (slotNum === 5) index = 5; // Lunch break
      else if (slotNum === 6) index = 6;
      else if (slotNum === 7) index = 7;
      else if (slotNum === 8) index = 9;

      if (formattedData[day]) {
        const existing = formattedData[day][index];
        const newSubject = courseMap[entry.course_id] || entry.course_id;
        const newFaculty = isFacultyMySchedule
          ? `Class: ${getDivisionName(entry.class_group)}`
          : (facultyMap[entry.faculty_id] || entry.faculty_id);
        const newRoom = entry.block ? `${entry.room_no} (${entry.block})` : entry.room_no;
        const isMyClass = entry.faculty_id === currentFacultyId;
        
        if (existing) {
          formattedData[day][index] = {
            subject: `${existing.subject} / ${newSubject}`,
            faculty: `${existing.faculty} / ${newFaculty}`,
            room: `${existing.room} / ${newRoom}`,
            isLab: existing.isLab || entry.isLab,
            isMyClass: existing.isMyClass || isMyClass
          };
        } else {
          formattedData[day][index] = {
            subject: newSubject,
            faculty: newFaculty,
            room: newRoom,
            isLab: entry.isLab,
            isMyClass: isMyClass
          };
        }
      }
    });

    // In Class View (non-MySchedule), fill all remaining empty slots so 100% of slots are filled
    if (!isFacultyMySchedule) {
      let emptyCount = 0;
      const lectureIndices = [0, 1, 3, 4, 6, 7, 9];
      const weekdayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday"];

      weekdayKeys.forEach(day => {
        lectureIndices.forEach(idx => {
          if (!formattedData[day][idx]) {
            emptyCount++;
            if (emptyCount % 3 === 1) {
              formattedData[day][idx] = {
                subject: "Mentoring Session",
                faculty: getDivisionDetails(activeDivisionId, selectedClass, selectedSemester).teacher || "Class Teacher",
                room: getDivisionDetails(activeDivisionId, selectedClass, selectedSemester).room || "Class Room",
                isLab: false
              };
            } else if (emptyCount % 3 === 2) {
              formattedData[day][idx] = {
                subject: "Library & Research Session",
                faculty: "Librarian",
                room: "Library Center",
                isLab: false
              };
            } else {
              formattedData[day][idx] = {
                subject: "Self Study & Case Prep",
                faculty: "Faculty Advisor",
                room: getDivisionDetails(activeDivisionId, selectedClass, selectedSemester).room || "Class Room",
                isLab: false
              };
            }
          }
        });
      });
    }

    setTimetableData(formattedData);
  }, [rawEntries, activeDivisionId, courses, faculties, userData, facultyViewMode, currentFacultyId, selectedClass]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      // Invalidate cache on generate
      await apiClient.post('/timetables/generate', {
        semester_id: genSemester,
        academicYear: genAcademicYear,
        generatedBy: genBy
      }, { invalidateCache: "timetables" });
      alert('Timetable generated successfully!');
      setShowGenerateModal(false);
      handleRefresh();
    } catch (error) {
      console.error('Failed to generate timetable:', error);
      alert(error.response?.data?.message || 'Failed to generate timetable.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Action Buttons */}
      <ActionButtons
        onPrint={handlePrint}
        onExport={handleExport}
        onExportCalendar={handleExportCalendar}
        onRefresh={handleRefresh}
        onGenerate={() => setShowGenerateModal(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isRefreshing={isRefreshing}
        isExporting={isExporting}
        isAdmin={isAdmin}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSemester={selectedSemester}
        setSelectedSemester={setSelectedSemester}
        selectedDivision={selectedDivision}
        setSelectedDivision={setSelectedDivision}
        role={userData?.role}
        facultyViewMode={facultyViewMode}
        setFacultyViewMode={setFacultyViewMode}
        facultyTaughtDivisions={facultyTaughtDivisions}
      />
      
      {/* Export Container wrapping Header, Content Grid, and Legend */}
      <div ref={exportRef} className="flex-1 overflow-auto p-6 bg-background space-y-6">
        {/* Header */}
        <TimetableHeader collegeInfo={collegeInfo} />
        
        {/* Timetable Content */}
        {["S002", "S004"].includes(selectedSemester) ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center my-6 space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              🚫
            </div>
            <h3 className="text-xl font-bold text-text">Semester Not Available</h3>
            <p className="text-sm text-text/70 max-w-md mx-auto leading-relaxed">
              The current session (Effective from 1 September 2026) is an <strong>Odd Semester Term</strong>.
              Timetables for <strong>{selectedSemester === "S002" ? "Sem II" : "Sem IV"}</strong> (Even Semester) are currently inactive.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setSelectedSemester("S001")}
                className="px-4 py-2 text-xs font-semibold rounded-md bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                Switch to Active Sem I
              </button>
              <button
                onClick={() => setSelectedSemester("S003")}
                className="px-4 py-2 text-xs font-semibold rounded-md bg-surface-hover border border-border text-text hover:bg-border transition-colors"
              >
                Switch to Active Sem III
              </button>
            </div>
          </div>
        ) : (
          <>
            <div ref={timetableRef}>
              {viewMode === "week" ? (
                <WeekView timetableData={timetableData} timeSlots={TIME_SLOTS} />
              ) : (
                <DayView
                  timetableData={timetableData}
                  timeSlots={TIME_SLOTS}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                />
              )}
            </div>
            
            {/* Legend */}
            <Legend subjectsWithTeachers={subjectsWithTeachers} />
          </>
        )}
      </div>

      {/* Generation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface border border-border p-6 rounded-lg shadow-xl w-96 text-text">
            <h3 className="text-lg font-bold mb-4">Generate Timetable</h3>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Semester ID</label>
                <input
                  type="text"
                  value={genSemester}
                  onChange={(e) => setGenSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md text-text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Academic Year</label>
                <input
                  type="text"
                  value={genAcademicYear}
                  onChange={(e) => setGenAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md text-text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Generated By</label>
                <input
                  type="text"
                  value={genBy}
                  onChange={(e) => setGenBy(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-background rounded-md text-text"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-surface hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTable;

