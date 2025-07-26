import type { User } from '@supabase/supabase-js';

export async function loginWithPassword(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const supabase = useSupabaseClient();
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function signUpWithPassword(email: string, password: string): Promise<{ success: boolean; user?: User | null; error?: string }> {
  const supabase = useSupabaseClient();
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, user: data.user };
  } catch (err) {
    console.error("Signup error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function sendPasswordReset(email: string, redirectUrl?: string): Promise<{ success: boolean; error?: string }> {
  const supabase = useSupabaseClient();
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl || window.location.origin,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error("Password reset error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export function validatePassword(password: string, confirmPassword: string): { valid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match." };
  }
  
  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters long." };
  }
  
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { valid: false, error: "Email is required." };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Please enter a valid email address." };
  }
  
  return { valid: true };
}
