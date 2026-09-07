import { relations } from "drizzle-orm";
import { pgTable, text, boolean, timestamp, uuid, primaryKey } from "drizzle-orm/pg-core";

// 1. KULLANICILAR
export const users = pgTable("users", {
  id: text("id").primaryKey(), // clerkId
  email: text("email").notNull().unique(),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// 2. KELİMELER
export const words = pgTable("words", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  word: text("word").notNull(),
  translation: text("translation"),
  sentence: text("sentence"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// 3. ÖĞRENME DURUMLARI
export const userWordStates = pgTable(
  "user_word_states",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wordId: uuid("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    isLearned: boolean("is_learned").default(false).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.wordId] })
  ]
);

// --- İLİŞKİLER (RELATIONS) ---

export const usersRelations = relations(users, ({ many }) => ({
  words: many(words),
  wordStates: many(userWordStates),
}));

export const wordsRelations = relations(words, ({ one, many }) => ({
  user: one(users, {
    fields: [words.userId],
    references: [users.id],
  }),
  userStates: many(userWordStates),
}));

export const userWordStatesRelations = relations(userWordStates, ({ one }) => ({
  user: one(users, {
    fields: [userWordStates.userId],
    references: [users.id],
  }),
  word: one(words, {
    fields: [userWordStates.wordId],
    references: [words.id],
  }),
}));

// --- TYPE INFERENCE ---

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Word = typeof words.$inferSelect;
export type NewWord = typeof words.$inferInsert;

export type UserWordState = typeof userWordStates.$inferSelect;
export type NewUserWordState = typeof userWordStates.$inferInsert;