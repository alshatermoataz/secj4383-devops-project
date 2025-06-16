import { Request } from 'express';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  displayName?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export type AuthRequest = Request | AuthenticatedRequest; 