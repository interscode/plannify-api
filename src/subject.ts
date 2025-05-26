import { subjectService } from "@/services/subject.service";
import { Hono } from "hono";

export const subject = new Hono();

subject.get("/", async (c) => {
  const user_id = c.req.query("userId");

  if (!user_id) {
    return c.text("User ID is required", 400);
  }

  const subjects = await subjectService.getSubjects(user_id);

  return c.json(subjects);
});

subject.get("/:subject_id", async (c) => {
  const { subject_id } = c.req.param();

  const subject = await subjectService.getSubjectById(subject_id);

  if (!subject) {
    return c.text("Subject not found", 404);
  }

  return c.json(subject);
});

subject.post("/", async (c) => {
  const {
    name,
    teacher,
    classroom,
    color,
    emoji,
    day,
    start_time,
    end_time,
    tasks_ids,
    user_id,
  } = await c.req.json();

  const subject = await subjectService.createSubject(
    name,
    teacher,
    classroom,
    color,
    emoji,
    day,
    start_time,
    end_time,
    tasks_ids,
    user_id,
  );

  return c.json(subject);
});

subject.put("/:subject_id", async (c) => {
  const { subject_id } = c.req.param();
  const {
    name,
    teacher,
    classroom,
    color,
    emoji,
    day,
    start_time,
    end_time,
    tasks_ids,
    user_id,
  } = await c.req.json();

  await subjectService.updateSubject(
    subject_id,
    name,
    teacher,
    classroom,
    color,
    emoji,
    day,
    start_time,
    end_time,
    tasks_ids,
    user_id,
  );

  return c.body(null, 204);
});

subject.delete("/:subject_id", async (c) => {
  const { subject_id } = c.req.param();

  await subjectService.deleteSubject(subject_id);

  return c.body(null, 204);
});
