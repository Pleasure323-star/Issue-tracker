-- DropIndex
DROP INDEX "Bug_description_trgm_idx";

-- DropIndex
DROP INDEX "Bug_title_trgm_idx";

-- AlterTable
ALTER TABLE "IssueInterest" ALTER COLUMN "note" SET DATA TYPE TEXT;
