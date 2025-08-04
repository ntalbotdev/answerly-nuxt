# Answerly Nuxt App

A robust Nuxt 4 CRUD application leveraging Supabase for authentication, database management, and profile asset storage, Pinia for state handling, and Tailwind CSS for modern UI styling. Testing is provided via Vitest for unit tests and Playwright for end-to-end automation.

## Features

- Supabase Auth (email/password)
- User profile creation and management
- Public profile pages
- Profile editing and assets upload (avatar/banner via Supabase Storage)
- Ask questions to any user (optionally anonymously)
- Users can answer questions they receive
- Questions are only published after being answered
- Follow/unfollow users (social feature)
- View followers and following lists for any user
- See mutual follow status on profiles
- Notifications for user activity and events
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
| message      | text        | Notification message    |
| is_read      | boolean     | Default: false          |
| created_at   | timestamptz | Default: now()          |

<details>
  <summary>📄 <strong>Notifications Table SQL Query</strong></summary>

  ```sql
  create table notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users on delete cascade,
    type text not null check (type in ('follow', 'question', 'answer', 'system')),
    payload jsonb,
    message text not null,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
  );
  ```
</details>

### Functions and Triggers

<details>
  <summary>🔧 <strong>notify_user() Function</strong></summary>

  ```sql
  create function notify_user(
    target_user uuid,
    notif_type text,
    notif_message text,
    notif_payload jsonb default null
  ) returns void as $$
  begin
    insert into notifications (target_user, type, message, payload)
    values (target_user, notif_type, notif_message, notif_payload);
  end;
  $$ language plpgsql;
  ```
</details>

<details>
  <summary>🔧 <strong>on_follow_insert() Function</strong></summary>

  ```sql
  create function on_follow_insert() returns trigger as $$
  begin
    perform notify_user(
      new.following_id,
      'follow',
      'You have a new follower!',
      jsonb_build_object('follower_id', new.follower_id)
    );
    return new;
  end;
  $$ language plpgsql;
  ```
</details>

<details>
  <summary>🔧 <strong>on_question_insert() Function</strong></summary>

  ```sql
  create function on_question_insert() returns trigger as $$
  begin
    perform notify_user(
      new.to_user_id,
      'question',
      'You received a new question!',
      jsonb_build_object('question_id', new.id, 'from_user_id', new.from_user_id)
    );
    return new;
  end;
  $$ language plpgsql;
  ```
</details>

<details>
  <summary>🔧 <strong>on_question_answered() Function</strong></summary>

  ```sql
  create function on_question_answered() returns trigger as $$
  begin
    if new.answer is not null and old.answer is null then
      perform notify_user(
        new.from_user_id,
        'answer',
        'Your question has been answered!',
        jsonb_build_object('question_id', new.id, 'to_user_id', new.to_user_id)
      );
    end if;
    return new;
  end;
  $$ language plpgsql;
  ```
</details>

<details>
  <summary>⏰ <strong>notify_on_follow Trigger</strong></summary>

  ```sql
  create trigger notify_on_follow
    after insert on follows
    for each row execute procedure on_follow_insert();
  ```
</details>

<details>
  <summary>⏰ <strong>notify_on_question Trigger</strong></summary>

  ```sql
  create trigger notify_on_question
    after insert on questions
    for each row execute procedure on_question_insert();
  ```
</details>

<details>
  <summary>⏰ <strong>notify_on_answer Trigger</strong></summary>

  ```sql
  create trigger notify_on_answer
    after update on questions
    for each row execute procedure on_question_answered();
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
      auth.uid() IS NOT NULL
      AND follower_id = auth.uid()
      );

  CREATE POLICY "Users can unfollow others"
    ON follows
    FOR DELETE
    USING (
      auth.uid() IS NOT NULL
      AND follower_id = auth.uid()
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
        to_user_id = auth.uid()
        OR from_user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can ask questions"
    ON questions
    FOR INSERT
    WITH CHECK (
      auth.uid() IS NOT NULL
      AND from_user_id = auth.uid()
    );

  CREATE POLICY "Users can answer questions sent to them"
    ON questions
    FOR UPDATE
    USING (
      auth.uid() IS NOT NULL
      AND to_user_id = auth.uid()
    )
    WITH CHECK (
      auth.uid() IS NOT NULL
      AND to_user_id = auth.uid()
    );

  CREATE POLICY "Users can delete questions they asked or received"
    ON questions
    FOR DELETE
    USING (
      auth.uid() IS NOT NULL
      AND (
        from_user_id = auth.uid()
        OR to_user_id = auth.uid()
      )
    );
  ```
</details>

<details>
  <summary>🔔 <strong>Notifications RLS Policies</strong></summary>

  ```sql
  CREATE POLICY "No public access to notifications"
    ON notifications
    FOR SELECT
    TO public
    USING (false);

  CREATE POLICY "Users can view their notifications"
    ON notifications
    FOR SELECT
    USING (
      auth.uid() IS NOT NULL
      AND target_user = auth.uid()
    );

  CREATE POLICY "Users can create notifications"
    ON notifications
    FOR INSERT
    WITH CHECK (
      auth.uid() IS NOT NULL
      AND target_user = auth.uid()
    );

  CREATE POLICY "Users can update their notifications"
    ON notifications
    FOR UPDATE
    USING (
      auth.uid() IS NOT NULL
      AND target_user = auth.uid()
    )
    WITH CHECK (
      auth.uid() IS NOT NULL
      AND target_user = auth.uid()
    );

  CREATE POLICY "Users can delete their notifications"
    ON notifications
    FOR DELETE
    USING (
      auth.uid() IS NOT NULL
      AND target_user = auth.uid()
    );
  ```
</details>

## Usage

- Sign up and log in with email/password (needs email verification)
- After signup, a profile is created in the `profiles` table
- Visit `/inbox` to answer questions sent to you (only published after answering)
- Visit `/notifications` to see notifications for user activity and events
- Visit `/my-questions` to see questions you have asked others
- Visit `/profile/:username` to view a public profile (ex: [/profile/axile](https://answerly-nuxt.vercel.app/profile/axile))
  - If it's your own profile, you can edit it by clicking the edit button
- Visit `/profile/:username/questions` to see questions asked to a user
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
