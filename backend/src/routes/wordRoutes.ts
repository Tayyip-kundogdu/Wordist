import { Router } from "express";
import * as wordController from "../controllers/wordController";
import { requireAuth } from "@clerk/express";

const router = Router();

// GET /api/words - Kullanıcının tüm kelimelerini getirir (Kelimelerim Sayfası)
router.get("/", requireAuth(), wordController.getAllWords);

// GET /api/words/random - Ezberlenmemiş rastgele TEK bir kelime getirir (Next butonu)
router.get("/random", requireAuth(), wordController.getRandomWord);

// POST /api/words - Yeni kelime/cümle ekler
router.post("/", requireAuth(), wordController.createWord);

// PATCH /api/words/:id/memorize - Kelimeyi 'Ezberledim' olarak işaretler
router.patch("/:id/memorize", requireAuth(), wordController.memorizeWord);

// DELETE /api/words/:id - Kelimeyi siler
router.delete("/:id", requireAuth(), wordController.deleteWord);

export default router;