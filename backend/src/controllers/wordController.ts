import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

// Get all words for the current user with learning state (Kelimelerim Sayfası)
export const getAllWords = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // queries.ts dosyasındaki fonksiyon adı: getUserWordsWithState
    const words = await queries.getUserWordsWithState(userId);
    res.status(200).json(words);
  } catch (error) {
    console.error("Error getting words:", error);
    res.status(500).json({ error: "Failed to get words" });
  }
};

// Get a random unlearned word (Next / Rastgele Kelime Getir)
export const getRandomWord = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // queries.ts dosyasındaki fonksiyon adı: getRandomUnlearnedWord
    const randomWord = await queries.getRandomUnlearnedWord(userId);

    if (!randomWord) {
      res.status(404).json({ message: "No unlearned words left!" });
      return;
    }

    res.status(200).json(randomWord);
  } catch (error) {
    console.error("Error getting random word:", error);
    res.status(500).json({ error: "Failed to get random word" });
  }
};

// Create new word
export const createWord = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Şemanızdaki alan adları: word, translation, sentence
    const { word, translation, sentence } = req.body;

    if (!word || !translation) {
      res.status(400).json({ error: "Word and translation are required" });
      return;
    }

    const newWord = await queries.createWord({
      word,
      translation,
      sentence,
      userId,
    });

    res.status(201).json(newWord);
  } catch (error) {
    console.error("Error creating word:", error);
    res.status(500).json({ error: "Failed to create word" });
  }
};

// Mark word as learned (Ezberledim Butonu)
export const memorizeWord = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // queries.ts içindeki markWordState(userId, wordId, isLearned) fonksiyonu çağrılıyor.
    // Bu fonksiyon kelimenin kullanıcıya aitliğini kendi içinde de kontrol eder.
    const updatedState = await queries.markWordState(userId, id as string, true);

    res.status(200).json(updatedState);
  } catch (error: any) {
    console.error("Error memorizing word:", error);

    if (error.message === "Word not found or unauthorized") {
      res.status(404).json({ error: "Word not found or unauthorized" });
      return;
    }

    res.status(500).json({ error: "Failed to memorize word" });
  }
};

// Delete word
export const deleteWord = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const existingWord = await queries.getWordById(id as string);
    if (!existingWord) {
      res.status(404).json({ error: "Word not found" });
      return;
    }

    if (existingWord.userId !== userId) {
      res.status(403).json({ error: "You can only delete your own words" });
      return;
    }

    await queries.deleteWord(id as string);
    res.status(200).json({ message: "Word deleted successfully" });
  } catch (error) {
    console.error("Error deleting word:", error);
    res.status(500).json({ error: "Failed to delete word" });
  }
};