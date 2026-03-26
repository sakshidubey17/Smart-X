import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { suggestPosts } from "../controllers/suggest.controller.js";

const router = express.Router();

router.post("/", protectRoute, suggestPosts);

export default router;