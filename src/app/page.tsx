"use client";

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login"); // 👈 Redirects to /login

  return null; // Return nothing since user is redirected
}
