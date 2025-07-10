
# Answerly Nuxt App

A modern Nuxt 3 application using Supabase for authentication, database (PostgreSQL), and storage (avatars), with Pinia for state management.

## Features
- Supabase Auth (email/password)
- User profile creation and management
- Public profile pages (`/profile/:username`)
- Personal profile page (`/my/profile`)
- Profile editing and avatar upload (`/my/profile/edit`)
- Pinia for state management
- Middleware for route protection and redirects

## Project Structure

- `pages/` — Nuxt 3 pages (routes)
- `stores/` — Pinia stores (profile state)
- `middleware/` — Route guards and redirects
- `components/` — Vue components

## Environment Setup

1. **Environment Variables**
   - Create a `.env` file in the project root with:
     ```
     SUPABASE_URL=your-supabase-url
     SUPABASE_ANON_KEY=your-supabase-anon-key
     ```
2. **Nuxt Modules**
   - `@nuxtjs/supabase`
   - `@pinia/nuxt`
3. **Install dependencies**
   ```
   npm install
   ```

## Supabase Setup

1. **Enable Auth & Database**
   - Go to [Supabase](https://app.supabase.com/)
   - Create a new project (Supabase Database/PostgreSQL)
   - Enable email/password authentication in the Auth settings

## Database Schema

### `profiles` Table
| Column      | Type    | Description                        |
|-------------|---------|------------------------------------|
| user_id     | uuid    | Primary key, references auth.users |
| username    | text    | Unique, required                   |
| avatar_url  | text    | Optional, profile picture URL      |
| bio         | text    | Optional, user bio                 |
| created_at  | timestamptz | Default: now()                 |
| updated_at  | timestamptz | Auto-updated on change         |

```sql
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Storage & Avatars

- Each user can upload an avatar image to their own folder: `avatars/<user_id>/avatar.<ext>`
- The `avatar_url` field in the profile points to the public URL of the uploaded image.
- Make the bucket public for public avatar URLs, or use signed URLs for private avatars.
- **RLS Policy Example:**
    ```sql
    create policy "Users can manage their own avatar files"
    on storage.objects
    for all
    using (
      bucket_id = 'avatars'
      and auth.uid()::text = split_part(name, '/', 1)
    );
    ```

## Row Level Security (RLS)

> ⚠️ **Important:** Row Level Security (RLS) is currently **not enabled** on the `profiles` table. You should set up RLS policies before going to production to protect user data and ensure only authorized access.

## Usage

- Sign up and log in with email/password
- After signup, a profile is created in the `profiles` table
- Visit `/my/profile` to view your profile
- Visit `/my/profile/edit` to edit your profile and upload an avatar
- Visit `/profile/:username` to view any public profile

## Development

```bash
npm run dev
```

---

**Built with Nuxt 3, Supabase, and Pinia.**