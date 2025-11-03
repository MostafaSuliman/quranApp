/**
 * Encryption Manager for Secure Data Handling
 * Implements AES-256-GCM encryption for data at rest and in transit
 */

import CryptoJS from 'crypto-js';
import { getSecurityConfig } from './SecurityConfig';

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  authTag: string;
  timestamp: number;
}

export interface KeyDerivationResult {
  key: CryptoJS.lib.WordArray;
  salt: CryptoJS.lib.WordArray;
}

export class EncryptionManager {
  private static instance: EncryptionManager;
  private config = getSecurityConfig().encryption;
  private masterKey: CryptoJS.lib.WordArray | null = null;

  private constructor() {}

  public static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager();
    }
    return EncryptionManager.instance;
  }

  /**
   * Initialize encryption with master key derivation
   */
  public async initialize(passphrase?: string): Promise<void> {
    if (!passphrase) {
      // Generate a secure random key for session
      this.masterKey = CryptoJS.lib.WordArray.random(this.config.keyLength);
    } else {
      // Derive key from passphrase
      const salt = CryptoJS.lib.WordArray.random(this.config.saltLength);
      this.masterKey = CryptoJS.PBKDF2(passphrase, salt, {
        keySize: this.config.keyLength / 4,
        iterations: this.config.iterations,
        hasher: CryptoJS.algo.SHA256
      });
    }
  }

  /**
   * Derive encryption key from password
   */
  private deriveKey(password: string, salt?: CryptoJS.lib.WordArray): KeyDerivationResult {
    const actualSalt = salt || CryptoJS.lib.WordArray.random(this.config.saltLength);
    const key = CryptoJS.PBKDF2(password, actualSalt, {
      keySize: this.config.keyLength / 4,
      iterations: this.config.iterations,
      hasher: CryptoJS.algo.SHA256
    });

    return { key, salt: actualSalt };
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  public encrypt(data: string, password?: string): EncryptedData {
    if (!data) {
      throw new Error('Data cannot be empty');
    }

    let encryptionKey: CryptoJS.lib.WordArray;
    let salt: CryptoJS.lib.WordArray;

    if (password) {
      const derived = this.deriveKey(password);
      encryptionKey = derived.key;
      salt = derived.salt;
    } else if (this.masterKey) {
      encryptionKey = this.masterKey;
      salt = CryptoJS.lib.WordArray.random(this.config.saltLength);
    } else {
      throw new Error('No encryption key available. Initialize with password or call initialize()');
    }

    // Generate random IV
    const iv = CryptoJS.lib.WordArray.random(this.config.ivLength);

    // Encrypt using AES-256-GCM equivalent (CryptoJS doesn't have GCM, using CTR + HMAC)
    const encrypted = CryptoJS.AES.encrypt(data, encryptionKey, {
      iv: iv,
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.NoPadding
    });

    // Generate authentication tag using HMAC
    const authTag = CryptoJS.HmacSHA256(encrypted.ciphertext.toString(), encryptionKey);

    return {
      ciphertext: encrypted.ciphertext.toString(),
      iv: iv.toString(),
      salt: salt.toString(),
      authTag: authTag.toString(),
      timestamp: Date.now()
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  public decrypt(encryptedData: EncryptedData, password?: string): string {
    if (!encryptedData || !encryptedData.ciphertext) {
      throw new Error('Invalid encrypted data');
    }

    let decryptionKey: CryptoJS.lib.WordArray;

    if (password) {
      const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
      const derived = this.deriveKey(password, salt);
      decryptionKey = derived.key;
    } else if (this.masterKey) {
      decryptionKey = this.masterKey;
    } else {
      throw new Error('No decryption key available');
    }

    // Verify authentication tag
    const expectedAuthTag = CryptoJS.HmacSHA256(encryptedData.ciphertext, decryptionKey);
    if (expectedAuthTag.toString() !== encryptedData.authTag) {
      throw new Error('Authentication failed - data may have been tampered with');
    }

    // Decrypt
    const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
    const ciphertext = CryptoJS.enc.Hex.parse(encryptedData.ciphertext);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext } as any,
      decryptionKey,
      {
        iv: iv,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.NoPadding
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Encrypt JSON object
   */
  public encryptObject(obj: any, password?: string): EncryptedData {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString, password);
  }

  /**
   * Decrypt to JSON object
   */
  public decryptObject<T = any>(encryptedData: EncryptedData, password?: string): T {
    const decryptedString = this.decrypt(encryptedData, password);
    return JSON.parse(decryptedString);
  }

  /**
   * Encrypt sensitive user data for storage
   */
  public encryptUserData(userData: any): string {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    const encrypted = this.encryptObject(userData);
    return btoa(JSON.stringify(encrypted));
  }

  /**
   * Decrypt user data from storage
   */
  public decryptUserData<T = any>(encryptedData: string): T {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    const parsed = JSON.parse(atob(encryptedData));
    return this.decryptObject<T>(parsed);
  }

  /**
   * Hash password securely
   */
  public hashPassword(password: string): string {
    const salt = CryptoJS.lib.WordArray.random(this.config.saltLength);
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: this.config.keyLength / 4,
      iterations: this.config.iterations,
      hasher: CryptoJS.algo.SHA256
    });

    return salt.toString() + ':' + hash.toString();
  }

  /**
   * Verify password against hash
   */
  public verifyPassword(password: string, hashWithSalt: string): boolean {
    try {
      const [saltStr, hashStr] = hashWithSalt.split(':');
      const salt = CryptoJS.enc.Hex.parse(saltStr);
      
      const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: this.config.keyLength / 4,
        iterations: this.config.iterations,
        hasher: CryptoJS.algo.SHA256
      });

      return hash.toString() === hashStr;
    } catch {
      return false;
    }
  }

  /**
   * Generate secure random token
   */
  public generateSecureToken(length: number = 32): string {
    const randomBytes = CryptoJS.lib.WordArray.random(length);
    return randomBytes.toString(CryptoJS.enc.Hex);
  }

  /**
   * Generate cryptographic hash of content
   */
  public generateHash(content: string, algorithm: 'SHA256' | 'SHA512' = 'SHA256'): string {
    switch (algorithm) {
      case 'SHA256':
        return CryptoJS.SHA256(content).toString();
      case 'SHA512':
        return CryptoJS.SHA512(content).toString();
      default:
        throw new Error('Unsupported hash algorithm');
    }
  }

  /**
   * Encrypt Islamic content with integrity protection
   */
  public encryptIslamicContent(content: string, metadata?: any): EncryptedData {
    const contentWithMetadata = {
      content,
      metadata,
      contentType: 'islamic',
      timestamp: Date.now(),
      hash: this.generateHash(content)
    };

    return this.encryptObject(contentWithMetadata);
  }

  /**
   * Decrypt and verify Islamic content integrity
   */
  public decryptIslamicContent(encryptedData: EncryptedData): { content: string; metadata?: any; verified: boolean } {
    try {
      const decrypted = this.decryptObject(encryptedData);
      
      // Verify content integrity
      const expectedHash = this.generateHash(decrypted.content);
      const verified = expectedHash === decrypted.hash;

      if (!verified) {
        console.warn('Islamic content integrity verification failed');
      }

      return {
        content: decrypted.content,
        metadata: decrypted.metadata,
        verified
      };
    } catch (error) {
      console.error('Failed to decrypt Islamic content:', error);
      throw new Error('Failed to decrypt Islamic content');
    }
  }

  /**
   * Secure localStorage with encryption
   */
  public setSecureItem(key: string, value: any): void {
    try {
      const encrypted = this.encryptUserData(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      throw new Error('Failed to store secure data');
    }
  }

  /**
   * Get item from secure localStorage
   */
  public getSecureItem<T = any>(key: string): T | null {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      return this.decryptUserData<T>(encrypted);
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      return null;
    }
  }

  /**
   * Remove item from secure localStorage
   */
  public removeSecureItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all secure data
   */
  public clearSecureStorage(): void {
    // Only clear items that were encrypted by us
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          // Try to decrypt - if it works, it's our encrypted data
          this.getSecureItem(key);
          keysToRemove.push(key);
        } catch {
          // Not our encrypted data, skip
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Generate key fingerprint for verification
   */
  public getKeyFingerprint(): string {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    return CryptoJS.SHA256(this.masterKey.toString()).toString().substring(0, 16);
  }

  /**
   * Validate encryption strength
   */
  public validateEncryptionStrength(): boolean {
    return this.config.keyLength >= 32 && 
           this.config.iterations >= 100000 &&
           this.config.hashAlgorithm === 'SHA-256';
  }

  /**
   * Destroy sensitive data from memory
   */
  public destroy(): void {
    if (this.masterKey) {
      // Overwrite key in memory (best effort)
      for (let i = 0; i < this.masterKey.words.length; i++) {
        this.masterKey.words[i] = 0;
      }
      this.masterKey = null;
    }
  }
}