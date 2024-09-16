/*
  Warnings:

  - You are about to drop the column `authUserId` on the `Reference` table. All the data in the column will be lost.
  - The `projectValue` column on the `Reference` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `createdBy` to the `Reference` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reference" DROP CONSTRAINT "Reference_authUserId_fkey";

-- AlterTable
ALTER TABLE "Reference" DROP COLUMN "authUserId",
ADD COLUMN     "createdBy" TEXT NOT NULL,
DROP COLUMN "projectValue",
ADD COLUMN     "projectValue" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
