import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./schema";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .get("/", () => ({ message: "Hello Elysia!" }))
  .get("/users", async () => {
    return await db.select().from(users);
  })
  .use(usersRoute);

app.listen(process.env.PORT || 3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
