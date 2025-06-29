-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "wallet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Circle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetAmount" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "fixedAmount" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "transactionHash" TEXT,
    "ownerId" TEXT NOT NULL,
    "onChainId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Circle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "circleId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CircleInvitation" (
    "id" TEXT NOT NULL,
    "circleId" INTEGER NOT NULL,
    "inviterEmail" TEXT NOT NULL,
    "inviteeEmail" TEXT,
    "inviteeWalletAddress" TEXT,
    "inviteType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "acceptedByEmail" TEXT,
    "acceptedByWalletAddress" TEXT,

    CONSTRAINT "CircleInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CircleMembers" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CircleMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_key" ON "User"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE INDEX "CircleInvitation_inviteeEmail_idx" ON "CircleInvitation"("inviteeEmail");

-- CreateIndex
CREATE INDEX "CircleInvitation_inviteeWalletAddress_idx" ON "CircleInvitation"("inviteeWalletAddress");

-- CreateIndex
CREATE INDEX "CircleInvitation_circleId_idx" ON "CircleInvitation"("circleId");

-- CreateIndex
CREATE INDEX "_CircleMembers_B_index" ON "_CircleMembers"("B");

-- AddForeignKey
ALTER TABLE "Circle" ADD CONSTRAINT "Circle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircleInvitation" ADD CONSTRAINT "CircleInvitation_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CircleMembers" ADD CONSTRAINT "_CircleMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Circle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CircleMembers" ADD CONSTRAINT "_CircleMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
