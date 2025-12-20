import bcrypt from 'bcryptjs';

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}
