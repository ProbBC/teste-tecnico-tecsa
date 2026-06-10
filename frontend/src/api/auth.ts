import type {
  AuthResult,
  LoginPayload,
  ProfilePayload,
  RegisterPayload,
  User,
} from '../types/auth';
import { request } from './client';

interface Wrapped<T> {
  data: T;
}

export function register(payload: RegisterPayload): Promise<AuthResult> {
  return request<Wrapped<AuthResult>>('/auth/register', {
    method: 'POST',
    body: payload,
  }).then((r) => r.data);
}

export function login(payload: LoginPayload): Promise<AuthResult> {
  return request<Wrapped<AuthResult>>('/auth/login', {
    method: 'POST',
    body: payload,
  }).then((r) => r.data);
}

export function me(): Promise<User> {
  return request<Wrapped<User>>('/auth/me').then((r) => r.data);
}

export function updateProfile(payload: ProfilePayload): Promise<User> {
  return request<Wrapped<User>>('/auth/me', {
    method: 'PATCH',
    body: payload,
  }).then((r) => r.data);
}

export function logout(): Promise<unknown> {
  return request('/auth/logout', { method: 'POST' });
}
