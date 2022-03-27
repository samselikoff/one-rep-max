-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Set" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "weight" DECIMAL,
    "reps" INTEGER NOT NULL,
    "tracked" BOOLEAN NOT NULL DEFAULT false,
    "entryId" TEXT NOT NULL,
    CONSTRAINT "Set_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Set" ("createdAt", "entryId", "id", "reps", "updatedAt", "weight") SELECT "createdAt", "entryId", "id", "reps", "updatedAt", "weight" FROM "Set";
DROP TABLE "Set";
ALTER TABLE "new_Set" RENAME TO "Set";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
