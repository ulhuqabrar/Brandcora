import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://brandcora-api.onrender.com",
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signOut, useSession } = authClient;