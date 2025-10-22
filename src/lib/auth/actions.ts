"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/auth/setup");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function setupUsername(formData: FormData) {
  const supabase = await createClient();
  const username = formData.get("username") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: existing } = await supabase
    .from("users")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return { error: "Username already taken" };
  }

  const { error } = await supabase.from("users").insert({
    id: user.id,
    username: username,
    display_name: username,
    avatar_url: user.user_metadata.avatar_url || null,
    bio: "",
  });

  if (error) {
    return { error: error.message };
  }

  const { error: channelError } = await supabase.from("channels").insert({
    user_id: user.id,
    handle: `@${username}`,
    name: username,
    description: "",
  });

  if (channelError) {
    return { error: channelError.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
