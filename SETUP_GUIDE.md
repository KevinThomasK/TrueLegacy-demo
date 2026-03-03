# TrueGacy Lead Management System - Setup Guide

## Overview

TrueGacy is a comprehensive lead management platform designed for managing sales leads with role-based access control, auto-assignment capabilities, activity tracking, and advanced analytics.

## Features

### Core Features
- **Lead Management**: Capture and manage leads with comprehensive details including contact info, company details, family information, and documents
- **Role-Based Access Control**: Three user roles with specific permissions (Agents, Sales Team, Admin)
- **Auto-Assignment**: Round-robin lead distribution to sales team members
- **Activity Tracking**: Log calls, emails, meetings, and notes with full history
- **Opportunity Tracking**: Track deal values, stages, and conversion probability
- **Lead Conversion**: Convert qualified leads to customers with opportunity tracking
- **Analytics & Reporting**: Track conversion rates by source, sales performance, and pipeline metrics

### User Roles & Permissions

#### Agent
- Create and manage own leads
- View lead creation history
- Export own lead data

#### Sales Team
- View assigned leads
- Log activities (calls, emails, meetings, notes)
- Update lead status
- Create opportunities
- Convert leads to customers
- Track lead details and family information

#### Admin / Super Admin
- View all leads across the system
- Manually assign leads to sales team members
- Configure and enable auto-assignment rules
- View comprehensive analytics and reports
- Monitor sales team performance
- Access all system settings

## Technical Stack

- **Frontend**: Next.js 16 with React 19
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Charts**: Recharts for analytics visualization
- **API**: Next.js API Routes with JWT authentication

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ and pnpm installed
- Supabase account (supabase.com)
- Git (for version control)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd truegacy
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Supabase Setup

#### Create Supabase Project
1. Visit [supabase.com](https://supabase.com) and sign up/log in
2. Create a new project
3. Note your project URL and Anon Key

#### Set Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### Create Database Tables

The database schema is automatically created via the migration script. However, you'll need to:

1. Run the migration script in your Supabase SQL editor:
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Create a new query
   - Copy the contents of `/scripts/01-create-schema.sql`
   - Execute the query

Or, the script will be automatically executed when you run the app.

### 4. Database Schema

The system creates the following tables:

- **profiles**: User information and roles
- **leads**: Core lead data with status and assignment
- **lead_details**: Extended lead information (contact, company, family details)
- **lead_documents**: Uploaded documents and proof files
- **lead_activities**: Activity log (calls, emails, meetings, notes)
- **lead_opportunities**: Deal opportunities with values and stages
- **auto_assignment_rules**: Configuration for automatic lead distribution
- **lead_assignment_history**: Log of all lead assignments
- **lead_conversion_analytics**: Conversion metrics and statistics

### 5. Initial User Setup

#### Create First Admin User

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Visit http://localhost:3000 and sign up with your email

3. In Supabase dashboard, go to the `profiles` table and manually set your role to 'super_admin':
   - Click on your user record
   - Update the `role` column to `super_admin`
   - Save

#### Add Additional Users

Once you have admin access:
1. Create users through the authentication system
2. Manually set their roles in the profiles table via Supabase dashboard

### 6. Configure Auto-Assignment (Optional)

After setting up users:

1. Go to Admin Dashboard → Settings
2. Configure auto-assignment rules with sales team member IDs
3. Enable round-robin assignment

## Project Structure

```
truegacy/
├── app/
│   ├── layout.tsx                 # Root layout with Auth Provider
│   ├── page.tsx                   # Landing page
│   ├── auth/                      # Authentication pages
│   ├── dashboard/                 # Main dashboard (role-based routing)
│   ├── agent/                     # Agent dashboard
│   ├── admin/                     # Admin dashboard
│   ├── sales/                     # Sales team dashboard
│   ├── analytics/                 # Analytics dashboard
│   └── api/                       # API endpoints
├── lib/
│   ├── auth/                      # Authentication utilities and context
│   ├── services/                  # Business logic services
│   │   ├── leads.ts
│   │   ├── activities.ts
│   │   ├── opportunities.ts
│   ├── supabase/                  # Supabase client setup
├── components/
│   ├── dashboard/                 # Dashboard-specific components
│   └── ui/                        # shadcn UI components
├── scripts/
│   └── 01-create-schema.sql       # Database migration script
└── public/                        # Static assets
```

## Running the Application

### Development

```bash
pnpm dev
```

Visit http://localhost:3000

### Build for Production

```bash
pnpm build
pnpm start
```

## API Endpoints

### Leads
- `GET /api/leads` - Get all leads (with filtering)
- `POST /api/leads` - Create a new lead
- `GET /api/leads/[id]` - Get lead details
- `PATCH /api/leads/[id]` - Update lead

### Activities
- `GET /api/activities` - Get activities (with filtering)
- `POST /api/activities` - Log a new activity

### Opportunities
- `GET /api/opportunities` - Get opportunities
- `POST /api/opportunities` - Create a new opportunity

## User Workflows

### Agent Workflow
1. Log in to the system
2. Go to Agent Dashboard
3. Add new leads using the lead form
4. View all created leads in the "My Leads" tab
5. Track their progress as they move through the sales pipeline

### Sales Team Workflow
1. Log in to the system
2. Go to Sales Dashboard
3. View assigned leads
4. Log activities (calls, emails, meetings)
5. Create opportunities for qualified leads
6. Convert leads to customers
7. Monitor performance metrics

### Admin Workflow
1. Log in to the system
2. Go to Admin Dashboard
3. View all leads in the system
4. Manually assign leads to sales team members
5. Configure auto-assignment rules
6. Monitor team performance in Analytics
7. Access detailed conversion and pipeline reports

## Database Security

The system implements Row Level Security (RLS) policies:
- Users can only see their own leads (except admins)
- Activity logs are protected
- Assignment history is audited

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

## Troubleshooting

### "No leads assigned to you yet"
- Ensure you're logged in with a sales team account
- Check that the admin has assigned leads to your user ID
- Verify your user ID in Supabase

### "Auto-assignment failed"
- Ensure auto-assignment rule exists and is enabled
- Check that sales team member IDs are valid
- Verify lead status is 'new'

### "Cannot create opportunity"
- Ensure the lead status is not 'lost' or 'converted'
- Verify all opportunity fields are filled
- Check that you're assigned to the lead

### Database Connection Issues
- Verify environment variables are correctly set
- Check Supabase project is active
- Ensure database tables are created

## Performance Tips

- Leads table has indexes on status and assigned_to for fast queries
- Activity logs are ordered by timestamp for efficient retrieval
- Analytics queries are optimized for the past 30-day window
- Use pagination for large result sets (limit=50 by default)

## Support & Contributions

For issues or feature requests, please contact the development team.

## License

Proprietary - All rights reserved

## Version

1.0.0 - Initial Release
