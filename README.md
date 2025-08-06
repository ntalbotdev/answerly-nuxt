# Answerly Nuxt App

A robust Nuxt 4 CRUD application leveraging Supabase for authentication, database management, and profile asset storage, Pinia for state handling, and Tailwind CSS for modern UI styling. Testing is provided via Vitest for unit tests and Playwright for end-to-end automation.

## Features

- Supabase Auth (email/password)
- User profile creation and management
- Public profile pages
- Profile editing and assets upload (avatar/banner via Supabase Storage)
- Ask questions to any user (optionally anonymously)
  - Anonymous questions protect user privacy and show as "Anonymous" in notifications
- Users can answer questions they receive
- Questions are only published after being answered
- Follow/unfollow users (social feature)
- View followers and following lists for any user
- See mutual follow status on profiles
- Real-time notification system with automatic cleanup
  - Get notified when someone follows you
  - Get notified when someone asks you a question
  - Get notified when someone answers your question
  - Notifications are automatically removed when actions are completed (questions answered/deleted, users unfollowed)
  - Real-time updates using Supabase subscriptions
  - Mark notifications as read (delete from system)
  - Clear all notifications at once
- Real-time inbox system
  - Questions appear instantly when received
  - Real-time updates when questions are answered or deleted
- Pinia for state management
- Middleware for route protection and redirects

## Project Structure

- `app/` — Main application source folder (Nuxt 4 standard)
  - `assets/` — Static assets
  - `components/` — Reusable Vue components
  - `composables/` — Reusable composable functions
  - `layouts/` — Nuxt layouts
  - `middleware/` — Route guards and redirects
  - `pages/` — Nuxt pages (routes)
    - `profile/[username]/` — Profile pages using shared components
  - `stores/` — Pinia stores (profile, questions, notifications)
  - `utils/` — Utility functions and constants
- `test/` — Unit and integration tests
  - `e2e/` — End-to-end tests using Playwright
  - `unit/` — Unit tests using Vitest

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
    - `@nuxt/test-utils/module`

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

<details>
  <summary>📄 <strong>Profiles Table SQL Query</strong></summary>

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
</details>

#### `follows` Table

| Column       | Type        | Description                               |
| ------------ | ----------- | ----------------------------------------- |
| follower_id  | uuid        | Primary key, references profiles(user_id) |
| following_id | uuid        | Primary key, references profiles(user_id) |
| created_at   | timestamptz | Default: now()                            |

<details>
  <summary>📄 <strong>Follows Table SQL Query</strong></summary>

  ```sql
  create table follows (
    follower_id uuid references profiles(user_id) on delete cascade,
    following_id uuid references profiles(user_id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (follower_id, following_id)
  );
  ```
</details>

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

<details>
  <summary>📄 <strong>Questions Table SQL Query</strong></summary>

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
</details>

#### `notifications` Table

| Column       | Type        | Description             |
| ------------ | ----------- | ----------------------- |
| id           | uuid        | Primary key             |
| user_id      | uuid        | User ID, required       |
| type         | text        | Notification type       |
| payload      | jsonb       | Nullable, Flexible data |
| is_read      | boolean     | Default: false          |
| created_at   | timestamptz | Default: now()          |
| event_id     | text        | Generated from payload  |

<details>
  <summary>📄 <strong>Notifications Table SQL Query</strong></summary>

  ```sql
  create table notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users on delete cascade,
    type text not null check (type in ('follow', 'question', 'answer', 'system')),
    payload jsonb,
    is_read boolean not null default false,
    created_at timestamptz not null default now(),
    event_id text generated always as (
      case
        when type = 'follow' then COALESCE(payload::jsonb->>'follower_id', '') || ':' || COALESCE(payload::jsonb->>'following_id', '')
        when type = 'question' then COALESCE(payload::jsonb->>'question_id', '')
        else COALESCE(id::text, '')
      end
    ) stored,
    unique (user_id, type, event_id)
  );
  ```
</details>

### Edge Functions

<details>
  <summary>🔧 <strong>send-notification Edge Function</strong></summary>

  ```ts
  import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

  serve(async (req) => {
    const origin = req.headers.get("origin") || "*";
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response("Missing environment variables", {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": origin
        }
      });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    if (req.method === "DELETE") {
      const { user_id, event_id, type } = await req.json();
      if (!user_id || !event_id || !type) {
        return new Response("Missing required fields for deletion", {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": origin
          }
        });
      }
      const { error } = await supabase.from("notifications").delete().eq("user_id", user_id).eq("event_id", event_id).eq("type", type);
      if (error) {
        return new Response(`Error deleting notification: ${error.message}`, {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": origin
          }
        });
      }
      return new Response("Notification deleted", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": origin
        }
      });
    }
    const { user_id, type, payload } = await req.json();
    if (!user_id || !type) {
      return new Response("Missing required fields", {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": origin
        }
      });
    }
    const { data, error } = await supabase.from("notifications").upsert([
      {
        user_id,
        type,
        payload
      }
    ], {
      onConflict: [
        "user_id",
        "type",
        "event_id"
      ]
    }).select();
    if (error) {
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": origin
        }
      });
    }
    return new Response("Notification inserted", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin
      }
    });
  });
  ```
</details>

## Storage & Profile Assets

- Each user can upload an avatar and a banner image to their own folder: `[user_id]/avatar.webp` and `[user_id]/banner.webp`
- The `avatar_url` and `banner_url` fields in the profile point to the public URLs of the uploaded images
- Make the bucket public for public URLs
- Use the RLS policies below to restrict access to profile assets

