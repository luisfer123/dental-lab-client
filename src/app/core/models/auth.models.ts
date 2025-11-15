export type JwtPayload = {
  sub?: string;
  roles?: string[];
  typ?: 'access' | 'refresh';
  exp?: number;
  iat?: number;
  jti?: string;
};

export type LoginRequest = { username: string; password: string };

export type LoginResponse = {
  accessToken: string;
  roles?: string[];
};

export type RefreshResponse = {
  accessToken: string;
  roles?: string[];
};

export interface UserInfo {
  username: string;
  roles: string[];
}
