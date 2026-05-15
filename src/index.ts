import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./schema";
import { usersRoute } from "./routes/users-route";
import { swagger } from "@elysiajs/swagger";

export const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: "Belajar Vibe Coding API",
        version: "1.0.0"
      }
    }
  }))
  .get("/", () => ({ message: "Hello Elysia!" }))
  .get("/users", async () => {
    return await db.select().from(users);
  })
  .use(usersRoute);

app.listen(process.env.PORT || 3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
