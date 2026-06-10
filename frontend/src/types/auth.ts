export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
}

export interface AuthResult {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  age: number;
  weight: number;
  height: number;
}

export interface ProfilePayload {
  name: string;
  age: number;
  weight: number;
  height: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}
