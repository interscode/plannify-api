import { taskService } from "@/services/task.service";
import { Hono } from "hono";

export const task = new Hono();

task.get("/", async (c) => {
  const user_id = c.req.query("useriId");

  if (!user_id) {
    return c.text("User ID is required", 400);
  }

  try {
    const tasks = await taskService.getTasks(user_id);

    return c.json(tasks);
  } catch (error) {
    return c.text("Error fetching tasks", 500);
  }
});

task.get("/:task_id", async (c) => {
  const { task_id } = c.req.param();

  const task = await taskService.getTaskById(task_id);

  if (!task) {
    return c.text("Task not found", 404);
  }

  return c.json(task);
});

task.post("/", async (c) => {
  const { name, description, due_date, subject_id, status, user_id } =
    await c.req.json();

  const task = await taskService.createTask(
    name,
    description,
    due_date,
    subject_id,
    status,
    user_id,
  );

  return c.json(task);
});

task.put("/:task_id", async (c) => {
  const { task_id } = c.req.param();
  const { name, description, due_date, subject_id, status, user_id } =
    await c.req.json();

  await taskService.updateTask({
    task_id,
    name,
    description,
    due_date,
    subject_id,
    status,
    user_id,
  });

  return c.body(null, 204);
});

task.delete("/:task_id", async (c) => {
  const { task_id } = c.req.param();

  await taskService.deleteTask(task_id);

  return c.body(null, 204);
});
