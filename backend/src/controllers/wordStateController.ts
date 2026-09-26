import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

// Bir kelimenin mevcut ezber durumunu getirir (opsiyonel, tek kelime için)
export const getWordState = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { wordId } = req.params;

    const word = await queries.getWordById(wordId as string);
    if (!word || word.userId !== userId) {
      res.status(404).json({ error: "Word not found or unauthorized" });
      return;
    }

    // Not: queries.ts içinde tek kelime için ayrı bir "getWordState" fonksiyonu yok.
    // Gerekirse queries.ts'e userWordStates tablosundan tek satır çeken bir fonksiyon eklenebilir.
    // Şimdilik kelimenin kendisini döndürüyoruz.
    res.status(200).json(word);
  } catch (error) {
    console.error("Error getting word state:", error);
    res.status(500).json({ error: "Failed to get word state" });
  }
};

// Kelimenin ezber durumunu (isLearned) doğrudan body'den gelen değerle set eder
// Body: { "isLearned": true } veya { "isLearned": false }
export const setWordState = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { wordId } = req.params;
    const { isLearned } = req.body;

    if (typeof isLearned !== "boolean") {
      res.status(400).json({ error: "isLearned must be a boolean" });
      return;
    }

    // queries.ts içindeki markWordState fonksiyonu, kelimenin bu kullanıcıya
    // ait olup olmadığını kendi içinde zaten kontrol ediyor.
    const updatedState = await queries.markWordState(
      userId,
      wordId as string,
      isLearned
    );

    res.status(200).json(updatedState);
  } catch (error: any) {
    console.error("Error setting word state:", error);

    if (error.message === "Word not found or unauthorized") {
      res.status(404).json({ error: "Word not found or unauthorized" });
      return;
    }

    res.status(500).json({ error: "Failed to set word state" });
  }
};

// Kısayol: Kelimeyi "ezberlenmedi" olarak geri işaretler (Geri Al butonu için)
export const unlearnWord = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { wordId } = req.params;

    const updatedState = await queries.markWordState(
      userId,
      wordId as string,
      false
    );

    res.status(200).json(updatedState);
  } catch (error: any) {
    console.error("Error unlearning word:", error);

    if (error.message === "Word not found or unauthorized") {
      res.status(404).json({ error: "Word not found or unauthorized" });
      return;
    }

    res.status(500).json({ error: "Failed to unlearn word" });
  }
};