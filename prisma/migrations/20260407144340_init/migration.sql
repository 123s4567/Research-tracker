-- CreateEnum
CREATE TYPE "Division" AS ENUM ('A', 'B');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('Respondent', 'NonResp', 'CrossDiv');

-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('Proposed', 'InReview', 'Active', 'Completed', 'OnHold');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "ApproverType" AS ENUM ('Coordinator', 'Dean', 'Faculty');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('NotStarted', 'InProgress', 'Completed', 'Overdue');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('Active', 'Inactive', 'Graduated', 'Withdrawn');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('GroupCreated', 'StatusChanged', 'MilestoneAlert', 'ApprovalNeeded', 'Comment', 'Custom');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED', 'FACULTY_SWAPPED', 'STUDENT_MOVED', 'APPROVAL_CHANGED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Student', 'Faculty', 'Coordinator', 'Admin');

-- CreateTable
CREATE TABLE "ResearchGroup" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "division" "Division" NOT NULL,
    "type" "GroupType" NOT NULL,
    "status" "GroupStatus" NOT NULL DEFAULT 'Proposed',
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'Pending',
    "approvalDate" TIMESTAMP(3),
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "successScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionPercent" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetEndDate" TIMESTAMP(3),
    "facultyId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "prn" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "division" "Division" NOT NULL,
    "roll" INTEGER NOT NULL,
    "semester" TEXT NOT NULL DEFAULT 'II',
    "academicYear" TEXT NOT NULL DEFAULT '2025-26',
    "skills" TEXT[],
    "interests" TEXT[],
    "gpa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "StudentStatus" NOT NULL DEFAULT 'Active',
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "title" TEXT,
    "maxGroups" INTEGER NOT NULL DEFAULT 6,
    "preferredDomains" TEXT[],
    "availability" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPublications" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "color" TEXT,
    "groupCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completionDate" TIMESTAMP(3),
    "status" "MilestoneStatus" NOT NULL DEFAULT 'NotStarted',
    "completionPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "facultyId" TEXT,
    "approverType" "ApproverType" NOT NULL,
    "approverName" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'Pending',
    "comments" TEXT,
    "approvalDate" TIMESTAMP(3),
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "studentId" TEXT,
    "facultyId" TEXT,
    "content" TEXT NOT NULL,
    "mentions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "groupId" TEXT,
    "studentId" TEXT,
    "facultyId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeLog" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "changeType" "ChangeType" NOT NULL,
    "details" JSONB NOT NULL,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'Student',
    "name" TEXT NOT NULL,
    "linkedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResearchGroup_groupId_key" ON "ResearchGroup"("groupId");

-- CreateIndex
CREATE INDEX "ResearchGroup_facultyId_idx" ON "ResearchGroup"("facultyId");

-- CreateIndex
CREATE INDEX "ResearchGroup_domainId_idx" ON "ResearchGroup"("domainId");

-- CreateIndex
CREATE INDEX "ResearchGroup_status_idx" ON "ResearchGroup"("status");

-- CreateIndex
CREATE INDEX "ResearchGroup_division_idx" ON "ResearchGroup"("division");

-- CreateIndex
CREATE UNIQUE INDEX "Student_prn_key" ON "Student"("prn");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_groupId_idx" ON "Student"("groupId");

-- CreateIndex
CREATE INDEX "Student_prn_idx" ON "Student"("prn");

-- CreateIndex
CREATE INDEX "Student_division_idx" ON "Student"("division");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_name_key" ON "Faculty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_email_key" ON "Faculty"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_name_key" ON "Domain"("name");

-- CreateIndex
CREATE INDEX "Milestone_groupId_idx" ON "Milestone"("groupId");

-- CreateIndex
CREATE INDEX "Milestone_dueDate_idx" ON "Milestone"("dueDate");

-- CreateIndex
CREATE INDEX "Milestone_status_idx" ON "Milestone"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_groupId_name_key" ON "Milestone"("groupId", "name");

-- CreateIndex
CREATE INDEX "Approval_groupId_idx" ON "Approval"("groupId");

-- CreateIndex
CREATE INDEX "Approval_status_idx" ON "Approval"("status");

-- CreateIndex
CREATE INDEX "Comment_groupId_idx" ON "Comment"("groupId");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_studentId_isRead_idx" ON "Notification"("studentId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_facultyId_isRead_idx" ON "Notification"("facultyId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "ChangeLog_groupId_idx" ON "ChangeLog"("groupId");

-- CreateIndex
CREATE INDEX "ChangeLog_createdAt_idx" ON "ChangeLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_domain_key" ON "Organization"("domain");

-- AddForeignKey
ALTER TABLE "ResearchGroup" ADD CONSTRAINT "ResearchGroup_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchGroup" ADD CONSTRAINT "ResearchGroup_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ResearchGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ResearchGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ResearchGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ResearchGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ResearchGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeLog" ADD CONSTRAINT "ChangeLog_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ResearchGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
