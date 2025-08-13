# TODO

## Features

- [ ] Create feed component for logged-in users
- [ ] Create discover (search) page
    - [ ] Implement search functionality
    - [ ] Add filters (by user, date, etc.)
    - [ ] Implement sorting (by relevance, date, etc.)
- [ ] Add notification icon colors by type (follow, question, answer, etc.)
- [ ] Add likes on questions and answers on user profiles
- [ ] Add dark mode/light mode support
- [ ] Create user settings page
- [ ] Create block component for user profiles
- [ ] Create report component for users, questions and answers
- [ ] Create footer component
- [ ] Create 404 and other error pages
- [ ] Create pagination component
    - [ ] Implement infinite scrolling for feeds and profiles, and add "load more" button
    - [ ] Add page numbers for search results

## UI/UX Improvements

- [ ] Refactor my-questions page
- [ ] Create accessibility improvements (aria labels, keyboard nav)

## Code Quality & Refactoring

- [ ] Refactor and document middleware logic
- [ ] Review and optimize Supabase queries
- [ ] Polish README and developer docs
- [ ] Refactor variables.scss

## Testing

- [ ] Add unit tests (Vitest) for:
    - [ ] header
        - [ ] nav hamburger
        - [ ] user dropdown
    - [ ] notifications
    - [ ] inbox
    - [ ] user profiles
    - [ ] modals
    - [ ] ask form
    - [ ] edit profile form
    - [ ] follow count
    - [ ] loading/error component
    - [ ] logout

- [ ] Add e2e tests (Playwright) for:
    - [ ] header
    - [ ] notifications
    - [ ] inbox
    - [ ] user profiles
    - [ ] following/followers
