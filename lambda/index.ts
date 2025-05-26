import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { shedule } from "@/src/shedule";
import { subject } from "@/src/subject";
import { task } from "@/src/task";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

app.route("/schedules", shedule);

app.route("/subjects", subject);

app.route("/tasks", task);

//export const handler = handle(app);

export default app;
