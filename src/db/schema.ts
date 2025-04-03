import { text, varchar, pgTable } from "drizzle-orm/pg-core";

export const portraits = pgTable("portraits", {
  address: varchar("address", { length: 42 }).primaryKey(),
  imageUrl: text("image_url").notNull(),
  prompt: text("prompt"),
  createdAt: text("created_at").default(new Date().toISOString()).notNull(),
  updatedAt: text("updated_at").default(new Date().toISOString()).notNull(),
});