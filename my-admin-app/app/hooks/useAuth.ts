import { decodeToken, getToken, removeToken } from '../utils/tokens/token';
import type { DecodedToken } from '../utils/tokens/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useTokenRefresh } from './useTokenRefresh';
export const useAuth = () => {
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { checkAndRefreshToken } = useTokenRefresh();
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    setIsLoading(true);

    const token = getToken();
    if (!token) {
      setDecodedToken(null);
      setIsLoading(false);
      return;
    }

    const isTokenValid = await checkAndRefreshToken();

    if (isTokenValid) {
      const currentToken = getToken();
      if (currentToken) {
        const decoded = decodeToken(currentToken);
        setDecodedToken(decoded);
      } else {
        setDecodedToken(null);
      }
    } else {
      removeToken();
      setDecodedToken(null);
      // Redirect to signin if we're on a protected route
      const currentPath = window.location.pathname;
      const protectedRoutes = ['/Account', '/FavoriteList'];
      if (protectedRoutes.some(route => currentPath.startsWith(route))) {
        router.push('/signin');
      }
    }

    setIsLoading(false);
  }, [checkAndRefreshToken, router]);

  const logout = useCallback(() => {
    removeToken();
    setDecodedToken(null);
    router.push('/signin');
  }, [router]);

  const updateToken = useCallback((newToken: string) => {
    const decoded = decodeToken(newToken);
    setDecodedToken(decoded);
  }, []);

  // Handle server-side refresh hints
  const handleServerRefreshHint = useCallback(async () => {
    // This can be called from an axios interceptor or fetch wrapper
    // when you detect the X-Token-Refresh-Needed header
    await checkAndRefreshToken();
  }, [checkAndRefreshToken]);

  useEffect(() => {
    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);

    // Check and refresh token periodically
    const interval = setInterval(() => {
      checkAndRefreshToken();
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [checkAuth, checkAndRefreshToken]);

  return {
    decodedToken,
    isAuthenticated: !!decodedToken?.userId,
    isLoading,
    setDecodedToken,
    logout,
    updateToken,
    checkAuth,
    handleServerRefreshHint
  };
};