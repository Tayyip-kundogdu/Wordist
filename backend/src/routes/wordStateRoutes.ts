import { Router } from "express";
import * as wordStateController from "../controllers/wordStateController";
import { requireAuth } from "@clerk/express";

const router = Router();

// GET /api/word-states/:wordId - Bir kelimenin ezber durumunu getirir
router.get("/:wordId", requireAuth(), wordStateController.getWordState);

// PATCH /api/word-states/:wordId - Kelimenin ezber durumunu (isLearned) body ile set eder
router.patch("/:wordId", requireAuth(), wordStateController.setWordState);

// PATCH /api/word-states/:wordId/unlearn - Kelimeyi tekrar "ezberlenmedi" yapar
router.patch("/:wordId/unlearn", requireAuth(), wordStateController.unlearnWord);

export default router;