# TrueGacy Quick Start Guide

Get up and running with TrueGacy in 5 minutes!

## Prerequisites

- Node.js 18+ 
- pnpm (install via `npm install -g pnpm`)
- Supabase account (free at supabase.com)

## Step 1: Clone & Install (1 min)

```bash
# Clone the repository
git clone <repo-url>
cd truegacy

# Install dependencies
pnpm install
```

## Step 2: Set Up Supabase (2 min)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize (takes 1-2 minutes)
3. In Project Settings, find your API credentials:
   - Project URL
   - Anon Key

4. Create `.env.local` file in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Run Database Migration (1 min)

### Option A: Automatic (Recommended)
The migration runs automatically on first app startup.

### Option B: Manual
1. Open Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents from `/scripts/01-create-schema.sql`
4. Execute the query

## Step 4: Start the App (1 min)

```bash
pnpm dev
```

Visit http://localhost:3000

## Step 5: Create Your First Account (1 min)

1. Click "Get Started" on the landing page
2. Sign up with your email
3. Your account is created!

## Next: Set Your Admin Role

1. Open Supabase Dashboard
2. Go to SQL Editor → New Query
3. Run this query:

```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE id = 'YOUR_USER_ID';
```

(Get your USER_ID from the profiles table or from Supabase auth)

4. Sign out and sign back in to see admin dashboard

## Testing the System

### As Admin
1. Go to http://localhost:3000/admin
2. View dashboard statistics
3. Try creating test leads manually
4. Configure auto-assignment

### As Agent
1. Create a new account (different email)
2. Manually set role to 'agent' in Supabase profiles table
3. Go to http://localhost:3000/agent
4. Create test leads using the form
5. View them in "My Leads" tab

### As Sales Person
1. Create another account
2. Set role to 'sales'
3. Have admin assign some leads to this user
4. Go to http://localhost:3000/sales
5. See assigned leads, log activities, convert leads

### Analytics
1. Go to http://localhost:3000/analytics (as admin)
2. View all metrics and charts
3. See lead conversion rates

## Common Tasks

### Add More Users

1. **Sign up**: Each person signs up through /auth
2. **Set Role**: Admin updates their role in Supabase profiles table:
   - `agent` - Can create leads
   - `sales` - Can work on assigned leads
   - `admin` - Full system access

### Create Leads Quickly

**As Agent**:
1. Go to Agent Dashboard → Add Lead
2. Fill in Name, Email, Phone (required)
3. Add optional company/family details
4. Click "Create Lead"

### Assign Leads to Sales Team

**As Admin**:
1. Go to Admin Dashboard
2. Click "Assign" on an unassigned lead
3. Enter sales person's user ID (visible in Supabase)
4. Confirm assignment

### Auto-Assign All New Leads

**As Admin**:
1. Go to Admin Dashboard
2. Click "Auto-Assign (X)" button
3. System distributes all new leads to sales team

### Track Lead Progress

**As Sales Person**:
1. Go to Sales Dashboard
2. See all assigned leads
3. Click message icon to log activity
4. Click chart icon to create opportunity
5. Click checkmark to convert to customer

### View Analytics

**As Admin**:
1. Go to Analytics Dashboard
2. See conversion rates
3. View top performing sales people
4. Monitor lead sources
5. Check opportunity pipeline

## Database Tips

### View Your User ID

In Supabase Dashboard:
1. Go to Authentication → Users
2. Your User ID is in the first column

### Update User Roles

In Supabase Dashboard:
1. Go to SQL Editor → New Query
2. Update user role:

```sql
UPDATE profiles 
SET role = 'sales' 
WHERE email = 'user@example.com';
```

Available roles: `agent`, `sales`, `admin`, `super_admin`

### View All Leads

```sql
SELECT 
  l.id,
  ld.full_name,
  ld.email,
  l.status,
  l.assigned_to
FROM leads l
LEFT JOIN lead_details ld ON l.id = ld.lead_id;
```

### See All Activities

```sql
SELECT 
  la.activity_type,
  la.description,
  la.timestamp,
  p.full_name as user_name
FROM lead_activities la
JOIN profiles p ON la.user_id = p.id
ORDER BY la.timestamp DESC;
```

## Troubleshooting

### "Connection refused" error
- Make sure Supabase project is initialized
- Check environment variables are correct
- Restart dev server with `Ctrl+C` then `pnpm dev`

### "Table doesn't exist" error
- Migration script didn't run
- Go to Supabase SQL Editor
- Copy/paste `/scripts/01-create-schema.sql`
- Execute the query

### "Role permission denied" error
- You're logged in with wrong role
- Check your role in Supabase profiles table
- Update it if needed
- Sign out/in again

### Can't see other users' data
- That's correct! Each role sees only their own data
- Admin can see everything
- This is by design for data security

### Lead won't convert
- Lead might already be converted
- Check its current status in Admin Dashboard
- Only 'new', 'contacted', 'qualified' can convert

## Next Steps

1. **Read the docs**:
   - `SETUP_GUIDE.md` - Detailed setup instructions
   - `SYSTEM_ARCHITECTURE.md` - Technical architecture overview

2. **Customize**:
   - Update company logo in `/public/placeholder-logo.png`
   - Modify color scheme in `/app/globals.css`
   - Add custom fields in database schema

3. **Deploy**:
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables
   - Deploy!

4. **Add Features**:
   - File uploads for documents
   - Email notifications
   - SMS integration
   - Custom reports

## Key URLs

- **Home**: http://localhost:3000
- **Sign In**: http://localhost:3000/auth
- **Agent Dashboard**: http://localhost:3000/agent
- **Admin Dashboard**: http://localhost:3000/admin
- **Sales Dashboard**: http://localhost:3000/sales
- **Analytics**: http://localhost:3000/analytics

## Support

For help:
1. Check `SETUP_GUIDE.md` troubleshooting section
2. Review database schema in `SYSTEM_ARCHITECTURE.md`
3. Check Supabase documentation
4. Contact the development team

---

**You're all set!** Start by signing up as an admin and creating some test leads. Happy selling!
