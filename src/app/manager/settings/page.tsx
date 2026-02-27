"use client";

import React from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { ThemeInput, ThemeButton } from "@/app/components";

export default function ManagerSettingsPage() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="bg-white rounded-xl shadow-table p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
        <div className="flex flex-col gap-4 max-w-md">
          <ThemeInput
            label="Full Name"
            value={user?.fullName ?? ""}
            onChange={() => {}}
            placeholder="Full name"
            disabled
          />
          <ThemeInput
            label="Email"
            value={user?.email ?? ""}
            onChange={() => {}}
            placeholder="Email"
            disabled
          />
          <p className="text-sm text-gray-500">
            Contact an administrator to update your profile or password.
          </p>
        </div>
      </div>
    </div>
  );
}
