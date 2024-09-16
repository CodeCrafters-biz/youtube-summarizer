-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'PREMIUM', 'ADMIN');

-- CreateTable
CREATE TABLE "ProjectType" (
    "id" TEXT NOT NULL,
    "name_fi" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,

    CONSTRAINT "ProjectType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name_fi" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessLine" (
    "id" TEXT NOT NULL,
    "name_fi" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,

    CONSTRAINT "BusinessLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name_fi" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "numeric" TEXT NOT NULL,
    "alpha2" TEXT NOT NULL,
    "alpha3" TEXT NOT NULL,
    "test" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "searchCriteria" JSONB NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" TEXT NOT NULL,
    "description_fi" TEXT,
    "description_en" TEXT,
    "projectNumber" TEXT,
    "projectValue" TEXT,
    "language" TEXT,
    "clientContact" TEXT,
    "comments" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "receiveEmail" BOOLEAN NOT NULL DEFAULT true,
    "token" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "auth_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "active_expires" BIGINT NOT NULL,
    "idle_expires" BIGINT NOT NULL,

    CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_key" (
    "id" TEXT NOT NULL,
    "hashed_password" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "auth_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectTypeToReference" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ClientToReference" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BusinessLineToReference" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CountryToReference" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PeopleReferences" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ProjectManagers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_email_key" ON "auth_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_token_key" ON "auth_user"("token");

-- CreateIndex
CREATE INDEX "auth_session_user_id_idx" ON "auth_session"("user_id");

-- CreateIndex
CREATE INDEX "auth_key_user_id_idx" ON "auth_key"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectTypeToReference_AB_unique" ON "_ProjectTypeToReference"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectTypeToReference_B_index" ON "_ProjectTypeToReference"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClientToReference_AB_unique" ON "_ClientToReference"("A", "B");

-- CreateIndex
CREATE INDEX "_ClientToReference_B_index" ON "_ClientToReference"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BusinessLineToReference_AB_unique" ON "_BusinessLineToReference"("A", "B");

-- CreateIndex
CREATE INDEX "_BusinessLineToReference_B_index" ON "_BusinessLineToReference"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CountryToReference_AB_unique" ON "_CountryToReference"("A", "B");

-- CreateIndex
CREATE INDEX "_CountryToReference_B_index" ON "_CountryToReference"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PeopleReferences_AB_unique" ON "_PeopleReferences"("A", "B");

-- CreateIndex
CREATE INDEX "_PeopleReferences_B_index" ON "_PeopleReferences"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectManagers_AB_unique" ON "_ProjectManagers"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectManagers_B_index" ON "_ProjectManagers"("B");

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_key" ADD CONSTRAINT "auth_key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectTypeToReference" ADD CONSTRAINT "_ProjectTypeToReference_A_fkey" FOREIGN KEY ("A") REFERENCES "ProjectType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectTypeToReference" ADD CONSTRAINT "_ProjectTypeToReference_B_fkey" FOREIGN KEY ("B") REFERENCES "Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientToReference" ADD CONSTRAINT "_ClientToReference_A_fkey" FOREIGN KEY ("A") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientToReference" ADD CONSTRAINT "_ClientToReference_B_fkey" FOREIGN KEY ("B") REFERENCES "Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessLineToReference" ADD CONSTRAINT "_BusinessLineToReference_A_fkey" FOREIGN KEY ("A") REFERENCES "BusinessLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessLineToReference" ADD CONSTRAINT "_BusinessLineToReference_B_fkey" FOREIGN KEY ("B") REFERENCES "Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToReference" ADD CONSTRAINT "_CountryToReference_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToReference" ADD CONSTRAINT "_CountryToReference_B_fkey" FOREIGN KEY ("B") REFERENCES "Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PeopleReferences" ADD CONSTRAINT "_PeopleReferences_A_fkey" FOREIGN KEY ("A") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PeopleReferences" ADD CONSTRAINT "_PeopleReferences_B_fkey" FOREIGN KEY ("B") REFERENCES "Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectManagers" ADD CONSTRAINT "_ProjectManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectManagers" ADD CONSTRAINT "_ProjectManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
