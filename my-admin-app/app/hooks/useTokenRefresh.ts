"use client"
import { getToken, isTokenExpired, isTokenExpiringSoon, setToken } from '../utils/tokens/token';
import { useCallback } from 'react';




export async function refreshTokenWithFetch(token: string): Promise<string | null> {
    try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            throw new Error("NEXT_PUBLIC_API_URL is not defined");
        }

        const response = await fetch(process.env.NEXT_PUBLIC_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // ajoute l'authorization si nécessaire
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: `
          mutation RefreshToken($Token: String!) {
            refreshToken(Token: $Token)
          }
        `,
                variables: {
                    Token: token,
                },
            }),
        });

        const result = await response.json();

        if (result.data?.refreshToken) {
            return result.data.refreshToken;
        }

        console.error('Erreur dans refreshToken:', result.errors || result);
        return null;
    } catch (error) {
        console.error('Échec du fetch refreshToken:', error);
        return null;
    }
}


export const useTokenRefresh = () => {
    const refreshToken = useCallback(async (): Promise<boolean> => {
        try {
            const currentToken = getToken();

            if (!currentToken || isTokenExpired(currentToken)) {
                return false;
            }

            const newToken = await refreshTokenWithFetch(currentToken);

            if (newToken) {
                setToken(newToken);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }, []);

    const checkAndRefreshToken = useCallback(async (): Promise<boolean> => {
        const currentToken = getToken();

        if (!currentToken) return false;

        if (isTokenExpired(currentToken) || isTokenExpiringSoon(currentToken, 5)) {
            return await refreshToken();
        }

        return true;
    }, [refreshToken]);

    return {
        refreshToken,
        checkAndRefreshToken,
    };
};
