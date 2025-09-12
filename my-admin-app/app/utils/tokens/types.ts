export interface DecodedToken {
    userId: string;
    exp: number;
    iat: number;
  }
  
  export interface AuthState {
    isAuthenticated: boolean;
    user: DecodedToken | null;
  }