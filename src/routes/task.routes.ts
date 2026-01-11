// backend/src/routes/task.routes.ts
import { Router } from "express";
import { jwtAuth } from "../middleware/jwt.middleware";
import {
  createTaskValidator,
  updateTaskValidator,
  deleteTaskValidator,
  searchTasksValidator,
} from "../middleware/validation.middleware";
import {
  addTask,
  getTasks,
  updateTask,
  deleteTask,
  getCompletedTasks,
  getUrgentTasks,
  searchTasks,
} from "../controllers/task.controller";

const router = Router();

router.use(jwtAuth);

router.get("/", getTasks);
router.post("/", createTaskValidator, addTask);
router.get("/completed", getCompletedTasks);
router.get("/urgent", getUrgentTasks);
router.get("/search", searchTasksValidator, searchTasks);
router.put("/:id", updateTaskValidator, updateTask);
router.delete("/:id", deleteTaskValidator, deleteTask);

export default router;

