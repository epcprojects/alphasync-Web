"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { storage } from "@/lib/utils/storage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "./index";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: "ADMIN" | "DOCTOR" | "CUSTOMER";
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requiredUserType,
  redirectTo = "/login" 
}: AuthGuardProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = storage.getToken();
      const storedUser = storage.getUser();
      
      // Check if user is authenticated (has token and user data)
      if (token && (user || storedUser)) {
        // If we have user in Redux, use it; otherwise use stored user
        const currentUser = user || storedUser;
        
        // Check user type if required
        if (requiredUserType) {
          // Check if user has the required user type
          if (currentUser.userType === requiredUserType) {
            setIsAuthenticated(true);
          } else {
            // User doesn't have the required type, redirect
            router.push(redirectTo);
            return;
          }
        } else {
          setIsAuthenticated(true);
        }
      } else {
        // Not authenticated, redirect to login
        router.push(redirectTo);
        return;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [user, router, redirectTo, requiredUserType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
