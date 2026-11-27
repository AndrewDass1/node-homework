-- DropIndex
DROP INDEX "Task";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "priority" VARCHAR(10) NOT NULL DEFAULT 'medium';

-- RenameForeignKey
ALTER TABLE "tasks" RENAME CONSTRAINT "Task_user_id_fkey" TO "tasks_user_id_fkey";
