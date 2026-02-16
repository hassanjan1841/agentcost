import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts text using AES-256-GCM
 * @param text - The text to encrypt
 * @returns Object containing encrypted text, iv, and auth tag (all hex strings)
 */
export function encrypt(text: string) {
    const secretKey = process.env.ENCRYPTION_KEY;
    if (!secretKey || secretKey.length !== 64) {
        throw new Error('ENCRYPTION_KEY must be set and be exactly 64 hex characters (32 bytes)');
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(secretKey, 'hex');

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
    };
}

/**
 * Decrypts text using AES-256-GCM
 * @param encrypted - Encrypted text (hex)
 * @param iv - Initialization vector (hex)
 * @param authTag - Authentication tag (hex)
 * @returns Decrypted text
 */
export function decrypt(encrypted: string, iv: string, authTag: string) {
    const secretKey = process.env.ENCRYPTION_KEY;
    if (!secretKey || secretKey.length !== 64) {
        throw new Error('ENCRYPTION_KEY must be set and be exactly 64 hex characters (32 bytes)');
    }

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        Buffer.from(secretKey, 'hex'),
        Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Mask a key for display (e.g., sk-proj...ABcd)
 * @param key - The full key
 * @returns Masked key
 */
export function maskKey(key: string): string {
    if (key.length < 8) return '********';
    const start = key.slice(0, 4); // First 4
    const end = key.slice(-4);     // Last 4
    return `${start}...${end}`;
}
