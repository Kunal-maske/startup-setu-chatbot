# Database Migrations

This directory contains SQL migration scripts for the Startup Setu application.

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com
2. Open your Startup Setu project
3. Navigate to **SQL Editor** in the sidebar
4. Create a new query
5. Copy the contents of the migration file (e.g., `001_add_password_hash.sql`)
6. Paste into the SQL editor
7. Click **Run**

### Option 2: Command Line (using Supabase CLI)
```bash
supabase db push
```

## Migrations

### 001_add_password_hash.sql
**Status:** To be applied  
**Description:** Adds `password_hash` column to the `users` table to support password-based authentication  
**Changes:**
- Adds `password_hash TEXT` column to `users` table
- Default value is NULL (for backward compatibility with existing email-only accounts)

**Apply this before testing password login feature.**
