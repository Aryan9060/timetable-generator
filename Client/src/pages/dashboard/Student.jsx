import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TimeTable from "../../components/deshboard/TimeTable";

function Student() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userData = useSelector((state) => state.auth.userData);
  const authLoading = useSelector((state) => state.auth.loading);
  const navigate = useNavigate();

  useEffect(() => {
    //* Only redirect if auth check is complete and user is not authenticated
    if (!authLoading && (!isAuthenticated || !userData || userData.role !== "student")) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, userData, navigate]);

  //* Show loading while verifying session
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium text-primary">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userData || userData.role !== "student") {
    return null;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">Student Dashboard</h1>
        <p className="text-text/70">Welcome, {userData.user_name || userData.user_id}!</p>
      </div>
      <div className="border border-border rounded-lg bg-surface overflow-hidden shadow-sm">
        <TimeTable />
      </div>
    </div>
  );
}

export default Student;