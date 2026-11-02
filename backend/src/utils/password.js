import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { resetToken, hashedToken, expiresAt };
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
