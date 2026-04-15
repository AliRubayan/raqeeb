import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";

const PgStore = connectPgSimple(session);

if (!process.env["SESSION_SECRET"]) {
  throw new Error("SESSION_SECRET environment variable is required.");
}

export const sessionMiddleware = session({
  store: new PgStore({
    pool,
    tableName: "user_sessions",
    createTableIfMissing: true,
  }),
  secret: process.env["SESSION_SECRET"],
  resave: false,
  saveUninitialized: false,
  name: "raqeeb_session",
  cookie: {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "lax",
  },
});

declare module "express-session" {
  interface SessionData {
    userId: string;
    email: string;
  }
}
