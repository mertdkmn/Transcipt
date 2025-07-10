"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        name: fullName,
        email: email,
      },
    },
  });

  if (error) {
    // Provide more specific error messages
    if (error.message.includes("already registered")) {
      return encodedRedirect(
        "error",
        "/sign-up",
        "This email is already registered. Please try signing in instead.",
      );
    }
    if (error.message.includes("Password")) {
      return encodedRedirect(
        "error",
        "/sign-up",
        "Password must be at least 6 characters long.",
      );
    }
    if (error.message.includes("Email")) {
      return encodedRedirect(
        "error",
        "/sign-up",
        "Please enter a valid email address.",
      );
    }
    return encodedRedirect("error", "/sign-up", error.message);
  }

  // The database trigger will automatically create the user record
  // No need to manually insert into the users table

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const checkUserSubscription = async (userId: string) => {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (error) {
    return false;
  }

  return !!subscription;
};

// Transcript processing actions
export const processTranscriptAction = async (formData: FormData) => {
  const inputType = formData.get("inputType") as string;
  const outputFormat = formData.get("outputFormat") as string;
  const includeTimestamps = formData.get("includeTimestamps") === "true";
  const speakerLabels = formData.get("speakerLabels") === "true";

  const supabase = await createClient();

  try {
    let transcriptData;

    if (inputType === "youtube") {
      const youtubeUrl = formData.get("youtubeUrl") as string;
      // Call YouTube processing edge function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-process-youtube",
        {
          body: {
            url: youtubeUrl,
            outputFormat,
            includeTimestamps,
            speakerLabels,
          },
        },
      );

      if (error) throw error;
      transcriptData = data;
    } else {
      // Handle file upload processing
      const file = formData.get("file") as File;
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-process-audio",
        {
          body: {
            file: await file.arrayBuffer(),
            fileName: file.name,
            outputFormat,
            includeTimestamps,
            speakerLabels,
          },
        },
      );

      if (error) throw error;
      transcriptData = data;
    }

    return { success: true, data: transcriptData };
  } catch (error) {
    return { success: false, error: "Failed to process transcript" };
  }
};
