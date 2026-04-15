import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import paymentsRouter from "./payments";
import contractsRouter from "./contracts";
import auditsRouter from "./audits";
import streamRouter from "./stream";
import devRouter from "./dev";
import testuiRouter from "./testui";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/payments", paymentsRouter);
router.use("/contracts", contractsRouter);
router.use("/audits", auditsRouter);
router.use("/stream", streamRouter);
router.use("/dev", devRouter);
router.use(testuiRouter);

export default router;
