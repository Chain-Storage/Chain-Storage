import express, { Request, Response, Router } from "express";
import { connectTcp } from "../controllers/tcp.controller";

const router: Router = express.Router();

router.post("/sendFile/tcpServer", connectTcp);

export default router;
