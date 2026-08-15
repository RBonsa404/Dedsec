@echo off
REM Database connection string
set DATABASE_URL=postgresql://neondb_owner:npg_AcnaWUfJ5X3x@ep-sweet-violet-b233stio.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require

REM Run the initialization script
cd backend
npx ts-node prisma/init-admin.ts