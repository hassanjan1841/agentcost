import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Session user object
 */
export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Hash a password using bcryptjs
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

/**
 * Verify password against hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/**
 * Generate JWT token
 * @param userId - User ID
 * @param email - User email
 * @returns JWT token string
 */
export function generateJWT(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters');
  }

  return jwt.sign(
    { userId, email },
    secret,
    { expiresIn: expiresIn as any }
  );
}

/**
 * Verify JWT token
 * @param token - JWT token string
 * @returns Payload if valid, null if invalid or expired
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not set');
    }

    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a random token for email verification or password reset
 * @returns Random hex string (64 characters)
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate API key for SDK
 * @returns API key with ak_ prefix
 */
export function generateAPIKey(): string {
  return 'ak_' + crypto.randomBytes(24).toString('hex');
}

/**
 * Hash an API key using SHA256
 * @param key - Plain text API key
 * @returns Hashed key
 */
export function hashAPIKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * @param password - Password to validate
 * @returns True if password is strong
 */
export function isStrongPassword(password: string): boolean {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false; // Uppercase
  if (!/[a-z]/.test(password)) return false; // Lowercase
  if (!/[0-9]/.test(password)) return false; // Number
  return true;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get password strength feedback
 * @param password - Password to check
 * @returns Array of missing requirements
 */
export function getPasswordFeedback(password: string): string[] {
  const feedback: string[] = [];

  if (!password) {
    feedback.push('Password is required');
    return feedback;
  }

  if (password.length < 8) {
    feedback.push('At least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    feedback.push('At least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    feedback.push('At least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    feedback.push('At least one number');
  }

  return feedback;
}

/**
 * Sanitize email (lowercase and trim)
 * @param email - Email to sanitize
 * @returns Sanitized email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Extract user info from JWT payload
 * @param payload - JWT payload
 * @returns Session user object
 */
export function extractUserFromPayload(payload: JWTPayload): Partial<SessionUser> {
  return {
    id: payload.userId,
    email: payload.email,
  };
}
