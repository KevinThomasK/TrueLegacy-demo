# TrueGacy System Architecture

## System Overview

TrueGacy is a full-stack lead management system built with Next.js and Supabase, designed to handle lead capture, distribution, tracking, and conversion with role-based access control and advanced analytics.

## Architecture Layers

### 1. Authentication & Authorization Layer

**Location**: `/lib/auth/`

- **context.tsx**: Global auth context providing user session and role information
- **roles.ts**: Role definitions and permission management
- **protected-route.tsx**: Component-level route protection

**Key Features**:
- Supabase JWT-based authentication
- Real-time auth state management
- Role-based access control (RBAC) with granular permissions
- Automatic role-based redirection on login

```
Auth Flow:
User Login → Supabase Auth → JWT Token → User Profile Fetch → Permission Check → Route Access
```

### 2. Database Layer

**Location**: Supabase PostgreSQL

#### Core Tables

**profiles**
- Stores user information and assigned roles
- Linked to Supabase auth via user ID
- Contains full_name, email, role, timestamps

**leads**
- Core lead entity
- Status: new, contacted, qualified, converted, lost
- agent_id: Who created the lead
- assigned_to: Currently assigned sales person
- Timestamps for tracking creation and updates

**lead_details**
- Extended lead information (one-to-one with leads)
- Contact info: full_name, email, phone
- Company: company_name, industry, company_size
- Address: address, city, state, postal_code, country
- Family: marital_status, children_count, siblings_count
- lead_source: How the lead was acquired

**lead_activities**
- Activity audit log
- Types: created, called, emailed, meeting, note, status_change, assigned
- Includes timestamps and optional notes
- Enables complete activity history

**lead_opportunities**
- Deal tracking with values
- Stages: proposal, negotiation, won, lost
- Tracks deal value, expected close date, probability
- Links to lead for conversion tracking

**lead_documents**
- File references (address proof, photos, etc.)
- Stores file paths in Supabase Storage
- Document type and metadata
- Links to specific leads

**auto_assignment_rules**
- Configuration for automatic lead distribution
- Types: round_robin, load_based, manual
- Lists of sales team members
- Enabled flag for activation

**lead_assignment_history**
- Audit trail of all lead assignments
- Who assigned it, when, and to whom
- Enables reassignment tracking

**lead_conversion_analytics**
- Pre-calculated metrics (future expansion)
- Conversion rates, source performance
- Sales person performance metrics

#### Schema Relationships

```
profiles
  ├── leads (agent_id → profiles.id)
  │   ├── lead_details (lead_id → leads.id)
  │   ├── lead_activities (lead_id → leads.id)
  │   ├── lead_opportunities (lead_id → leads.id)
  │   ├── lead_documents (lead_id → leads.id)
  │   └── lead_assignment_history (lead_id → leads.id)
  │       └── assigned_to → profiles.id
  └── lead_activities (user_id → profiles.id)
```

### 3. Service Layer

**Location**: `/lib/services/`

#### leads.ts
- `createLead()`: Create new lead with details
- `getLeadById()`: Fetch complete lead with all relationships
- `getAgentLeads()`: Get leads created by specific agent
- `getAllLeads()`: Admin view of all leads with filtering
- `updateLeadStatus()`: Change lead status and log activity
- `assignLeadToSalesUser()`: Assign lead and record assignment

#### activities.ts
- `logActivity()`: Record any type of activity
- `getLeadActivities()`: Full activity history for a lead
- `getActivityByType()`: Filter activities by type
- `getUserActivities()`: Get all activities by a user

#### opportunities.ts
- `createOpportunity()`: Create new deal opportunity
- `updateOpportunityStage()`: Move deal through pipeline
- `getLeadOpportunities()`: View opportunities for a lead
- `getOpportunitiesBySalesUser()`: Get user's opportunities

#### auto-assignment.ts
- `createAutoAssignmentRule()`: Set up auto-assignment configuration
- `getAutoAssignmentRules()`: Fetch active rules
- `assignLeadRoundRobin()`: Distribute lead using round-robin logic
- `autoAssignUnassignedLeads()`: Bulk assignment of new leads
- `updateAutoAssignmentRule()`: Modify rules

#### analytics.ts
- `getConversionMetrics()`: Overall conversion statistics
- `getMetricsBySource()`: Performance by lead source
- `getActivityMetrics()`: Activity breakdown
- `getTopSalesPerformance()`: Sales person rankings
- `getLeadsOverTime()`: Timeline of lead creation/conversion
- `getOpportunityPipeline()`: Deal pipeline breakdown

### 4. UI Component Layer

**Location**: `/components/`

#### Dashboard Components
- **lead-form.tsx**: Comprehensive lead creation form with all fields
- All forms use shadcn UI components for consistency

#### UI Components (shadcn)
- Form elements: Input, Textarea, Select, Label
- Data display: Table, Badge, Card
- Navigation: Tabs, Dialog, Dropdown-Menu
- Feedback: Toast notifications via Sonner
- Loading: Spinner for async operations

### 5. API Route Layer

**Location**: `/app/api/`

#### RESTful Endpoints

**GET /api/leads**
- Query params: limit, offset, status, assigned_to
- Returns paginated leads with details
- Requires authentication

**POST /api/leads**
- Body: { leadDetails: {...} }
- Creates lead and associated details
- Automatically logs creation activity

**GET /api/leads/[id]**
- Returns complete lead with all relationships
- Includes activities, opportunities, documents

**PATCH /api/leads/[id]**
- Body: { status?: string, details?: {...} }
- Updates lead and/or details
- Logs status changes as activities

