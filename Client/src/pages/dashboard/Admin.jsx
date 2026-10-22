import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// import AdminHeader from "../../components/admin/AdminHeader";
import SideBar from "../../components/deshboard/SideBar";
import DataTable from "../../components/deshboard/DataTable";
import Form from "../../components/deshboard/Form";
import {
  fetchMasterData,
  setActiveEntity,
  setEditingEntityId,
  addMasterData,
} from "../../store/admin/adminSlice";
import ExcelHendelButton from "../../components/ExcelHendelButton";
import TimeTable from "../../components/deshboard/TimeTable";
import Analytics from "../../components/deshboard/Analytics";

function Admin() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userData = useSelector((state) => state.auth.userData);
  const authLoading = useSelector((state) => state.auth.loading);
  const navigate = useNavigate();
  const [showTimetable, setShowTimetable] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { activeEntity, masterData, loading, error, editingEntityId } = useSelector(
    (state) => state.admin,
  );

  //! Verify session first, then fetch data
  useEffect(() => {
    if (isAuthenticated && userData?.role === "admin") {
      //* Fetch initial data for all entities with default pagination
      const entities = [
        "program",
        "course",
        "room",
        "division",
        "specialization",
        "faculty",
        "student",
        "qualification_type",
        "subject_allocation",
        "time_slot",
        "timetable",
        "timetable_entry",
        "user",
      ];
      entities.forEach((entityKey) => {
        dispatch(
          fetchMasterData({ entityKey, params: { page: 1, limit: 10 } }),
        );
      });
    }
  }, [dispatch, isAuthenticated, userData]);

  useEffect(() => {
    //* Only redirect if auth check is complete and user is not authenticated
    if (
      !authLoading &&
      (!isAuthenticated || !userData || userData.role !== "admin")
    ) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, userData, navigate]);

  useEffect(() => {
    if (activeEntity && !masterData[activeEntity]) {
      dispatch(
        fetchMasterData({
          entityKey: activeEntity,
          params: { page: 1, limit: 10 },
        }),
      );
    }
  }, [activeEntity, dispatch, masterData]);

  //* Show loading while verifying session
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg font-medium text-primary">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userData || userData.role !== "admin") {
    return null;
  }

  //! Entity configurations aligned with backend models
  const ENTITY_CONFIG = {
    program: {
      label: "Program",
      pluralLabel: "Programs",
      description: "Define academic programs like B.Tech CSE, BBA, etc.",
      fields: [
        {
          name: "program_id",
          label: "Program Code",
          placeholder: "e.g. UG-CSE",
          type: "text",
          required: true,
        },
        {
          name: "program_name",
          label: "Program Name",
          placeholder: "e.g. Undergraduate Computer Science",
          type: "text",
          required: true,
        },
        {
          name: "program_duration",
          label: "Duration (years)",
          placeholder: "e.g. 4",
          type: "number",
          required: true,
        },
        {
          name: "isActive",
          label: "Active",
          type: "boolean",
          required: false,
        },
      ],
    },
    course: {
      label: "Course",
      pluralLabel: "Courses",
      description: "Define courses with credit hours.",
      fields: [
        {
          name: "course_id",
          label: "Course Code",
          placeholder: "e.g. UG-CSE-101",
          type: "text",
          required: true,
        },
        {
          name: "course_name",
          label: "Course Name",
          placeholder: "e.g. Introduction to Programming",
          type: "text",
          required: true,
        },
        {
          name: "credit",
          label: "Credits",
          placeholder: "e.g. 3",
          type: "number",
          required: true,
        },
        {
          name: "isActive",
          label: "Active",
          type: "boolean",
          required: false,
        },
      ],
    },
    semester: {
      label: "Semester",
      pluralLabel: "Semesters",
      description: "Define semesters (odd/even).",
      fields: [
        {
          name: "semester_id",
          label: "Semester Code",
          placeholder: "e.g. SEM1",
          type: "text",
          required: true,
        },
        {
          name: "semester_name",
          label: "Semester Name",
          placeholder: "e.g. Semester 1",
          type: "text",
          required: true,
        },
        {
          name: "isEven",
          label: "Is Even Semester",
          type: "boolean",
          required: false,
        },
      ],
    },
    division: {
      label: "Division",
      pluralLabel: "Divisions",
      description: "Define class divisions/sections.",
      fields: [
        {
          name: "division_id",
          label: "Division Code",
          placeholder: "e.g. DIV-A",
          type: "text",
          required: true,
        },
        {
          name: "division_name",
          label: "Division Name",
          placeholder: "e.g. Section A",
          type: "text",
          required: true,
        },
        {
          name: "description",
          label: "Description",
          placeholder: "e.g. Morning batch division",
          type: "text",
          required: false,
        },
        {
          name: "preferredRoom_no",
          label: "Preferred Room Number",
          placeholder: "e.g. 709",
          type: "text",
          required: false,
        },
        {
          name: "preferredRoom_block",
          label: "Preferred Room Block",
          placeholder: "e.g. NORTH",
          type: "text",
          required: false,
        },
      ],
    },
    room: {
      label: "Room",
      pluralLabel: "Rooms",
      description: "Maintain list of rooms for scheduling classes.",
      fields: [
        {
          name: "room_no",
          label: "Room Number",
          placeholder: "e.g. R101",
          type: "text",
          required: true,
        },
        {
          name: "floor_no",
          label: "Floor",
          placeholder: "e.g. 1st Floor",
          type: "text",
          required: true,
        },
        {
          name: "block",
          label: "Block",
          placeholder: "e.g. A",
          type: "text",
          required: true,
        },
        {
          name: "isLab",
          label: "Is Lab",
          type: "boolean",
          required: false,
        },
      ],
    },
    specialization: {
      label: "Specialization",
      pluralLabel: "Specializations",
      description: "Define specializations for programs (e.g. AI, DS).",
      fields: [
        {
          name: "specialization_id",
          label: "Specialization Code",
          placeholder: "e.g. CSE-AI",
          type: "text",
          required: true,
        },
        {
          name: "specialization_name",
          label: "Specialization Name",
          placeholder: "e.g. Artificial Intelligence",
          type: "text",
          required: true,
        },
        {
          name: "isActive",
          label: "Active",
          type: "boolean",
          required: false,
        },
      ],
    },
    faculty: {
      label: "Faculty",
      pluralLabel: "Faculty",
      description: "Add faculty details to map classes and subjects.",
      fields: [
        {
          name: "faculty_id",
          label: "Faculty ID",
          placeholder: "e.g. F001",
          type: "text",
          required: true,
        },
        {
          name: "faculty_name",
          label: "Full Name",
          placeholder: "e.g. Dr. Sunil Kumar",
          type: "text",
          required: true,
        },
        {
          name: "email",
          label: "Email",
          placeholder: "e.g. sunil@college.edu",
          type: "email",
          required: true,
        },
        {
          name: "phone",
          label: "Phone Number",
          placeholder: "e.g. +91 9876543210",
          type: "tel",
          required: true,
        },
        {
          name: "gender",
          label: "Gender",
          placeholder: "e.g. Male/Female/Other",
          type: "select",
          options: ["male", "female", "other"],
          required: true,
        },
        {
          name: "specialization",
          label: "Specialization",
          placeholder: "e.g. Computer Science",
          type: "text",
          required: true,
        },
        {
          name: "higher_qualification",
          label: "Highest Qualification",
          placeholder: "e.g. PhD in Computer Science",
          type: "text",
          required: true,
        },
        {
          name: "years_of_Experience",
          label: "Years of Experience",
          placeholder: "e.g. 10",
          type: "number",
          required: true,
        },
        {
          name: "date_of_joining",
          label: "Date of Joining",
          placeholder: "e.g. 2020-08-15",
          type: "date",
          required: true,
        },
        {
          name: "date_of_birth",
          label: "Date of Birth",
          placeholder: "e.g. 1980-05-20",
          type: "date",
          required: false,
        },
        {
          name: "address",
          label: "Address",
          placeholder: "e.g. 123 Main St, City",
          type: "text",
          required: true,
        },
        {
          name: "isActive",
          label: "Active",
          type: "boolean",
          required: false,
        },
      ],
    },
    student: {
      label: "Student",
      pluralLabel: "Students",
      description: "Maintain list of students for each class/section.",
      fields: [
        {
          name: "student_id",
          label: "Student ID",
          placeholder: "e.g. 24CS001",
          type: "text",
          required: true,
        },
        {
          name: "student_name",
          label: "Full Name",
          placeholder: "e.g. Aryan Kumar",
          type: "text",
          required: true,
        },
        {
          name: "gender",
          label: "Gender",
          placeholder: "e.g. Male/Female/Other",
          type: "select",
          options: ["male", "female", "other"],
          required: true,
        },
        {
          name: "email",
          label: "Email",
          placeholder: "e.g. aryan@college.edu",
          type: "email",
          required: true,
        },
        {
          name: "phone",
          label: "Phone Number",
          placeholder: "e.g. +91 9876543210",
          type: "tel",
          required: true,
        },
        {
          name: "class",
          label: "Class",
          placeholder: "e.g. CSE-3A",
          type: "text",
          required: true,
        },
        {
          name: "batch",
          label: "Batch",
          placeholder: "e.g. 2024-2028",
          type: "text",
          required: true,
        },
        {
          name: "specialization",
          label: "Specialization",
          placeholder: "e.g. AI",
          type: "text",
          required: true,
        },
        {
          name: "date_of_birth",
          label: "Date of Birth",
          placeholder: "e.g. 2000-01-01",
          type: "date",
          required: true,
        },
      ],
    },
    qualification_type: {
      label: "Qualification Type",
      pluralLabel: "Qualification Types",
      description: "Define qualification types for faculty.",
      fields: [
        {
          name: "qualification_id",
          label: "Qualification Code",
          placeholder: "e.g. PHD-CS",
          type: "text",
          required: true,
        },
        {
          name: "qualification_name",
          label: "Qualification Name",
          placeholder: "e.g. PhD in Computer Science",
          type: "text",
          required: true,
        },
        {
          name: "description",
          label: "Description",
          placeholder: "e.g. Doctoral degree in Computer Science",
          type: "text",
          required: true,
        },
      ],
    },
    subject_allocation: {
      label: "Subject Allocation",
      pluralLabel: "Subject Allocations",
      description: "Allocate subjects to faculty for specific divisions.",
      fields: [
        {
          name: "subjectAllocation_id",
          label: "Allocation ID",
          placeholder: "e.g. SA-2024-001",
          type: "text",
          required: true,
        },
        {
          name: "semester_id",
          label: "Semester",
          placeholder: "e.g. SEM1",
          type: "text",
          required: true,
        },
        {
          name: "program_id",
          label: "Program",
          placeholder: "e.g. UG-CSE",
          type: "text",
          required: true,
        },
        {
          name: "division_id",
          label: "Division",
          placeholder: "e.g. DIV-A",
          type: "text",
          required: true,
        },
        {
          name: "course_id",
          label: "Course",
          placeholder: "e.g. UG-CSE-101",
          type: "text",
          required: true,
        },
        {
          name: "faculty_id",
          label: "Faculty",
          placeholder: "e.g. F001",
          type: "text",
          required: true,
        },
        // {
        //   name: "classTeacher",
        //   label: "Class Teacher Name",
        //   placeholder: "e.g. Dr. Sunil Kumar",
        //   type: "text",
        //   required: true,
        // },
        {
          name: "academicYear",
          label: "Academic Year",
          placeholder: "e.g. 2024-2025",
          type: "text",
          required: true,
        },
        {
          name: "l",
          label: "Lecture Hours (L)",
          placeholder: "e.g. 3",
          type: "number",
          required: true,
        },
        {
          name: "t",
          label: "Tutorial Hours (T)",
          placeholder: "e.g. 1",
          type: "number",
          required: true,
        },
        {
          name: "p",
          label: "Practical Hours (P)",
          placeholder: "e.g. 2",
          type: "number",
          required: true,
        },
        {
          name: "isLab",
          label: "Is Lab Subject",
          type: "boolean",
          required: false,
        },
      ],
    },
    time_slot: {
      label: "Time Slot",
      pluralLabel: "Time Slots",
      description: "Define time slots for the timetable.",
      fields: [
        {
          name: "slot_id",
          label: "Slot Code",
          placeholder: "e.g. SLOT-1",
          type: "text",
          required: true,
        },
        {
          name: "day_of_week",
          label: "Day of Week",
          placeholder: "e.g. monday",
          type: "select",
          options: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          required: true,
        },
        {
          name: "startTime",
          label: "Start Time",
          placeholder: "e.g. 09:00",
          type: "time",
          required: true,
        },
        {
          name: "endTime",
          label: "End Time",
          placeholder: "e.g. 10:00",
          type: "time",
          required: true,
        },
        {
          name: "slot_type",
          label: "Slot Type",
          placeholder: "e.g. LECTURE",
          type: "select",
          options: ["LECTURE", "LAB", "BREAK", "LUNCH"],
          required: true,
        },
        {
          name: "isBreak",
          label: "Is Break",
          type: "boolean",
          required: false,
        },
      ],
    },
    timetable: {
      label: "Timetable",
      pluralLabel: "Timetables",
      description: "Generate and manage timetables.",
      fields: [
        {
          name: "timetable_id",
          label: "Timetable ID",
          placeholder: "e.g. TT-2024-SEM1",
          type: "text",
          required: true,
        },
        {
          name: "semester_id",
          label: "Semester",
          placeholder: "e.g. SEM1",
          type: "text",
          required: true,
        },
        {
          name: "academicYear",
          label: "Academic Year",
          placeholder: "e.g. 2024-2025",
          type: "text",
          required: true,
        },
        {
          name: "generatedBy",
          label: "Generated By",
          placeholder: "e.g. ADMIN001",
          type: "text",
          required: true,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["draft", "published", "archived"],
          required: true,
        },
      ],
    },
    timetable_entry: {
      label: "Timetable Entry",
      pluralLabel: "Timetable Entries",
      description: "Individual entries in a timetable.",
      fields: [
        {
          name: "entry_id",
          label: "Entry ID",
          placeholder: "e.g. TE-001",
          type: "text",
          required: true,
        },
        {
          name: "faculty_id",
          label: "Faculty",
          placeholder: "e.g. F001",
          type: "text",
          required: true,
        },
        {
          name: "course_id",
          label: "Course",
          placeholder: "e.g. UG-CSE-101",
          type: "text",
          required: true,
        },
        {
          name: "slot_id",
          label: "Time Slot",
          placeholder: "e.g. SLOT-1",
          type: "text",
          required: true,
        },
        {
          name: "room_no",
          label: "Room",
          placeholder: "e.g. R101",
          type: "text",
          required: true,
        },
        {
          name: "class_group",
          label: "Class Group",
          placeholder: "e.g. CSE-3A",
          type: "text",
          required: true,
        },
        {
          name: "day_of_week",
          label: "Day",
          placeholder: "e.g. monday",
          type: "select",
          options: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          required: true,
        },
        {
          name: "isLab",
          label: "Is Lab",
          type: "boolean",
          required: false,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["scheduled", "cancelled", "rescheduled"],
          required: false,
        },
      ],
    },
    user: {
      label: "User",
      pluralLabel: "Users",
      description:
        "Manage system users (admin, faculty, students, coordinators, HODs).",
      fields: [
        {
          name: "user_name",
          label: "User Name",
          type: "text",
        },
        {
          name: "user_id",
          label: "User ID",
          type: "text",
        },
        {
          name: "password",
          label: "Password",
          placeholder: "Min 6 characters",
          type: "text",
          required: true,
        },
        {
          name: "role",
          label: "Role",
          type: "select",
          options: ["admin", "faculty", "student", "coordinator", "hod"],
          required: true,
        },
        {
          name: "student_id",
          label: "Student ID (if student)",
          placeholder: "e.g. 24CS001",
          type: "text",
          required: false,
        },
        {
          name: "faculty_id",
          label: "Faculty ID (if faculty)",
          placeholder: "e.g. F001",
          type: "text",
          required: false,
        },
        {
          name: "isActive",
          label: "Active",
          type: "boolean",
          required: false,
        },
      ],
    },
  };

  const handleSetActiveEntity = (entityKey) => {
    dispatch(setActiveEntity(entityKey));
  };
  const handleSetEditingEntityId = (id) => {
    dispatch(setEditingEntityId(id));
  };

  const handleUplode = (data) => {
    dispatch(addMasterData({ entityKey: activeEntity, data }));
  };

  const renderContent = () => {
    if (showTimetable) {
      return <TimeTable onClose={() => setShowTimetable(false)} />;
    }

    if (showAnalytics) {
      return <Analytics />;
    }

    if (!activeEntity) {
      return (
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center text-slate-500 h-full">
          <svg
            className="w-24 h-24 mb-6 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <h3 className="text-xl font-semibold text-slate-600 mb-2">
            Welcome to the Admin Dashboard
          </h3>
          <p className="text-base text-slate-500">
            Please select an item from the sidebar to get started.
          </p>
        </div>
      );
    }

    const currentEntityConfig = ENTITY_CONFIG[activeEntity];

    return (
      <div className="flex-1 p-8 space-y-6  overflow-y-auto h-full ">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold ">
            {currentEntityConfig.pluralLabel}
          </h2>

          <div className="flex items-center space-x-4">
            {/* Loading spinner if data is being fetched */}

            {loading && (
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm font-medium text-blue-600">
                  Loading...
                </span>
              </div>
            )}

            {/* Error message if there's an error */}
            {error && (
              <div className="flex items-center space-x-2 bg-red-100 px-3 py-2 rounded-md">
                <svg
                  className="h-5 w-5 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-sm text-red-700 font-medium">
                  {error}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className=" p-6 rounded-lg shadow-md">
          <Form
            key={`${activeEntity}-${editingEntityId || 'new'}`}
            currentEntityConfig={currentEntityConfig}
            activeEntity={activeEntity}
          />
        </div>
        <div className=" p-6 rounded-lg shadow-md">
          <DataTable
            key={activeEntity}
            currentEntityConfig={currentEntityConfig}
            activeEntity={activeEntity}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen mx-auto flex flex-col transition-colors duration-200">
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-surface">
        <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>

        <div className="flex items-center gap-4">
          {/* Timetable Toggle Button */}
          <button
            onClick={() => {
              setShowTimetable(!showTimetable);
              setShowAnalytics(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              showTimetable
                ? "bg-primary text-white hover:bg-secondary"
                : "bg-surface-hover border border-border text-text hover:bg-border"
            }`}
          >
            <svg
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {showTimetable ? "Back to Master Data" : "View Timetable"}
          </button>

          {/* Analytics Toggle Button */}
          <button
            onClick={() => {
              setShowAnalytics(!showAnalytics);
              setShowTimetable(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              showAnalytics
                ? "bg-primary text-white hover:bg-secondary"
                : "bg-surface-hover border border-border text-text hover:bg-border"
            }`}
          >
            <svg
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
              />
            </svg>
            {showAnalytics ? "Back to Master Data" : "View Analytics"}
          </button>

          {activeEntity && !showTimetable && !showAnalytics && (
            <ExcelHendelButton
              fileName={activeEntity}
              formet={[
                ENTITY_CONFIG[activeEntity].fields.reduce((acc, field) => {
                  acc[field.name] = field.placeholder;
                  return acc;
                }, {}),
              ]}
              handleUplode={handleUplode}
            />
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {!showTimetable && !showAnalytics && (
          <aside className="w-72 border-r border-slate-200 px-4 py-6 overflow-y-auto hidden md:block bg-surface">
            <SideBar
              ENTITY_CONFIG={ENTITY_CONFIG}
              masterData={masterData}
              activeEntity={activeEntity}
              setActiveEntity={handleSetActiveEntity}
              setEditingEntityId={handleSetEditingEntityId}
            />
          </aside>
        )}

        <main className="flex-1 overflow-hidden">{renderContent()}</main>
      </div>
    </div>
  );
}

export default Admin;
