import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = false 
}) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Redirect to login if authentication is required but user is not logged in
        router.replace('/login');
      } else if (!requireAuth && user) {
        // Redirect to main app if user is logged in and trying to access login
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, requireAuth]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Show children if:
  // - Auth is not required, OR
  // - Auth is required and user is logged in
  if (!requireAuth || (requireAuth && user)) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  return null;
};