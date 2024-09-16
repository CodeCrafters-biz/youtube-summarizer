-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email_gpt_name" TEXT NOT NULL,
    "authUserId" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Companies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Companies_AB_unique" ON "_Companies"("A", "B");

-- CreateIndex
CREATE INDEX "_Companies_B_index" ON "_Companies"("B");

-- AddForeignKey
ALTER TABLE "_Companies" ADD CONSTRAINT "_Companies_A_fkey" FOREIGN KEY ("A") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Companies" ADD CONSTRAINT "_Companies_B_fkey" FOREIGN KEY ("B") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
