
import { db } from "./db";
import {
  attempts,
  type InsertAttempt,
  type Attempt
} from "@shared/schema";

export interface IStorage {
  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  getAttempts(): Promise<Attempt[]>;
}

export class DatabaseStorage implements IStorage {
  async createAttempt(attempt: InsertAttempt): Promise<Attempt> {
    const [newAttempt] = await db
      .insert(attempts)
      .values(attempt)
      .returning();
    return newAttempt;
  }

  async getAttempts(): Promise<Attempt[]> {
    return await db.select().from(attempts).orderBy(attempts.completedAt);
  }
}

export const storage = new DatabaseStorage();
