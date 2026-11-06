-- DropForeignKey
ALTER TABLE IF EXISTS "CreditLog" DROP CONSTRAINT IF EXISTS "CreditLog_skillId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "CreditLog" DROP CONSTRAINT IF EXISTS "CreditLog_userId_fkey";

-- AlterTable
ALTER TABLE IF EXISTS "Challenge" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'open';

-- AlterTable
ALTER TABLE IF EXISTS "StudentSkill" DROP COLUMN IF EXISTS "credits",
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE IF EXISTS "Submission" ADD COLUMN IF NOT EXISTS "hiringStatus" TEXT NOT NULL DEFAULT 'pending';

-- DropTable
DROP TABLE IF EXISTS "CreditLog";
