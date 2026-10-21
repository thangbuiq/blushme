const PBKDF2_ITERATIONS = 150_000
const SALT_BYTES = 16
const IV_BYTES = 12

async function deriveKey(pin: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

function toBase64(bytes: Uint8Array<ArrayBuffer>): string {
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(
    atob(value)
      .split('')
      .map((c) => c.charCodeAt(0)),
  )
}

// Format: base64(salt).base64(iv).base64(ciphertext)
export async function encryptWithPin(plaintext: string, pin: string): Promise<string> {
  const salt: Uint8Array<ArrayBuffer> = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv: Uint8Array<ArrayBuffer> = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(pin, salt)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  )
  return [toBase64(salt), toBase64(iv), toBase64(new Uint8Array(ciphertext))].join('.')
}

export async function decryptWithPin(payload: string, pin: string): Promise<string> {
  const [saltB64, ivB64, ciphertextB64] = payload.split('.')
  const salt = fromBase64(saltB64)
  const iv = fromBase64(ivB64)
  const ciphertext = fromBase64(ciphertextB64)
  const key = await deriveKey(pin, salt)
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return new TextDecoder().decode(plaintext)
}

export async function hashPin(pin: string): Promise<string> {
  const salt: Uint8Array<ArrayBuffer> = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const key = await deriveKey(pin, salt)
  const raw = await crypto.subtle.exportKey('raw', key)
  return [toBase64(salt), toBase64(new Uint8Array(raw))].join('.')
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  const [saltB64, expectedKeyB64] = hash.split('.')
  const salt = fromBase64(saltB64)
  const key = await deriveKey(pin, salt)
  const raw = await crypto.subtle.exportKey('raw', key)
  return toBase64(new Uint8Array(raw)) === expectedKeyB64
}
