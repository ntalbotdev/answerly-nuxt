import type { Profile } from '~/stores/profile';

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: "Username is required." };
  }
  
  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters long." };
  }
  
  if (username.length > 20) {
    return { valid: false, error: "Username must be less than 20 characters long." };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, error: "Username can only contain letters, numbers, and underscores." };
  }
  
  return { valid: true };
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
