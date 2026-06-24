/**
 * Client-Side Encryption Utilities for the Password Vault
 * Uses Web Crypto API (AES-GCM 256-bit) with PBKDF2 key derivation.
 */

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper to encode string to Uint8Array
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Encrypt a text string using AES-GCM and a master password.
 */
export async function encryptText(
  plainText: string,
  masterKeyStr: string
): Promise<{ encryptedStr: string; ivStr: string; saltStr: string }> {
  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Derive a cryptographic key from the password
    const rawKey = encoder.encode(masterKeyStr);
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      rawKey,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    // Encrypt the plain text
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      derivedKey,
      encoder.encode(plainText)
    );

    return {
      encryptedStr: arrayBufferToBase64(encryptedBuffer),
      ivStr: arrayBufferToBase64(iv.buffer),
      saltStr: arrayBufferToBase64(salt.buffer),
    };
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Client encryption failure.");
  }
}

/**
 * Decrypt a text string using AES-GCM and the master password.
 */
export async function decryptText(
  encryptedStr: string,
  ivStr: string,
  saltStr: string,
  masterKeyStr: string
): Promise<string> {
  try {
    const encryptedBuffer = base64ToArrayBuffer(encryptedStr);
    const iv = new Uint8Array(base64ToArrayBuffer(ivStr));
    const salt = new Uint8Array(base64ToArrayBuffer(saltStr));

    // Derive the same key
    const rawKey = encoder.encode(masterKeyStr);
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      rawKey,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // Decrypt
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      derivedKey,
      encryptedBuffer
    );

    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed. Invalid Master Password?", error);
    throw new Error("Decryption failed. Please verify your Master Password is correct.");
  }
}
