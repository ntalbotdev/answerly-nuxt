import type { Profile } from '~/stores/profile';

export function validateUsername(username: string): boolean {
  // Username should be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

export function formatDisplayName(displayName: string | undefined, username: string): string {
  return displayName && displayName.trim() ? displayName.trim() : username;
}

export function sanitizeProfileData(profile: Partial<Profile>): Partial<Profile> {
  return {
    ...profile,
    username: profile.username?.toLowerCase().trim(),
    display_name: profile.display_name?.trim(),
    bio: profile.bio?.trim(),
  };
}

export function getProfileImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  // Add timestamp to prevent caching issues
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}

export function isOwnProfile(profile: Profile | null, currentUserId: string | undefined): boolean {
  return !!(profile?.user_id && currentUserId && profile.user_id === currentUserId);
}
