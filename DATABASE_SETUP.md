# PostgreSQL Database Setup (pgAdmin)

This project uses PostgreSQL instead of Supabase. Follow these steps to connect your own database.

## 1. Create the database in pgAdmin

1. Open **pgAdmin** and connect to your PostgreSQL server
2. Right-click **Databases** → **Create** → **Database**
3. Name it `truegacy` (or any name - update `DATABASE_URL` accordingly)

## 2. Run the schema

1. In pgAdmin, select your database
2. Open **Query Tool** (Tools → Query Tool)
3. Open and run the file: `scripts/schema.sql`

## 3. Configure environment variables

Update `.env.local`:

```env
# Your PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/truegacy

# Generate a random string for production (e.g. openssl rand -base64 32)
JWT_SECRET=your-secret-key-change-in-production
```

## 4. Create the first admin user

```bash
# Set your admin password (optional, defaults to "admin123")
$env:ADMIN_PASSWORD="your-secure-password"

# Install tsx if not already: npm install -D tsx
npx tsx scripts/seed-admin.ts
```

Or manually in pgAdmin:

```sql
-- Install uuid-ossp first: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hash for "admin123" - replace with your own bcrypt hash
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'admin@truegacy.com',
  '$2a$10$rQZ5Y5Z5Z5Z5Z5Z5Z5Z5ZuKpXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
  'Admin User',
  'super_admin'
);
```

Use an online bcrypt generator or the seed script above to create a proper hash.

## 5. Run the app

```bash
npm run dev
```

Sign in at `/auth` with the admin credentials.
