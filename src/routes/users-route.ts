import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-service";
import { AppError, UnauthorizedError } from "../errors";

export const usersRoute = new Elysia({ prefix: "/api" })
  .onError(({ error, set }) => {
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
      name: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  .post("/users/login", async ({ body }) => {
    const token = await loginUser(body);
    return { data: token };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
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

