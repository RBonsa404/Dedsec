#!/bin/bash

# Database connection string
DATABASE_URL="postgresql://neondb_owner:npg_AcnaWUfJ5X3x@ep-sweet-violet-b233stio.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Set environment variable
export DATABASE_URL="$DATABASE_URL"

# Run the initialization script
cd backend
npx ts-node prisma/init-admin.ts