# Frontend-Backend Alignment Plan

## Analysis Summary

### Backend Models vs Frontend Current State

| Entity | Backend Fields | Frontend Current | Status |
|--------|---------------|------------------|--------|
| **Program** | program_id, program_name, program_duration, isActive | program_id, program_name | Missing: program_duration, isActive |
| **Course** | course_id, course_name, credit, isActive | course_id, course_name, course_duration, isActive | Wrong: course_duration should be credit |
| **Semester** | semester_id, semester_name, isEven | semester_id, semester_name, isEven | Correct |
| **Division** | division_id, division_name, description | section_name, class_id, discraption | Wrong: completely different structure |
| **Room** | room_no, floor_no, block | room_no, floor_no, wing | Wrong: wing should be block |
| **Classes** | (No Classes model in backend) | class_id, course_id, program_id, year | Remove - no backend model |
| **Subject** | (No Subject model - use SubjectAllocation) | subject_id, subject_name, credit, isActive | Needs investigation |
| **Specialization** | specialization_id, specialization_name, isActive | specilization_id, specilization_name, program_id, course_id, isActive | Wrong: extra fields |
| **Faculty** | faculty_id, faculty_name, email, phone, specialization, higher_qualification, years_of_Experience, gender, date_of_joining, date_of_birth, address, isActive | Similar but some fields optional in frontend | Needs alignment - all required in backend |
| **Student** | student_id, student_name, gender, email, class, batch, date_of_birth, phone, specialization | student_id, student_name, class, batch, specialization, email, division, date_of_birth | Wrong: missing required fields (gender, phone), extra field (division) |

### Additional Backend Models Not in Frontend
- **SubjectAllocation** - semester_id, program_id, division_id, subjectAllocation_id, ltpHours, isLab, classTeacher, academicYear, faculty_id, course_id
- **TimeSlot** - slot_id, day_of_week, startTime, endTime, slot_type, isBreak
- **Timetable** - timetable_id, semester_id, academicYear, generated_date, generatedBy, status, entries
- **TimeTableEntry** - faculty_id, course_id, entry_id, class_group, day_of_week, isLab, status, slot_id, room_no
- **QualificationType** - qualification_id, qualification_name, description

## Tasks

### Task 1: Update Admin.jsx ENTITY_CONFIG
**File:** `Client/src/pages/dashboard/Admin.jsx`

Update all entity configurations to match backend models exactly:

1. **Program** - Add program_duration field
2. **Course** - Change course_duration to credit
3. **Division** - Complete rewrite: division_id, division_name, description
4. **Room** - Change wing to block
5. **Classes** - Remove (no backend model)
6. **Specialization** - Remove program_id, course_id fields
7. **Faculty** - Make all fields required (match backend)
8. **Student** - Add gender, phone (required), remove division

### Task 2: Update adminSlice.js ENTITY_ENDPOINTS
**File:** `Client/src/store/admin/adminSlice.js`

Verify and update endpoints to match backend routes:
- Check if `/classes` endpoint exists or remove it
- Add any missing endpoints

### Task 3: Create Missing Entity Configurations
Add configurations for new entities:
- SubjectAllocation
- TimeSlot
- Timetable
- QualificationType

### Task 4: Update Form Component
**File:** `Client/src/components/deshboard/Form.jsx`

Ensure form handles all field types correctly based on backend requirements:
- Date fields for date_of_birth, date_of_joining
- Number fields for credit, years_of_Experience, program_duration
- Boolean fields for isActive, isEven, isLab

### Task 5: Update DataTable Component
**File:** `Client/src/components/deshboard/DataTable.jsx`

Update columns to display correct fields for each entity.

### Task 6: Verify API Response Handling
Ensure frontend correctly handles backend API response structure:
- Backend wraps responses in `{ success, statusCode, message, data }`
- Frontend should access `response.data.data` for actual data

## Implementation Order
1. Update ENTITY_CONFIG in Admin.jsx
2. Update adminSlice.js endpoints
3. Update Form component field handling
4. Update DataTable columns
5. Test each entity CRUD operation