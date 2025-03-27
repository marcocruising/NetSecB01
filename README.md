# NetSecB01
# Comprehensive Prompt for Stakeholder CRM Web App

## Project Overview

Create a simple but scalable Stakeholder CRM web application for a startup team to track conversations with external stakeholders. The application should use Supabase for authentication and database functionality, with a clean, minimalist frontend focused on usability.

## Core Requirements

### Authentication & User Management
- Implement secure login using Supabase Auth (email/password)
- Create two user roles: admin and standard user
- Admin should be able to invite new users and manage permissions
- Users should have basic profile information (name, email, role in the startup)

### Data Model

#### Companies
- Name (required)
- Website (optional)
- Industry (optional)
- Size (optional dropdown: Small, Medium, Large, Enterprise)
- Type (dropdown: Investor, Customer, Partner, Vendor, Other)
- Description (text area)
- Custom tags (multiple selections)
- Created at timestamp
- Updated at timestamp

#### Individuals
- First name (required)
- Last name (required)
- Email (optional)
- Phone (optional)
- Company (optional, foreign key to Companies table)
- Role at company (optional)
- Contact type (dropdown: Investor, Customer, Potential Employee, Partner, Other)
- Description (text area)
- Custom tags (multiple selections)
- Created at timestamp
- Updated at timestamp

#### Conversations
- Date and time (required)
- Participants from the team (multi-select of users, required)
- Company (optional, foreign key to Companies table)
- Individual(s) (optional, multi-select foreign key to Individuals table)
- Note: The system should allow conversations with:
  - Just a company (no specific individual)
  - Just an individual (no company association)
  - Both a company and specific individual(s) from that company
- Conversation notes (rich text, required)
- Follow-up required (boolean)
- Follow-up date (optional date)
- Custom tags (multiple selections)
- Created at timestamp
- Created by (foreign key to Users table)
- Updated at timestamp

#### Tags
- Name (required)
- Color (optional)
- Category (dropdown: Company, Individual, Conversation, All)
- Created at timestamp

### User Interface

#### Dashboard
- Recent conversations (last 5-10 conversations)
- Upcoming follow-ups
- Quick stats (total companies, individuals, conversations)
- Quick add buttons for companies, individuals, and conversations

#### Companies View
- List view with sorting and filtering options
- Search functionality (by name, industry, tags)
- Company detail view showing:
  - Company information
  - List of associated individuals
  - Chronological list of all conversations:
    - Direct company conversations
    - Conversations with any individual from the company
  - Ability to add new conversation or individual from this view

#### Individuals View
- List view with sorting and filtering options
- Search functionality (by name, company, role, tags)
- Individual detail view showing:
  - Individual information
  - Associated company (if any)
  - Chronological list of all conversations with this individual
  - Ability to add new conversation from this view

#### Conversations View
- List view with sorting and filtering options
- Search functionality (by content, company, individual, date, tags)
- Conversation detail view showing:
  - Date, participants, company/individual information
  - Conversation notes
  - Follow-up information
  - Ability to edit or delete the conversation

#### Search Functionality
- Global search that searches across companies, individuals, and conversation notes
- Advanced filters (date range, conversation types, tags)
- Results grouped by type (companies, individuals, conversations)

## Technical Specifications

### Frontend
- React (with TypeScript for type safety)
- Simple, clean UI using Tailwind CSS
- Responsive design (primarily optimized for desktop)
- Organized component structure:
  - Page components (Dashboard, Companies, Individuals, Conversations)
  - Shared UI components (forms, tables, cards)
  - Context providers for global state

### Backend (Supabase)
- Database tables:
  - users (managed by Supabase Auth)
  - companies
  - individuals
  - conversations
  - conversation_participants (junction table)
  - conversation_individuals (junction table)
  - tags
  - company_tags (junction table)
  - individual_tags (junction table)
  - conversation_tags (junction table)

- Row Level Security (RLS) policies:
  - Users can only see data within their organization
  - Admins have full CRUD permissions
  - Standard users have read permissions on all data, create permissions, but limited update/delete permissions

- Indexes for performance:
  - Text search indexes on company names, individual names, and conversation notes
  - Index on company foreign keys in the individuals table
  - Indexes on foreign keys in junction tables

