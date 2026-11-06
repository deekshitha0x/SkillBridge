-- CreateIndex
CREATE UNIQUE INDEX "Submission_userId_challengeId_key" ON "Submission"("userId", "challengeId");

