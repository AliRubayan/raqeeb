import { Router } from "express";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser, findUserById } from "../repositories/users";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const existing = await findUserByEmail(email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({
    email: email.toLowerCase(),
    passwordHash,
    hasActiveSubscription: false,
  });

  req.session.userId = user.id;
  req.session.email = user.email;

  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      hasActiveSubscription: user.hasActiveSubscription,
      createdAt: user.createdAt,
    },
    message: "Account created successfully",
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await findUserByEmail(email.toLowerCase());
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.userId = user.id;
  req.session.email = user.email;

  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      hasActiveSubscription: user.hasActiveSubscription,
      createdAt: user.createdAt,
    },
    message: "Logged in successfully",
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await findUserById(req.session.userId!);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    hasActiveSubscription: user.hasActiveSubscription,
    createdAt: user.createdAt,
  });
});

router.post("/logout", requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to logout" });
      return;
    }
    res.clearCookie("raqeeb_session");
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
