-- CreateTable
CREATE TABLE "ExerciseSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unit" TEXT NOT NULL DEFAULT 'pounds',
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExerciseSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExerciseSettings_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseSettings_userId_exerciseId_key" ON "ExerciseSettings"("userId", "exerciseId");
