# Answerly Nuxt App

A modern Nuxt 3 application using Supabase for authentication, database (PostgreSQL), and profile assets storage. It uses Pinia for state management and Tailwind CSS for styling.

## Features

- Supabase Auth (email/password)
- User profile creation and management
- Public profile pages
- Personal profile page
- Profile editing and assets upload
- Ask questions to any user (optionally anonymously)
- Users can answer questions they receive
- Questions are only published after being answered
- Follow/unfollow users (social feature)
- View followers and following lists for any user
- See mutual follow status on profiles
- Pinia for state management
- Middleware for route protection and redirects

## Project Structure

- `assets/` — Static assets
- `components/` — Reusable Vue components
- `layouts/` — Nuxt 3 layouts
- `middleware/` — Route guards and redirects
- `pages/` — Nuxt 3 pages (routes)
- `stores/` — Pinia stores (profile, questions)
- `utils/` — Utility functions and constants (like routes)

## Environment Setup

1. **Environment Variables**
    - Create a `.env` file in the project root with:
        ```
        SUPABASE_URL=your-supabase-url
        SUPABASE_ANON_KEY=your-supabase-anon-key
        ```
2. **Nuxt Modules**
    - `@nuxt/eslint`
    - `@nuxtjs/supabase`
    - `@pinia/nuxt`
    - `@nuxtjs/tailwindcss`

3. **Install dependencies**
    ```
    npm install
    ```

## Supabase Setup

### Enable Auth & Database

- Go to [Supabase](https://app.supabase.com/)
- Create a new project (Supabase Database/Postgres)
- Enable email/password authentication in the Auth settings

### Database Schema

#### `profiles` Table

| Column       | Type        | Description                      |
| ------------ | ----------- | -------------------------------- |
| user_id      | uuid        | Primary key, Default: auth.uid() |
| username     | text        | Unique, required                 |
| display_name | text        | Nullable, user display name      |
| avatar_url   | text        | Nullable, profile picture URL    |
| banner_url   | text        | Nullable, profile banner URL     |
| bio          | text        | Nullable, user bio               |
| created_at   | timestamptz | Default: now()                   |
| updated_at   | timestamptz | Default: now()                   |

```sql
create table profiles (
  user_id uuid primary key default auth.uid() on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  banner_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### `follows` Table

| Column       | Type        | Description                               |
| ------------ | ----------- | ----------------------------------------- |
| follower_id  | uuid        | Primary key, references profiles(user_id) |
| following_id | uuid        | Primary key, references profiles(user_id) |
| created_at   | timestamptz | Default: now()                            |

```sql
create table follows (
  follower_id uuid references profiles(user_id) on delete cascade,
  following_id uuid references profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);
```

#### `questions` Table

| Column       | Type        | Description         |
| ------------ | ----------- | ------------------- |
| id           | uuid        | Primary key         |
| from_user_id | uuid        | From user, required |
| to_user_id   | uuid        | To user, required   |
| question     | text        | Required            |
| is_anonymous | boolean     | Default: false      |
| answer       | text        | Nullable            |
| published    | boolean     | Default: false      |
| created_at   | timestamptz | Default: now()      |
| answered_at  | timestamptz | Nullable            |

```sql
create table questions (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references profiles(user_id) on delete cascade,
  to_user_id uuid not null references profiles(user_id) on delete cascade,
  question text not null,
  is_anonymous boolean not null default false,
  answer text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);
```

## Storage & Profile Assets

- Each user can upload an avatar and a banner image to their own folder: `profile-assets/<user_id>/avatar.webp` and `profile-assets/<user_id>/banner.webp`
- The `avatar_url` and `banner_url` fields in the profile point to the public URLs of the uploaded images
- Make the bucket public for public URLs, or use signed URLs for private assets.
- **RLS Policy Example:**
    ```sql
    create policy "Users can manage their own profile assets"
    on storage.objects
    for all
    to authenticated
    using (
      bucket_id = 'profile-assets'
      and auth.uid()::text = split_part(name, '/', 1)
    );
    ```

## Row Level Security (RLS)

> ⚠️ **Important:** Row Level Security (RLS) is currently **not enabled** on any of the tables. You should set up RLS policies before going to production to protect user data and ensure only authorized access.

## Usage

- Sign up and log in with email/password (needs email verification)
- After signup, a profile is created in the `profiles` table
- Visit `/inbox` to answer questions sent to you (only published after answering)
- Visit `/my-questions` to see questions you have asked others
- Visit `/profile` to view or edit your profile
- Visit `/profile/:username` to view any public profile (ex: [/profile/axile](https://answerly-nuxt.vercel.app/profile/axile))
- Visit `/profile/:username/questions` to see questions asked to a user
- Visit `/profile/:username/followers` to see a user's followers
- Visit `/profile/:username/following` to see who a user is following

## Development

```bash
npm run dev
```

---

**Built with Nuxt 3, Supabase, Pinia, and Tailwind CSS.**
