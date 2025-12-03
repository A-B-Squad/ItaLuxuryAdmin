import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
import { DecodedToken } from './bundle.types';

export const getToken = (): string | undefined => {
    return Cookies.get('Token');
};

export const setToken = (token: string): void => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const domain = isDevelopment ? 'localhost' : '.ita-luxury.com';

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    Cookies.set('AdminToken', token, {
        // httpOnly: true,
        expires: expirationDate,
        domain: domain,
        path: '/',
        secure: !isDevelopment,
        sameSite: 'strict',

    });
};//ok

export const decodeToken = (token: string): DecodedToken | null => {
    try {
        const decoded = jwt.decode(token) as DecodedToken;
        if (decoded && decoded.exp * 1000 > Date.now()) {
            return decoded;
        }
        return null;
    } catch {
        return null;
    }
}; //ok

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwt.decode(token) as DecodedToken;
        return decoded.exp * 1000 <= Date.now();
    } catch {
        return true;
    }
}; //no

export const isTokenExpiringSoon = (token: string, minutes: number = 5): boolean => {
    try {
        const decoded = jwt.decode(token) as DecodedToken;
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        const minutesUntilExpiration = timeUntilExpiration / (1000 * 60);

        return minutesUntilExpiration <= minutes;
    } catch {
        return true;
    }
}; //ok

// Helper function to decode and validate token
export const validateToken = function (token: string): boolean {
    try {
        const decoded = jwt.decode(token) as any;
        if (!decoded || !decoded.exp) {
            return false;
        }
        // Check if token is expired
        return decoded.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export const removeToken = () => {
    Cookies.remove('Token', { domain: '.ita-luxury.com', path: '/' });
    Cookies.remove('Token', { path: '/' });
    // Clear sessionStorage
    window.sessionStorage.removeItem("products-in-basket");
    window.sessionStorage.removeItem("comparedProducts");
}; //ok