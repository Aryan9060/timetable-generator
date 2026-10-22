import React, { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    rooms: [],
    faculties: [],
    divisions: [],
    entries: [],
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const [roomsRes, facultiesRes, divisionsRes, timetablesRes] = await Promise.all([
          apiClient.get("/rooms", { params: { limit: 1000 } }),
          apiClient.get("/faculties", { params: { limit: 1000 } }),
          apiClient.get("/divisions", { params: { limit: 1000 } }),
          apiClient.get("/timetables", { cache: false })
        ]);

        const rooms = roomsRes.data?.data?.data || [];
        const faculties = facultiesRes.data?.data?.data || [];
        const divisions = divisionsRes.data?.data?.data || [];
        
        // Find latest published timetable entries
        let entries = [];
        if (timetablesRes.data?.data?.data?.length > 0) {
          const latestTimetable = timetablesRes.data.data.data[timetablesRes.data.data.data.length - 1];
          entries = latestTimetable.entries || [];
        }

        setData({ rooms, faculties, divisions, entries });
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-3 text-text">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm font-medium">Gathering utilization statistics...</span>
      </div>
    );
  }

  // standard 8 slots * 5 days = 40 teaching periods per week
  const TOTAL_WEEKLY_SLOTS = 40;

  // 1. Calculate Room Occupancy
  const roomOccupancyMap = {};
  data.entries.forEach(entry => {
    const key = `${entry.room_no}-${entry.block || "MAIN"}`;
    roomOccupancyMap[key] = (roomOccupancyMap[key] || 0) + 1;
  });

  const roomStats = data.rooms.map(room => {
    const key = `${room.room_no}-${room.block}`;
    const occupiedSlots = roomOccupancyMap[key] || 0;
    const utilization = Math.min(100, Math.round((occupiedSlots / TOTAL_WEEKLY_SLOTS) * 100));
    return {
      room_no: room.room_no,
      block: room.block,
      isLab: room.isLab,
      occupiedSlots,
      utilization
    };
  }).sort((a, b) => b.utilization - a.utilization);

  // 2. Calculate Faculty Workloads
  const facultyWorkloadMap = {};
  data.entries.forEach(entry => {
    facultyWorkloadMap[entry.faculty_id] = (facultyWorkloadMap[entry.faculty_id] || 0) + 1;
  });

  const facultyStats = data.faculties.map(fac => {
    const occupiedSlots = facultyWorkloadMap[fac.faculty_id] || 0;
    return {
      faculty_id: fac.faculty_id,
      faculty_name: fac.faculty_name,
      designation: fac.designation,
      occupiedSlots,
      utilization: Math.min(100, Math.round((occupiedSlots / TOTAL_WEEKLY_SLOTS) * 100))
    };
  }).sort((a, b) => b.occupiedSlots - a.occupiedSlots);

  // 3. Overall stats
  const totalClassesCount = data.entries.length;
  const avgRoomUtilization = roomStats.length > 0 
    ? Math.round(roomStats.reduce((sum, r) => sum + r.utilization, 0) / roomStats.length) 
    : 0;
  
  const avgFacultyWorkload = facultyStats.length > 0
    ? Math.round(facultyStats.reduce((sum, f) => sum + f.occupiedSlots, 0) / facultyStats.length)
    : 0;

  return (
    <div className="p-6 space-y-6 text-text overflow-y-auto max-h-full">
      {/* Header Info */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Resource & Faculty Utilization</h2>
        <p className="text-text/70 text-sm">Real-time usage insights aggregated from the currently active timetable schedule.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-text/60 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Classes</span>
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-2xl font-bold">{totalClassesCount}</span>
          <p className="text-[10px] text-text/50 mt-1">Total weekly instruction hours</p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-text/60 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rooms Monitored</span>
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-2xl font-bold">{data.rooms.length}</span>
          <p className="text-[10px] text-text/50 mt-1">Avg Room utilization: <span className="font-semibold text-primary">{avgRoomUtilization}%</span></p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-text/60 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Faculty</span>
            <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-2xl font-bold">{data.faculties.length}</span>
          <p className="text-[10px] text-text/50 mt-1">Avg load: <span className="font-semibold text-primary">{avgFacultyWorkload} hrs/week</span></p>
        </div>

        <div className="bg-surface border border-border p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-text/60 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Class Divisions</span>
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <span className="text-2xl font-bold">{data.divisions.length}</span>
          <p className="text-[10px] text-text/50 mt-1">Sections generated</p>
        </div>
      </div>

      {/* Main content lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Utilization Cards */}
        <div className="bg-surface border border-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="text-sm font-semibold tracking-wide border-b border-border pb-2 text-text/80">Classroom & Lab Utilization</h3>
          <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
            {roomStats.map((room, idx) => {
              let barColor = "bg-primary";
              if (room.utilization < 25) barColor = "bg-blue-500";
              else if (room.utilization > 75) barColor = "bg-amber-500";

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      {room.room_no} ({room.block})
                      {room.isLab && <span className="bg-emerald-600/20 text-emerald-600 text-[9px] px-1 rounded">LAB</span>}
                    </span>
                    <span className="text-text/70">{room.utilization}% ({room.occupiedSlots} hrs)</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div 
                      className={`${barColor} h-2 rounded-full transition-all duration-300`} 
                      style={{ width: `${room.utilization}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Faculty Workload Load */}
        <div className="bg-surface border border-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="text-sm font-semibold tracking-wide border-b border-border pb-2 text-text/80">Faculty Teaching Load</h3>
          <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
            {facultyStats.map((faculty, idx) => {
              const workloadPercentage = Math.min(100, Math.round((faculty.occupiedSlots / 20) * 100)); // Assume 20 hours is max contract
              let barColor = "bg-teal-500";
              if (faculty.occupiedSlots > 16) barColor = "bg-red-500"; // Overload warning
              else if (faculty.occupiedSlots < 6) barColor = "bg-slate-400"; // Underload

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <div>
                      <span className="block font-medium">{faculty.faculty_name}</span>
                      <span className="block text-[10px] text-text/60 leading-none mt-0.5">{faculty.designation}</span>
                    </div>
                    <span className="text-text/70">{faculty.occupiedSlots} hrs/week</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div 
                      className={`${barColor} h-2 rounded-full transition-all duration-300`} 
                      style={{ width: `${workloadPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