### Supabase Schema

```sql
-- Create tables
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  size TEXT CHECK (size IN ('Small', 'Medium', 'Large', 'Enterprise')),
  type TEXT CHECK (type IN ('Investor', 'Customer', 'Partner', 'Vendor', 'Other')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE individuals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  role TEXT,
  contact_type TEXT CHECK (contact_type IN ('Investor', 'Customer', 'Potential Employee', 'Partner', 'Other')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  notes TEXT NOT NULL,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE conversation_individuals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  individual_id UUID REFERENCES individuals(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(conversation_id, individual_id)
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT,
  category TEXT CHECK (category IN ('Company', 'Individual', 'Conversation', 'All')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE company_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(company_id, tag_id)
);

CREATE TABLE individual_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  individual_id UUID REFERENCES individuals(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(individual_id, tag_id)
);

CREATE TABLE conversation_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(conversation_id, tag_id)
);

-- Create indexes
CREATE INDEX idx_individuals_company_id ON individuals(company_id);
CREATE INDEX idx_conversations_company_id ON conversations(company_id);
CREATE INDEX idx_company_name ON companies USING GIN (to_tsvector('english', name));
CREATE INDEX idx_individual_name ON individuals USING GIN (to_tsvector('english', first_name || ' ' || last_name));
CREATE INDEX idx_conversation_notes ON conversations USING GIN (to_tsvector('english', notes));

-- Create RLS policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE individuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_individuals ENABLE ROW LEVEL SECURITY;

-- Example policy (you'll need to customize based on your organization structure)
CREATE POLICY "Users can view all data" ON companies FOR SELECT USING (true);
CREATE POLICY "Users can insert data" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON companies FOR UPDATE USING (auth.uid() = created_by);
```

## Implementation Steps

1. Set up a new Supabase project
   - Create database schema according to the provided specifications
   - Configure authentication (email/password)
   - Set up Row Level Security policies

2. Initialize React project with TypeScript
   - Install necessary dependencies (Supabase client, React Router, Tailwind CSS)
   - Set up project structure

3. Create authentication system
   - Sign up, sign in, password reset
   - User profile management

4. Implement core data management
   - Create CRUD operations for companies
   - Create CRUD operations for individuals
   - Create CRUD operations for conversations
   - Implement tagging system

5. Build UI components
   - Dashboard
   - Companies views
   - Individuals views
   - Conversations views
   - Search functionality

6. Implement cross-entity relationships
   - Company-individual associations
   - Conversation associations with companies/individuals
   - User participation in conversations

7. Add search and filtering capabilities
   - Global search
   - Entity-specific searches
   - Advanced filtering

8. Testing and refinement
   - Test all CRUD operations
   - Verify relationship integrity
   - Ensure proper access control

## Key Development Considerations

1. **Data Integrity**: Ensure proper relationships between entities, particularly for the flexible conversation associations.

2. **Performance**: Use appropriate indexes and query optimizations, especially for text search across conversation notes.

3. **User Experience**: Focus on a clean, intuitive interface with minimal clicks to perform common tasks.

4. **Security**: Implement proper RLS policies to ensure data privacy and access control.

5. **Scalability**: Structure the code and database to accommodate future features (analytics, integrations, mobile support).

## Future Expansion Possibilities

1. Email integration for automatically logging email conversations
2. Calendar integration for scheduling follow-ups
3. Notification system for reminders
4. Analytics dashboard for contact engagement metrics
5. Mobile application for on-the-go access
6. Export functionality for reports

## Testing Scenarios

1. Create a company and add multiple individuals associated with it
2. Record a conversation with just the company (no individuals)
3. Record a conversation with an individual (associated with a company)
4. Search for a company and verify all related conversations appear
5. Test tag filtering across different entity types
6. Verify that follow-up reminders appear correctly
7. Test user permissions (admin vs. standard user)

# Create a new React project with Vite
npm create vite@latest stakeholder-crm -- --template react-ts

# Navigate to the project directory
cd stakeholder-crm

# Install dependencies
npm install @supabase/supabase-js react-router-dom tailwindcss postcss autoprefixer
npm install -D @types/react-router-dom

# Set up Tailwind CSS
npx tailwindcss init -p