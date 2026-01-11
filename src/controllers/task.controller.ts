// backend/src/controllers/task.controller.ts
import { Response } from "express";
import { prisma } from "../config/db";
import { JWTRequest } from "../middleware/jwt.middleware";

export const addTask = async (
  req: JWTRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, deadline, is_urgent } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    console.log(`📝 Creating task for user:`, req.userEmail);

    const task = await prisma.task.create({
      data: {
        userId: req.userId,
        title: title.trim(),
        description: description?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        isUrgent: is_urgent || false,
        status: "pending",
      },
    });

    console.log("✅ Task created:", task.id);

    res.status(201).json({ 
      message: "Task created successfully", 
      task 
    });
  } catch (error) {
    console.error("❌ Add task error:", error);
    res.status(500).json({
      error: "Failed to create task",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined,
    });
  }
};

export const getTasks = async (
  req: JWTRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    console.log(`📋 Fetching tasks for user:`, req.userEmail);

    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: [
        { completed: "asc" },
        { isUrgent: "desc" },
        { createdAt: "desc" },
      ],
    });

    console.log("✅ Tasks found:", tasks.length);

    res.json({ 
      tasks, 
      count: tasks.length
    });
  } catch (error) {
    console.error("❌ Get tasks error:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const updateTask = async (
  req: JWTRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, deadline, is_urgent, completed, status } = req.body;

    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (isNaN(parseInt(id))) {
      res.status(400).json({ error: "Invalid task ID" });
      return;
    }

    const task = await prisma.task.findFirst({
      where: { 
        id: parseInt(id), 
        userId: req.userId 
      },
    });

    if (!task) {
      res.status(404).json({ 
        error: "Task not found or access denied" 
      });
      return;
    }

    console.log(`✏️ Updating task ${id} for user:`, req.userEmail);

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(deadline !== undefined && {
          deadline: deadline ? new Date(deadline) : null,
        }),
        ...(is_urgent !== undefined && { isUrgent: is_urgent }),
        ...(completed !== undefined && { completed }),
        ...(status !== undefined && { status }),
      },
    });

    console.log("✅ Task updated:", updatedTask.id);

    res.json({ 
      message: "Task updated successfully", 
      task: updatedTask 
    });
  } catch (error) {
    console.error("❌ Update task error:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (
  req: JWTRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (isNaN(parseInt(id))) {
      res.status(400).json({ error: "Invalid task ID" });
      return;
    }

    const task = await prisma.task.findFirst({
      where: { 
        id: parseInt(id), 
        userId: req.userId 
      },
    });

    if (!task) {
      res.status(404).json({ 
        error: "Task not found or access denied" 
      });
      return;
    }

    console.log(`🗑️ Deleting task ${id} for user:`, req.userEmail);

    await prisma.task.delete({ 
      where: { id: parseInt(id) } 
    });

    console.log("✅ Task deleted:", id);

    res.json({ 
      message: "Task deleted successfully",
      deletedId: parseInt(id)
    });
  } catch (error) {
    console.error("❌ Delete task error:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};

export const getCompletedTasks = async (
  req: JWTRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    console.log(`✅ Fetching completed tasks for user:`, req.userEmail);

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        completed: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    console.log("✅ Completed tasks found:", tasks.length);

    res.json({ 
      tasks, 
      count: tasks.length 
    });
  } catch (error) {
    console.error("❌ Get completed tasks error:", error);
    res.status(500).json({ error: "Failed to fetch completed tasks" });
  }
};

export const getUrgentTasks = async (
  req: JWTRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    console.log(`🔥 Fetching urgent tasks for user:`, req.userEmail);

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        isUrgent: true,
      },
      orderBy: [
        { completed: "asc" },
        { createdAt: "desc" },
      ],
    });

    console.log("✅ Urgent tasks found:", tasks.length);

    res.json({ 
      tasks, 
      count: tasks.length 
    });
  } catch (error) {
    console.error("❌ Get urgent tasks error:", error);
    res.status(500).json({ error: "Failed to fetch urgent tasks" });
  }
};

export const searchTasks = async (
  req: JWTRequest,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!req.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!q || typeof q !== "string" || !q.trim()) {
      res.status(400).json({ error: "Search query is required" });
      return;
    }

    console.log(`🔍 Searching tasks for user:`, req.userEmail, "query:", q);

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        OR: [
          { title: { contains: q.trim(), mode: "insensitive" } },
          { description: { contains: q.trim(), mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("✅ Search results:", tasks.length);

    res.json({ 
      tasks, 
      count: tasks.length, 
      query: q.trim() 
    });
  } catch (error) {
    console.error("❌ Search tasks error:", error);
    res.status(500).json({ error: "Failed to search tasks" });
  }
};