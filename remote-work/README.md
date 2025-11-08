# RemoteWork - Remote Collaboration Platform

A comprehensive Next.js application for remote team collaboration featuring task management, real-time chat, and document collaboration.

## Features

- ✅ **Task Board** - Drag-and-drop kanban board for task management
- ✅ **Real-time Chat** - Team messaging with message history
- ✅ **Document Collaboration** - Create and edit documents with auto-save
- ✅ **Team Management** - View and manage workspace members
- ✅ **Authentication** - Secure authentication with Clerk
- ✅ **Database** - PostgreSQL database with Neon

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Clerk
- **Database**: Neon (PostgreSQL) with Drizzle ORM
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Clerk account (for authentication)
- Neon account (for database)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Neon Database
   DATABASE_URL=your_neon_database_url
   ```

3. **Set up the database:**
   
   Run database migrations to create the schema:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

   Or if you prefer to run the SQL manually, check the generated migration files in the `drizzle` folder.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── dashboard/          # Main dashboard pages
│   │   ├── chat/          # Chat page
│   │   ├── documents/     # Document management
│   │   └── team/          # Team management
│   ├── api/               # API routes
│   │   ├── tasks/         # Task CRUD operations
│   │   ├── chat/          # Chat API
│   │   └── documents/     # Document API
│   ├── sign-in/           # Clerk sign-in page
│   ├── sign-up/           # Clerk sign-up page
│   ├── layout.tsx         # Root layout with Clerk provider
│   └── page.tsx           # Landing page
├── components/
│   └── TaskBoard.tsx      # Task board component
├── lib/
│   └── db/
│       ├── schema.ts      # Database schema
│       └── index.ts       # Database connection
└── middleware.ts          # Clerk middleware
```

## Database Schema

The application uses the following main tables:

- **users** - User accounts (synced with Clerk)
- **workspaces** - Team workspaces
- **workspace_members** - Workspace membership
- **tasks** - Task items
- **messages** - Chat messages
- **documents** - Collaborative documents
- **document_collaborators** - Document access control

## Features in Detail

### Task Board
- Create, edit, and delete tasks
- Drag-and-drop between columns (To Do, In Progress, Done)
- Task priorities and due dates
- Real-time updates

### Chat
- Real-time messaging
- Message history
- User identification
- Workspace-scoped conversations

### Documents
- Create and edit documents
- Auto-save functionality
- Document management
- Workspace collaboration

### Team Management
- View workspace members
- Member roles (owner, admin, member)
- User profiles

## Development

### Database Migrations

When you modify the schema in `lib/db/schema.ts`:

```bash
# Generate migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit migrate
```

### Building for Production

```bash
npm run build
npm start
```

## Environment Variables

Make sure to set up the following environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- `CLERK_SECRET_KEY` - Your Clerk secret key
- `DATABASE_URL` - Your Neon database connection string

## License

MIT
