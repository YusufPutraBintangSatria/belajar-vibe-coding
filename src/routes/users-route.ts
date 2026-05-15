import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-service";
import { AppError, UnauthorizedError } from "../errors";

export const usersRoute = new Elysia({ prefix: "/api" })
  .onError(({ error, set, code }) => {
    if (code === 'VALIDATION') {
      set.status = 400;
      return { error: error.message };
    }
    if (error instanceof AppError) {
      set.status = error.status;
      return { error: error.message };
    }
    console.error(error);
    set.status = 500;
    return { error: "Internal Server Error" };
  })
  .post("/users", async ({ body }) => {
    await registerUser(body);
    return { data: "OK" };
  }, {
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ maxLength: 255 }),
      password: t.String({ maxLength: 255 })
    })
  })
  .post("/users/login", async ({ body }) => {
    const token = await loginUser(body);
    return { data: token };
  }, {
    body: t.Object({
      email: t.String({ maxLength: 255 }),
      password: t.String({ maxLength: 255 })
    })
  })
  .derive(({ headers }) => {
    const authHeader = headers['authorization'];
    return {
      token: (authHeader && authHeader.startsWith('Bearer ')) 
        ? authHeader.split(' ')[1] 
        : null
    };
  })
  .post("/users/current", async ({ token }) => {
    if (!token) throw new UnauthorizedError();
    const user = await getCurrentUser(token);
    return { data: user };
  })
  .delete("/users/logout", async ({ token }) => {
    if (!token) throw new UnauthorizedError();
    await logoutUser(token);
    return { data: "OK" };
  });

