# Answerly Nuxt App

A modern Nuxt 3 application using Supabase for authentication and database (Postgres) for user profiles and all data storage. Pinia is used for state management throughout the app.

## Features
- Supabase Auth (email/password)
- User profile creation and management
- Public profile pages (`/profile/:username`)
- Personal profile page (`/my/profile`)
- Pinia for state management
- Middleware for route protection and redirects

## Environment Setup

### 1. Environment Variables
Create a `.env` file in the project root with:
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Nuxt Modules
- `@nuxtjs/supabase`
- `@pinia/nuxt`

Install dependencies:
```
npm install
```


## Supabase Database Setup

### 1. Enable Auth & Database
- Go to [Supabase](https://app.supabase.com/)
- Create a new project (Supabase Database/Postgres)
- Enable email/password authentication in the Auth settings

### 2. Database Tables

#### `profiles` Table
| Column      | Type    | Description                        |
|-------------|---------|------------------------------------|
| user_id     | uuid    | Primary key, references auth.users |
| username    | text    | Unique, required                   |
| avatar_url  | text    | Optional, profile picture URL      |
| bio         | text    | Optional, user bio                 |
| created_at  | timestamptz | Default: now()                 |
| updated_at  | timestamptz | Auto-updated on change         |

**SQL Example:**
```sql
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 3. Row Level Security (RLS)
**RLS is not yet enabled.**

> ⚠️ **Important:** Row Level Security (RLS) is currently **not enabled** on the `profiles` table. You should set up RLS policies before going to production to protect user data and ensure only authorized access.

When ready, enable RLS and add policies such as:

- Allow users to insert their own profile:
```sql
create policy "Users can insert their own profile" on profiles
for insert with check (auth.uid() = user_id);
```
- Allow users to select/update their own profile:
```sql
create policy "Users can view their own profile" on profiles
for select using (auth.uid() = user_id);

create policy "Users can update their own profile" on profiles
for update using (auth.uid() = user_id);
```
- Allow public select for public profiles (optional):
```sql
create policy "Public can view profiles by username" on profiles
for select using (true);
```

## Usage
- Sign up and log in with email/password
- After signup, a profile is created in the `profiles` table
- Visit `/my/profile` to view your profile
- Visit `/profile/:username` to view any public profile

## Development
```
npm run dev
```

---

**Built with Nuxt 3, Supabase, and Pinia.**