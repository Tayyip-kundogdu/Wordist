import { db } from "./index";
import { eq, and, sql, notInArray } from "drizzle-orm";
import {
  users,
  words,
  userWordStates,
  type NewUser,
  type NewWord,
  type NewUserWordState,
} from "./schema";

// USER QUERIES
export const createUser = async (data: NewUser) => {
  const [user] = await db.insert(users).values(data).returning();
  return user;
};

export const getUserById = async (id: string) => {
  return db.query.users.findFirst({ where: eq(users.id, id) });
};

export const upsertUser = async (data: NewUser) => {
  const {
    id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...updateData
  } = data;

  const [user] = await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.id,
      set: updateData,
    })
    .returning();

  return user;
};

// WORD QUERIES
export const createWord = async (data: NewWord) => {
  const [word] = await db.insert(words).values(data).returning();
  return word;
};

export const getAllWords = async () => {
  return db.query.words.findMany({
    orderBy: (words, { desc }) => [desc(words.createdAt)],
  });
};

export const getWordById = async (id: string) => {
  return db.query.words.findFirst({
    where: eq(words.id, id),
  });
};

export const updateWord = async (id: string, data: Partial<NewWord>) => {
  const [updatedWord] = await db
    .update(words)
    .set(data)
    .where(eq(words.id, id))
    .returning();

  if (!updatedWord) {
    throw new Error(`Word with id ${id} not found`);
  }

  return updatedWord;
};

export const deleteWord = async (id: string) => {
  const [deletedWord] = await db
    .delete(words)
    .where(eq(words.id, id))
    .returning();

  if (!deletedWord) {
    throw new Error(`Word with id ${id} not found`);
  }

  return deletedWord;
};

// USER WORD STATE & LEARNING QUERIES

/**
 * Kullanıcı için rastgele henüz ezberlenmemiş (is_learned = false veya durumu hiç olmayan) tek bir kelime getirir.
 */
export const getRandomUnlearnedWord = async (userId: string) => {
  // 1. Kullanıcının zaten ezberlediği kelimelerin ID'lerini alıyoruz
  const learnedStates = await db
    .select({ wordId: userWordStates.wordId })
    .from(userWordStates)
    .where(
      and(
        eq(userWordStates.userId, userId),
        eq(userWordStates.isLearned, true)
      )
    );

  const learnedWordIds = learnedStates.map((s) => s.wordId);

  // 2. Ezberlenen ID'ler dışındaki kelimelerden rastgele 1 tane seçiyoruz
  const whereClause =
    learnedWordIds.length > 0
      ? notInArray(words.id, learnedWordIds)
      : undefined;

  const [randomWord] = await db
    .select()
    .from(words)
    .where(whereClause)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  return randomWord || null;
};

/**
 * Bir kelimeyi kullanıcı için "Ezberlendi" veya "Ezberlenmedi" olarak günceller / kaydeder (Upsert).
 */
export const markWordState = async (
  userId: string,
  wordId: string,
  isLearned: boolean
) => {
  const [state] = await db
    .insert(userWordStates)
    .values({
      userId,
      wordId,
      isLearned,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userWordStates.userId, userWordStates.wordId],
      set: {
        isLearned,
        updatedAt: new Date(),
      },
    })
    .returning();

  return state;
};

/**
 * Kullanıcının "Kelimelerim" sayfasında tüm kelimeleri kendi ezber durumlarıyla birlikte listelemesini sağlar.
 */
export const getUserWordsWithState = async (userId: string) => {
  return db.query.words.findMany({
    with: {
      userStates: {
        where: eq(userWordStates.userId, userId),
      },
    },
    orderBy: (words, { desc }) => [desc(words.createdAt)],
  });
};