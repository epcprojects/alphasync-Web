"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Loader from "./ui/Loader";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackRoute?: string;
}

export function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  fallbackRoute 
}: RoleBasedRouteProps) {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    // If user is not loaded yet, wait
    if (!user) {
      return;
    }

    const userType = user.userType?.toLowerCase();
    
    // Check if user's role is in allowed roles
    if (!userType || !allowedRoles.includes(userType)) {
      // Redirect to appropriate fallback route based on user type
      if (fallbackRoute) {
        router.push(fallbackRoute);
      } else {
        // Default fallback routes based on user type
        switch (userType) {
          case "admin":
            router.push("/admin/doctors");
            break;
          case "doctor":
            router.push("/inventory");
            break;
          case "customer":
          case "patient":
            router.push("/pending-payments");
            break;
          default:
            router.push("/login");
        }
      }
    }
  }, [user, allowedRoles, fallbackRoute, router]);

  // Show loader while user data is being fetched
  if (!user) {
    return <Loader />;
  }

  const userType = user.userType?.toLowerCase();
  
  // If user's role is not allowed, don't render children
  if (!userType || !allowedRoles.includes(userType)) {
    return <Loader />;
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminRoute({ children, fallbackRoute }: { children: ReactNode; fallbackRoute?: string }) {
  return (
    <RoleBasedRoute allowedRoles={["admin"]} fallbackRoute={fallbackRoute}>
      {children}
    </RoleBasedRoute>
  );
}

export function DoctorRoute({ children, fallbackRoute }: { children: ReactNode; fallbackRoute?: string }) {
  return (
    <RoleBasedRoute allowedRoles={["doctor"]} fallbackRoute={fallbackRoute}>
      {children}
    </RoleBasedRoute>
  );
}

export function CustomerRoute({ children, fallbackRoute }: { children: ReactNode; fallbackRoute?: string }) {
  return (
    <RoleBasedRoute allowedRoles={["customer", "patient"]} fallbackRoute={fallbackRoute}>
      {children}
    </RoleBasedRoute>
  );
}

export function DoctorOrAdminRoute({ children, fallbackRoute }: { children: ReactNode; fallbackRoute?: string }) {
  return (
    <RoleBasedRoute allowedRoles={["doctor", "admin"]} fallbackRoute={fallbackRoute}>
      {children}
    </RoleBasedRoute>
  );
}