**GET /api/activities**
- Query params: lead_id, user_id, limit, offset
- Returns filtered activities
- Pagination supported

**POST /api/activities**
- Body: { lead_id, activity_type, description, notes }
- Creates activity record
- Validates activity type

**GET /api/opportunities**
- Query params: lead_id, stage
- Returns opportunities
- Supports filtering by stage

**POST /api/opportunities**
- Body: { lead_id, title, value, currency, expected_close_date }
- Creates opportunity
- Auto-links to lead

### 6. Page Layer (UI Routes)

**Landing Page** (`/`)
- Marketing/informational page
- Sign in/sign up buttons
- Feature overview

**Authentication** (`/auth`)
- Sign up form
- Sign in form
- Mode toggle between signup and login

**Dashboard Router** (`/dashboard`)
- Checks user role
- Redirects to role-specific dashboard

**Agent Dashboard** (`/agent`)
- Add new leads tab
- View my leads tab
- Lead status tracking

**Admin Dashboard** (`/admin`)
- View all leads
- Manual assignment interface
- Auto-assignment configuration
- Team statistics

**Sales Dashboard** (`/sales`)
- Assigned leads only
- Log activity buttons
- Create opportunity buttons
- Lead conversion actions
- Performance statistics

**Analytics Dashboard** (`/analytics`)
- Conversion metrics
- Lead source performance
- Sales team rankings
- Opportunity pipeline
- Timeline charts

## Data Flow Patterns

### Lead Creation Flow
```
Agent Form → createLead() → 
  Insert leads table → 
  Insert lead_details → 
  Log activity → 
  Return to agent
```

### Lead Assignment Flow
```
Admin Manual Assignment / Auto-Assignment trigger →
  assignLeadRoundRobin() →
  Update leads table →
  Insert assignment_history →
  Log activity →
  Notify assignee
```

### Activity Logging Flow
```
User Action → logActivity() →
  Insert activity record →
  Optionally update lead status →
  Return to user
```

### Lead Conversion Flow
```
Sales → Convert Lead Action →
  updateLeadStatus(converted) →
  Create opportunity (if needed) →
  Log activity →
  Update analytics
```

## Authentication & Authorization Flow

```
Request → Check JWT Token → 
  Get User from Supabase →
  Load User Profile & Role →
  Check Route Permissions →
  Verify Row-Level Security →
  Execute Request / Return 403
```

## Security Considerations

### 1. Authentication
- JWT tokens via Supabase Auth
- HTTP-only cookies for session management
- Automatic token refresh

### 2. Authorization
- Role-based access control (RBAC)
- Route-level protection via ProtectedRoute component
- Permission checks in service layer

### 3. Data Protection
- Row Level Security (RLS) on all tables
- Users see only their own data (except admins)
- Activity logs are immutable (audit trail)

### 4. Input Validation
- Form validation on client side
- Server-side validation in API routes
- Parameterized queries prevent SQL injection

### 5. API Security
- JWT validation on all endpoints
- Rate limiting (via hosting platform)
- CORS handling via Supabase

## Performance Optimizations

### Database
- Indexes on frequently queried columns (status, assigned_to, lead_id)
- Efficient pagination (offset/limit)
- Relationship queries optimized with select

### Frontend
- Client-side filtering for fast UI response
- Server-side pagination for large datasets
- Lazy loading of components
- Memoization of heavy computations

### Caching
- Service layer handles data fetching
- React hooks maintain local state
- Supabase client-side caching

## Scalability Considerations

### Horizontal Scaling
- Stateless API routes (can run on multiple servers)
- Database connection pooling via Supabase
- CDN for static assets

### Vertical Scaling
- Database indexes optimize slow queries
- Pagination prevents loading huge datasets
- Archive old leads/activities if needed

### Future Enhancements
- Implement Redis caching layer
- Batch operations for bulk actions
- Scheduled jobs for analytics aggregation
- Real-time updates via Supabase Realtime

## Testing Strategy

### Unit Tests
- Service layer functions
- Utility functions
- Form validation

### Integration Tests
- API endpoint responses
- Database operations
- Authentication flows

### E2E Tests
- Complete user workflows
- Role-based access control
- Lead lifecycle (creation → conversion)

## Deployment Architecture

```
GitHub Repo → Vercel CI/CD → 
  Build Next.js App → 
  Deploy to Vercel Edge Network → 
  Connect to Supabase Production DB
```

## Environment Configuration

**Development**: 
- Local Next.js dev server
- Supabase dev/test project

**Production**:
- Vercel deployment
- Supabase production project
- Environment variables in Vercel

## Monitoring & Logging

### Key Metrics
- Lead creation rate
- Conversion rate by source
- Sales person performance
- API response times
- Error rates

### Logging
- Activity table serves as audit log
- Supabase Analytics for database performance
- Vercel Observability for API metrics
- Console logs for debugging

## Future Roadmap

1. **File Storage**: Implement document upload to Supabase Storage
2. **Real-time Updates**: Add Supabase Realtime subscriptions for live dashboards
3. **Batch Operations**: Import leads from CSV/Excel
4. **Email Notifications**: Auto-notify on assignment/status changes
5. **SMS Integration**: Send reminders to leads
6. **Advanced Filters**: Saved filter presets
7. **Mobile App**: React Native companion app
8. **API Keys**: Allow external integrations
9. **Webhooks**: Trigger events on lead actions
10. **Custom Fields**: User-defined lead attributes

## Support & Maintenance

- Regular database backups via Supabase
- Monitor error rates and API performance
- Update dependencies quarterly
- Security patches as needed
- User feedback-driven improvements
