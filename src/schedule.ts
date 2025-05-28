import { scanShedule } from "@/lib/textract";
import { InputSubject } from "@/lib/types";
import { sheduleService } from "@/services/schedule.service";
import { subjectService } from "@/services/subject.service";
import { Hono } from "hono";

export const shedule = new Hono();

shedule.get("/", async (c) => {
  const user_id = c.req.query("userId");

  if (!user_id) {
    return c.json({ error: "userId is required" }, 400);
  }

  const shedules = await sheduleService.getSchedule(user_id);

  if (shedules.length === 0) {
    return c.json({ error: "Schedule not found" }, 404);
  }

  return c.json(shedules);
});

shedule.post("/scan", async (c) => {
  const body = await c.req.parseBody();

  if (!body) {
    console.log("No body");
    return c.json({ error: "Invalid request body" }, 400);
  }

  const image = body["file"];
  const userId = body["userId"] as string;

  console.log(image);

  if (typeof image === "string") {
    return c.json({ error: "Image must be a file" }, 400);
  }

  if (!image) {
    return c.json({ error: "Image is required" }, 400);
  }

  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  console.log(image);

  try {
    const ocrResult: InputSubject[] = await scanShedule(image);

    const subjects = await subjectService.addSubjectsToSchedule(
      ocrResult,
      userId,
    );

    await sheduleService.createSchedule(
      new Date().toISOString(),
      "",
      subjects?.map((subject) => subject.subject_id) || [],
      userId,
    );

    return c.json(subjects, 201);
  } catch (error) {
    console.error("Error processing OCR:", error);
    return c.json({ error: "Failed to process OCR" }, 500);
  }
});

shedule.post("/", async (c) => {
  const { start_time, end_time, subjects_ids, user_id } = await c.req.json();

  const schedule = await sheduleService.createSchedule(
    start_time,
    end_time,
    subjects_ids,
    user_id,
  );

  return c.json(schedule);
});

shedule.put("/:shedule_id", async (c) => {
  const { shedule_id } = c.req.param();
  const { start_time, end_time, subjects_ids, user_id } = await c.req.json();

  await sheduleService.updateSchedule(
    shedule_id,
    start_time,
    end_time,
    subjects_ids,
    user_id,
  );

  return c.body(null, 204);
});

shedule.delete("/:shedule_id", async (c) => {
  const { shedule_id } = c.req.param();

  await sheduleService.deleteSchedule(shedule_id);

  return c.body(null, 204);
});
