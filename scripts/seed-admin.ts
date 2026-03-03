/**
 * Run with: npx tsx scripts/seed-admin.ts
 * Creates an initial super_admin user.
 * Install tsx: npm install -D tsx
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:Kayyalackakom@1994@localhost:5432/truegacy";

async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, 'super_admin')
     ON CONFLICT (email) DO NOTHING`,
    ["admin@truegacy.com", hash, "Admin User"],
  );
  console.log("Admin user created: admin@truegacy.com /", password);
  await pool.end();
}

seed().catch(console.error);
