/**
 * Generative Timetable Scheduling Algorithm
 * Uses Constraint Satisfaction Problem (CSP) formulation with Backtracking
 */

//* Backtracking is exponential in the worst case. This caps the search per division so an
//* over-constrained timetable fails fast instead of hanging the request; hitting the cap
//* means "unsolved", never "solved".
const MAX_SOLVER_STEPS = 500;

export const generateSchedule = (allocations, rooms, timeSlots, divisions = [], curriculum = null) => {
  // Map course_id to its specialization_id (if any) from curriculum
  const courseSpecializations = {};
  if (curriculum && curriculum.subjects) {
    curriculum.subjects.forEach(sub => {
      if (sub.isSpecialization && sub.specialization_id) {
        courseSpecializations[sub.course_id] = sub.specialization_id;
      }
    });
  }

  // 1. Parse allocations into sessions
  const sessions = [];
  const specCounters = {}; // Key: division_id:specialization_id
  
  const getNextSpecIndex = (divisionId, specializationId) => {
    if (!specializationId) return null;
    const key = `${divisionId}:${specializationId}`;
    if (specCounters[key] === undefined) specCounters[key] = 0;
    return specCounters[key]++;
  };

  allocations.forEach(alloc => {
    const lectureCount = parseInt(alloc.l) || 0;
    const tutorialCount = parseInt(alloc.t) || 0;
    const practicalCount = parseInt(alloc.p) || 0;
    const specId = courseSpecializations[alloc.course_id];
    
    // Add lecture and tutorial sessions
    for (let i = 0; i < (lectureCount + tutorialCount); i++) {
      const specIndex = getNextSpecIndex(alloc.division_id, specId);
      sessions.push({
        id: `${alloc.subjectAllocation_id}-L-${i}`,
        allocation: alloc,
        course_id: alloc.course_id,
        faculty_id: alloc.faculty_id,
        division_id: alloc.division_id,
        type: "LECTURE",
        duration: 1,
        specialization_id: specId,
        spec_index: specIndex
      });
    }
    
    // Add practical/lab sessions (each lab spans 2 periods back-to-back)
    const labSessionsCount = Math.floor(practicalCount / 2);
    for (let i = 0; i < labSessionsCount; i++) {
      const specIndex = getNextSpecIndex(alloc.division_id, specId);
      sessions.push({
        id: `${alloc.subjectAllocation_id}-P-${i}`,
        allocation: alloc,
        course_id: alloc.course_id,
        faculty_id: alloc.faculty_id,
        division_id: alloc.division_id,
        type: "LAB",
        duration: 2,
        specialization_id: specId,
        spec_index: specIndex
      });
    }
  });

  // Sort sessions: labs first (larger duration, more constrained)
  sessions.sort((a, b) => b.duration - a.duration);

  // Calculate available non-break weekly slots
  const nonBreakSlots = timeSlots.filter(s => {
    const d = s.day_of_week?.toLowerCase();
    return d !== "saturday" && !s.isBreak && s.slot_type !== "BREAK" && s.slot_type !== "LUNCH";
  });
  // If slots are defined per day, max weekly slots for 1 division = nonBreakSlots per week (or 40 fallback)
  const maxWeeklySlots = nonBreakSlots.length > 0 ? nonBreakSlots.length : 40;

  // Pre-validate: Check if any Program Division requires more hours than max weekly slots
  const divHours = {};
  sessions.forEach(s => {
    const key = `${s.allocation?.program_id || 'PROG'}_${s.division_id}`;
    divHours[key] = (divHours[key] || 0) + s.duration;
  });

  for (const [key, hours] of Object.entries(divHours)) {
    if (hours > maxWeeklySlots) {
      return {
        error: `Program Division ${key} has ${hours} class hours allocated, exceeding the maximum weekly capacity of ${maxWeeklySlots} slots. Please reduce subject hours.`
      };
    }
  }

  // Pre-validate: Check if any Faculty is assigned more hours than max weekly slots
  const facHours = {};
  sessions.forEach(s => {
    if (s.faculty_id) {
      facHours[s.faculty_id] = (facHours[s.faculty_id] || 0) + s.duration;
    }
  });

  for (const [facId, hours] of Object.entries(facHours)) {
    if (hours > maxWeeklySlots) {
      return {
        error: `Faculty ${facId} is assigned ${hours} teaching hours, exceeding the maximum weekly capacity of ${maxWeeklySlots} slots.`
      };
    }
  }

  // Group slots by day_of_week
  const slotsByDay = {};
  timeSlots.forEach(slot => {
    const day = slot.day_of_week.toLowerCase();
    if (day === "saturday") return; // Do not schedule anything on Saturday
    if (!slotsByDay[day]) slotsByDay[day] = [];
    slotsByDay[day].push(slot);
  });

  // Sort slots inside each day by start time
  const timeToMinutes = (timeStr) => {
    const cleaned = timeStr.toLowerCase().replace(/[\s\.]/g, '');
    const isPm = cleaned.includes('pm');
    const isAm = cleaned.includes('am');
    let [hoursStr, minutesStr] = cleaned.replace(/am|pm/g, '').split(':');
    if (!minutesStr && cleaned.includes('.')) {
      [hoursStr, minutesStr] = cleaned.replace(/am|pm/g, '').split('.');
    }
    let hours = parseInt(hoursStr) || 0;
    let minutes = parseInt(minutesStr) || 0;
    if (isPm && hours !== 12) hours += 12;
    if (isAm && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  for (const day in slotsByDay) {
    slotsByDay[day].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }

  // Pre-calculate valid slot combinations for each day
  const possibleSlots = { LECTURE: [], LAB: [] };
  
  for (const day in slotsByDay) {
    const daySlots = slotsByDay[day];
    for (let i = 0; i < daySlots.length; i++) {
      const slot1 = daySlots[i];
      if (slot1.isBreak || slot1.slot_type === "BREAK" || slot1.slot_type === "LUNCH") continue;

      // Lecture candidate
      possibleSlots.LECTURE.push({
        day,
        slots: [slot1]
      });

      // Lab candidate (must be consecutive and no break in between in the layout)
      if (i + 1 < daySlots.length) {
        const slot2 = daySlots[i + 1];
        if (!slot2.isBreak && slot2.slot_type !== "BREAK" && slot2.slot_type !== "LUNCH") {
          const num1 = parseInt(slot1.slot_id.replace("TS", ""));
          const num2 = parseInt(slot2.slot_id.replace("TS", ""));
          
          let isConsecutiveWithoutBreak = false;
          if (isNaN(num1) || isNaN(num2)) {
            // Fallback for mock/test data: consecutive if they are adjacent in daySlots
            isConsecutiveWithoutBreak = true;
          } else {
            const slotNum1 = (num1 - 1) % 8 + 1; // 1 to 8
            const slotNum2 = (num2 - 1) % 8 + 1; // 1 to 8
            isConsecutiveWithoutBreak = 
              (slotNum1 === 1 && slotNum2 === 2) || 
              (slotNum1 === 6 && slotNum2 === 7);
          }
          
          if (isConsecutiveWithoutBreak) {
            possibleSlots.LAB.push({
              day,
              slots: [slot1, slot2]
            });
          }
        }
      }
    }
  }

  // Group sessions by program_id + division_id to solve division-by-division per program
  const sessionsByDiv = {};
  sessions.forEach(s => {
    const key = `${s.allocation?.program_id || 'PROG'}_${s.division_id}`;
    if (!sessionsByDiv[key]) sessionsByDiv[key] = [];
    sessionsByDiv[key].push(s);
  });

  const globalAssignments = []; // Holds all assignments across all divisions

  const isConflict = (session, day, slots, room, currentDivAssignments) => {
    // Room type constraint (bypass if no lab rooms exist in database)
    const hasLabRooms = rooms.some(r => r.isLab);
    if (session.type === "LAB" && hasLabRooms && !room.isLab) return true;

    // Check conflict against globalAssignments + currentDivAssignments
    const allAssigned = [...globalAssignments, ...currentDivAssignments];

    for (const assign of allAssigned) {
      if (assign.day === day) {
        const hasSlotOverlap = assign.slots.some(as => slots.some(s => s.slot_id === as.slot_id));
        if (hasSlotOverlap) {
          // Conflict 1: Same Room
          if (assign.room.room_no === room.room_no && assign.room.block === room.block) return true;
          // Conflict 2: Same Faculty
          if (assign.session.faculty_id && assign.session.faculty_id === session.faculty_id) return true;
          // Conflict 3: Same Division for the SAME Program
          if (assign.session.division_id === session.division_id && assign.session.allocation?.program_id === session.allocation?.program_id) return true;
        }
      }
    }

    return false;
  };

  // Solve division by division
  const unscheduled = [];
  for (const divId of Object.keys(sessionsByDiv)) {
    const divSessions = sessionsByDiv[divId];
    divSessions.sort((a, b) => b.duration - a.duration);

    let steps = 0;
    let stepLimitHit = false;
    const divAssignments = [];
    const solveDiv = (idx) => {
      if (idx >= divSessions.length) return true;
      if (++steps > MAX_SOLVER_STEPS) {
        stepLimitHit = true;
        return false;
      }

      const session = divSessions[idx];
      const candidateSlots = possibleSlots[session.type] || possibleSlots.LECTURE;

      const divisionObj = divisions.find(d => d.division_id === session.division_id);
      let preferredRoom = null;
      if (divisionObj && session.type === "LECTURE") {
        const prefRoomNo = divisionObj.preferredRoom_no;
        const prefBlock = divisionObj.preferredRoom_block;
        preferredRoom = rooms.find(
          r => r.room_no === prefRoomNo && (!prefBlock || r.block?.toUpperCase() === prefBlock?.toUpperCase())
        );
      }

      let validRooms = session.type === "LAB" 
        ? rooms.filter(r => r.isLab)
        : (preferredRoom ? [preferredRoom, ...rooms.filter(r => !r.isLab && r.room_no !== preferredRoom.room_no)] : rooms.filter(r => !r.isLab));

      if (validRooms.length === 0) validRooms = rooms;
      
      // Limit search space: preferred room first, plus max 3 fallback rooms for instant solving
      const roomsToTry = preferredRoom 
        ? [preferredRoom, ...validRooms.filter(r => r.room_no !== preferredRoom.room_no).slice(0, 3)]
        : validRooms.slice(0, 4);

      for (const cand of candidateSlots) {
        for (const room of roomsToTry) {
          if (!isConflict(session, cand.day, cand.slots, room, divAssignments)) {
            divAssignments.push({ session, day: cand.day, slots: cand.slots, room });
            if (solveDiv(idx + 1)) return true;
            divAssignments.pop();
          }
        }
      }
      return false;
    };

    if (solveDiv(0)) {
      globalAssignments.push(...divAssignments);
    } else {
      //* Backtracking pops every trial as it unwinds, so a division is scheduled whole or not at all.
      unscheduled.push({
        division: divId,
        reason: stepLimitHit ? "solver step limit exceeded" : "no conflict-free slot available",
        courseIds: [...new Set(divSessions.map(s => s.course_id))]
      });
    }
  }

  //* Refuse to return a timetable with holes in it: a silently-missing lecture is far more
  //* damaging than a loud failure the admin can act on.
  if (unscheduled.length > 0) {
    const detail = unscheduled
      .map(u => `${u.division} - ${u.reason} (courses: ${u.courseIds.join(", ")})`)
      .join("; ");
    return {
      error: `Could not build a conflict-free schedule for: ${detail}. Try adding rooms, widening the time grid, or reducing allocated hours.`
    };
  }

  // Format assignments to TimeTableEntry schema format
  return globalAssignments.flatMap(assign => {
    const baseId = `ENT-${assign.session.allocation?.semester_id || 'S001'}-${assign.session.division_id}-${assign.session.course_id}`.toUpperCase();
    return assign.slots.map((slot, idx) => ({
      entry_id: `${baseId}-${assign.day.substring(0,3).toUpperCase()}-${slot.slot_id}`,
      faculty_id: assign.session.faculty_id,
      course_id: assign.session.course_id,
      class_group: assign.session.division_id,
      semester_id: assign.session.allocation?.semester_id || "S001",
      program_id: assign.session.allocation?.program_id,
      day_of_week: assign.day,
      isLab: assign.session.type === "LAB",
      status: "scheduled",
      slot_id: slot.slot_id,
      room_no: assign.room.room_no,
      block: assign.room.block
    }));
  });
};