## Row Level Security (RLS)

> ℹ️ Click the spoilers below to reveal the SQL queries for each policy 

<details>
  <summary>📦 <strong>Storage RLS Policies</strong></summary>
    
  ```sql
  CREATE POLICY "Public can view avatar/banner"
    ON storage.objects
    FOR SELECT
    TO public
    USING (
      bucket_id = 'profile-assets'
      AND (
         name LIKE '%/avatar.webp'
        OR name LIKE '%/banner.webp'
      )
    );

  CREATE POLICY "Users can upload avatar/banner to their folder"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'profile-assets'
      AND auth.uid() IS NOT NULL
      AND (
        name = auth.uid()::text || '/avatar.webp'
        OR name = auth.uid()::text || '/banner.webp'
      )
    );

  CREATE POLICY "Users can update avatar/banner in their folder"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'profile-assets'
      AND auth.uid() IS NOT NULL
      AND (
        name = auth.uid()::text || '/avatar.webp'
        OR name = auth.uid()::text || '/banner.webp'
      )
    )
    WITH CHECK (
      bucket_id = 'profile-assets'
      AND auth.uid() IS NOT NULL
      AND (
        name = auth.uid()::text || '/avatar.webp'
        OR name = auth.uid()::text || '/banner.webp'
      )
    );

  CREATE POLICY "Users can delete avatar/banner from their folder"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'profile-assets'
      AND auth.uid() IS NOT NULL
      AND (
        name = auth.uid()::text || '/avatar.webp'
        OR name = auth.uid()::text || '/banner.webp'
      )
    );
  ```
</details>

<details>
  <summary>👤 <strong>Profiles RLS Policies</strong></summary>

  ```sql
  CREATE POLICY "Public can view profiles"
    ON profiles
    FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Users can create their own profile"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  ```
</details>

<details>
  <summary>🤝 <strong>Follows RLS Policies</strong></summary>

  ```sql
  CREATE POLICY "Everyone can view follows"
    ON follows
    FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Users can follow others"
    ON follows
    FOR INSERT
    WITH CHECK (
      follower_id = auth.uid()
    );

  CREATE POLICY "Users can unfollow others"
    ON follows
    FOR DELETE
    USING (
      follower_id = auth.uid()
    );
  ```
</details>

<details>
  <summary>❓ <strong>Questions RLS Policies</strong></summary>

  ```sql
  CREATE POLICY "Public can view published questions"
    ON questions
    FOR SELECT
    TO public
    USING (published = true);

  CREATE POLICY "Users can view their own questions"
    ON questions
    FOR SELECT
    USING (
      auth.uid() IS NOT NULL
      AND (
        from_user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can ask questions"
    ON questions
    FOR INSERT
    WITH CHECK (
      from_user_id = auth.uid()
    );

  CREATE POLICY "Users can answer questions sent to them"
    ON questions
    FOR UPDATE
    USING (
      to_user_id = auth.uid()
    )
    WITH CHECK (
      to_user_id = auth.uid()
    );

  CREATE POLICY "Users can delete questions they asked or received"
    ON questions
    FOR DELETE
    USING (
      auth.uid() IS NOT NULL
      AND (
        to_user_id = auth.uid()
      )
    );
  ```
</details>

<details>
  <summary>🔔 <strong>Notifications RLS Policies</strong></summary>

  ```sql
  CREATE POLICY "Users can view their notifications"
    ON notifications
    FOR SELECT
    USING (
      user_id = auth.uid()
    );

  CREATE POLICY "Users can update their notifications"
    ON notifications
    FOR UPDATE
    USING (
      user_id = auth.uid()
    )
    WITH CHECK (
      user_id = auth.uid()
    );

  CREATE POLICY "Users can delete their notifications"
    ON notifications
    FOR DELETE
    USING (
      user_id = auth.uid()
    );

  CREATE POLICY "Allow system inserts for notifications"
    ON notifications
    FOR INSERT
    TO service_role
    WITH CHECK (true);
  ```
</details>

## Usage

- Sign up and log in with email/password (needs email verification)
- After signup, a profile is created in the `profiles` table
- Visit `/inbox` to answer questions sent to you (only published after answering)
  - Real-time updates when new questions arrive
  - Answering or deleting questions automatically removes related notifications
- Visit `/notifications` to see real-time notifications for user activity and events
  - Follow notifications: See who followed you
  - Question notifications: See new questions you received
  - Answer notifications: See when your questions are answered
  - Click "Mark as read" to permanently delete individual notifications
  - Use "Clear All" to remove all notifications at once
- Visit `/my-questions` to see questions you have asked others
- Visit `/profile/:username` to view a public profile (ex: [/profile/axile](https://answerly-nuxt.vercel.app/profile/axile))
  - If it's your own profile, you can edit it by clicking the edit button
  - Follow/unfollow users with automatic notification management
- Visit `/profile/:username/followers` to see a user's followers
- Visit `/profile/:username/following` to see who a user is following

## Development

```bash
npm run dev
```

## Testing

- Run unit tests using Vitest:
  ```bash
  npm run test
  ```

- Run end-to-end tests using Playwright:
  ```bash
  npm run test:e2e
  ```

- Use Playwright codegen to generate tests:
  ```bash
  npm run codegen:e2e
  ```
  - This will open a browser window where you can interact with the app and generate tests automatically.

### Test User
- Email: `test@test.com`
- Password: `test123`

---

**Built with Nuxt, Supabase, Pinia, and Tailwind CSS.**
