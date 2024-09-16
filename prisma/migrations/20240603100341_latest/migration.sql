/*
  Warnings:

  - The values [PREMIUM] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `authUserId` to the `Reference` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'MANAGER', 'ADMIN');
ALTER TABLE "auth_user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "auth_user" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "auth_user" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "Reference" ADD COLUMN     "authUserId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
