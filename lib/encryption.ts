import crypto from 'crypto';

const ENCRYPTION_KEY_STR = process.env.ENCRYPTION_KEY || 'default_32_char_key_for_dev_only_!!';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(ENCRYPTION_KEY_STR).digest();

const FALLBACK_KEY_STR = 'default_32_char_key_for_dev_only_!!';
const FALLBACK_KEY = crypto.createHash('sha256').update(FALLBACK_KEY_STR).digest();

const IV_LENGTH = 16;

export function encrypt(text: string) {
  if (!text) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function attemptDecrypt(text: string, key: Buffer) {
  try {
    const textParts = text.split(':');
    if (textParts.length < 2) return null;
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return null;
  }
}

export function decrypt(text: string) {
  if (!text || !text.includes(':')) return "";

  // Try primary key
  let result = attemptDecrypt(text, ENCRYPTION_KEY);

  // If failed and primary isn't the fallback, try fallback
  if (result === null && ENCRYPTION_KEY_STR !== FALLBACK_KEY_STR) {
    result = attemptDecrypt(text, FALLBACK_KEY);
  }

  return result || "";
}
