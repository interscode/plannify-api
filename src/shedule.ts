import { sheduleService } from "@/services/shedule.service";
import { Hono } from "hono";

export const shedule = new Hono();

shedule.get("/", async (c) => {
  const user_id = c.req.query("userId");

  if (!user_id) {
    return c.json({ error: "userId is required" }, 400);
  }

  const shedules = await sheduleService.getSchedule(user_id);

  return c.json(shedules);
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
