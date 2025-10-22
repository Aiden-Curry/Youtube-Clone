import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return userProfile;
});

export const getCurrentUserWithChannel = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select(
      `
      *,
      channels:channels(*)
    `
    )
    .eq("id", user.id)
    .maybeSingle();

  return userProfile;
});

export const getSession = cache(async () => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
});

export const isAuthenticated = cache(async () => {
  const session = await getSession();
  return !!session;
});
