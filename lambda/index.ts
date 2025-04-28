import { auth } from "@/lib/auth";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

app.on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw));

export const handler = handle(app);
