import { Router } from "express";
import { deleteStudent, getAllStudents, getStudentById, registerStudent, updateStudent } from "../controllers/student.controller.js";

const router = Router();

router.route('/').post(registerStudent).get(getAllStudents);
router.route('/:id').get(getStudentById).delete(deleteStudent).patch(updateStudent);


export default router;