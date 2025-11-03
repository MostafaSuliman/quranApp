/**
 * Authentication and Authorization Manager
 * Implements secure authentication with 2FA, JWT tokens, and session management
 */

import { getSecurityConfig } from './SecurityConfig';
import { EncryptionManager } from './EncryptionManager';
import CryptoJS from 'crypto-js';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
  profile: UserProfile;
  security: UserSecurity;
  preferences: UserPreferences;
}

export interface UserProfile {
  displayName: string;
  preferredLanguage: 'ar' | 'en';
  timezone: string;
  lastLogin: number;
  createdAt: number;
}

export interface UserSecurity {
  passwordHash: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes: string[];
  failedLoginAttempts: number;
  lockedUntil?: number;
  sessionTokens: string[];
  lastPasswordChange: number;
}

export interface UserPreferences {
  notifications: boolean;
  dataSharing: boolean;
  analytics: boolean;
  marketing: boolean;
}

export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

export type Permission = 
  | 'read_content'
  | 'write_content'
  | 'moderate_content'
  | 'manage_users'
  | 'system_admin'
  | 'content_admin'
  | 'security_admin';

export interface AuthSession {
  sessionId: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
  ipAddress: string;
  userAgent: string;
  created: number;
  lastActivity: number;
}

export interface LoginAttempt {
  email: string;
  ipAddress: string;
  userAgent: string;
  timestamp: number;
  success: boolean;
  failureReason?: string;
}

export class AuthenticationManager {
  private static instance: AuthenticationManager;
  private config = getSecurityConfig().auth;
  private encryption = EncryptionManager.getInstance();
  private sessions: Map<string, AuthSession> = new Map();
  private loginAttempts: LoginAttempt[] = [];
  private rateLimitMap: Map<string, number[]> = new Map();

  private constructor() {
    this.initializeAuthSystem();
  }

  public static getInstance(): AuthenticationManager {
    if (!AuthenticationManager.instance) {
      AuthenticationManager.instance = new AuthenticationManager();
    }
    return AuthenticationManager.instance;
  }

  /**
   * Initialize authentication system
   */
  private async initializeAuthSystem(): Promise<void> {
    await this.encryption.initialize();
    this.setupSessionCleanup();
    this.loadPersistedSessions();
  }

  /**
   * Register new user with security validations
   */
  public async registerUser(userData: {
    email: string;
    username: string;
    password: string;
    displayName: string;
    preferredLanguage?: 'ar' | 'en';
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validate input
      const validation = this.validateRegistrationData(userData);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Check rate limiting
      if (this.isRateLimited(userData.email)) {
        return { success: false, error: 'Too many registration attempts. Please try again later.' };
      }

      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      // Hash password
      const passwordHash = this.encryption.hashPassword(userData.password);

      // Create user
      const user: User = {
        id: this.generateUserId(),
        email: userData.email.toLowerCase().trim(),
        username: userData.username.trim(),
        role: 'user',
        permissions: ['read_content'],
        profile: {
          displayName: userData.displayName.trim(),
          preferredLanguage: userData.preferredLanguage || 'ar',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          lastLogin: 0,
          createdAt: Date.now()
        },
        security: {
          passwordHash,
          twoFactorEnabled: false,
          backupCodes: [],
          failedLoginAttempts: 0,
          sessionTokens: [],
          lastPasswordChange: Date.now()
        },
        preferences: {
          notifications: true,
          dataSharing: false,
          analytics: false,
          marketing: false
        }
      };

      // Store user securely
      await this.storeUser(user);

      // Remove password from response
      const safeUser = { ...user };
      delete (safeUser.security as any).passwordHash;

      return { success: true, user: safeUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Authenticate user login
   */
  public async login(credentials: {
    email: string;
    password: string;
    twoFactorCode?: string;
    rememberMe?: boolean;
  }): Promise<{ success: boolean; session?: AuthSession; user?: User; error?: string; requiresTwoFactor?: boolean }> {
    const ipAddress = this.getClientIP();
    const userAgent = navigator.userAgent;

    try {
      // Rate limiting check
      if (this.isRateLimited(credentials.email)) {
        this.logLoginAttempt(credentials.email, ipAddress, userAgent, false, 'Rate limited');
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }

      // Get user
      const user = await this.getUserByEmail(credentials.email);
      if (!user) {
        this.logLoginAttempt(credentials.email, ipAddress, userAgent, false, 'User not found');
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if account is locked
      if (user.security.lockedUntil && Date.now() < user.security.lockedUntil) {
        this.logLoginAttempt(credentials.email, ipAddress, userAgent, false, 'Account locked');
        return { success: false, error: 'Account is temporarily locked. Please try again later.' };
      }

      // Verify password
      const passwordValid = this.encryption.verifyPassword(credentials.password, user.security.passwordHash);
      if (!passwordValid) {
        await this.handleFailedLogin(user);
        this.logLoginAttempt(credentials.email, ipAddress, userAgent, false, 'Invalid password');
        return { success: false, error: 'Invalid credentials' };
      }

      // Check for 2FA requirement
      if (user.security.twoFactorEnabled) {
        if (!credentials.twoFactorCode) {
          return { success: false, requiresTwoFactor: true };
        }

        const twoFactorValid = await this.verifyTwoFactor(user, credentials.twoFactorCode);
        if (!twoFactorValid) {
          this.logLoginAttempt(credentials.email, ipAddress, userAgent, false, 'Invalid 2FA code');
          return { success: false, error: 'Invalid two-factor authentication code' };
        }
      }

      // Reset failed login attempts
      user.security.failedLoginAttempts = 0;
      user.security.lockedUntil = undefined;
      user.profile.lastLogin = Date.now();

      // Create session
      const session = await this.createSession(user, ipAddress, userAgent, credentials.rememberMe);

      // Update user
      await this.storeUser(user);

      this.logLoginAttempt(credentials.email, ipAddress, userAgent, true);

      // Remove sensitive data from response
      const safeUser = { ...user };
      delete (safeUser.security as any).passwordHash;
      delete (safeUser.security as any).twoFactorSecret;

      return { success: true, session, user: safeUser };
    } catch (error) {
      console.error('Login error:', error);
      this.logLoginAttempt(credentials.email, ipAddress, userAgent, false, 'System error');
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * Create authenticated session
   */
  private async createSession(user: User, ipAddress: string, userAgent: string, rememberMe?: boolean): Promise<AuthSession> {
    const sessionId = this.encryption.generateSecureToken(32);
    const token = this.generateJWT(user, sessionId);
    const refreshToken = this.encryption.generateSecureToken(64);

    const session: AuthSession = {
      sessionId,
      userId: user.id,
      token,
      refreshToken,
      expiresAt: Date.now() + this.config.sessionTimeout,
      refreshExpiresAt: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000), // 30 days if remember me, 7 days otherwise
      ipAddress,
      userAgent,
      created: Date.now(),
      lastActivity: Date.now()
    };

    // Store session
    this.sessions.set(sessionId, session);
    user.security.sessionTokens.push(sessionId);

    // Persist session
    this.encryption.setSecureItem(`session_${sessionId}`, session);

    return session;
  }

  /**
   * Validate session token
   */
  public async validateSession(token: string): Promise<{ valid: boolean; user?: User; session?: AuthSession }> {
    try {
      // Decode JWT to get session ID
      const decoded = this.decodeJWT(token);
      if (!decoded || !decoded.sessionId) {
        return { valid: false };
      }

      // Get session
      const session = this.sessions.get(decoded.sessionId);
      if (!session) {
        return { valid: false };
      }

      // Check expiration
      if (Date.now() > session.expiresAt) {
        await this.destroySession(session.sessionId);
        return { valid: false };
      }

      // Get user
      const user = await this.getUserById(session.userId);
      if (!user) {
        await this.destroySession(session.sessionId);
        return { valid: false };
      }

      // Update last activity
      session.lastActivity = Date.now();
      this.sessions.set(session.sessionId, session);

      // Remove sensitive data
      const safeUser = { ...user };
      delete (safeUser.security as any).passwordHash;
      delete (safeUser.security as any).twoFactorSecret;

      return { valid: true, user: safeUser, session };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  /**
   * Refresh authentication token
   */
  public async refreshToken(refreshToken: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // Find session by refresh token
      let targetSession: AuthSession | null = null;
      for (const session of this.sessions.values()) {
        if (session.refreshToken === refreshToken) {
          targetSession = session;
          break;
        }
      }

      if (!targetSession) {
        return { success: false, error: 'Invalid refresh token' };
      }

      // Check refresh token expiration
      if (Date.now() > targetSession.refreshExpiresAt) {
        await this.destroySession(targetSession.sessionId);
        return { success: false, error: 'Refresh token expired' };
      }

      // Get user
      const user = await this.getUserById(targetSession.userId);
      if (!user) {
        await this.destroySession(targetSession.sessionId);
        return { success: false, error: 'User not found' };
      }

      // Generate new token
      const newToken = this.generateJWT(user, targetSession.sessionId);
      targetSession.token = newToken;
      targetSession.expiresAt = Date.now() + this.config.sessionTimeout;
      targetSession.lastActivity = Date.now();

      // Update session
      this.sessions.set(targetSession.sessionId, targetSession);
      this.encryption.setSecureItem(`session_${targetSession.sessionId}`, targetSession);

      return { success: true, token: newToken };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: 'Token refresh failed' };
    }
  }

  /**
   * Logout user and destroy session
   */
  public async logout(sessionId: string): Promise<void> {
    await this.destroySession(sessionId);
  }

  /**
   * Destroy user session
   */
  private async destroySession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Remove from user's session tokens
      const user = await this.getUserById(session.userId);
      if (user) {
        user.security.sessionTokens = user.security.sessionTokens.filter(id => id !== sessionId);
        await this.storeUser(user);
      }

      // Remove session
      this.sessions.delete(sessionId);
      this.encryption.removeSecureItem(`session_${sessionId}`);
    }
  }

  /**
   * Get JWT secret from environment or generate secure fallback
   */
  private getJWTSecret(): string {
    // Try to get from environment variable
    const envSecret = import.meta.env.JWT_SECRET;

    if (envSecret && envSecret !== 'your-secure-jwt-secret-here-change-this-in-production') {
      return envSecret;
    }

    // In production, throw error if no secret is configured
    if (import.meta.env.MODE === 'production') {
      throw new Error('JWT_SECRET must be configured in production environment');
    }

    // Development fallback - warn developer
    console.warn('⚠️ WARNING: Using development JWT secret. Configure JWT_SECRET in .env for production!');

    // Generate a session-specific secret for development
    const sessionSecret = sessionStorage.getItem('dev_jwt_secret');
    if (sessionSecret) {
      return sessionSecret;
    }

    const newSecret = CryptoJS.lib.WordArray.random(64).toString();
    sessionStorage.setItem('dev_jwt_secret', newSecret);
    return newSecret;
  }

  /**
   * Generate JWT token with secure secret
   */
  private generateJWT(user: User, sessionId: string): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      userId: user.id,
      sessionId,
      role: user.role,
      permissions: user.permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + this.config.tokenExpiry) / 1000)
    };

    const headerEncoded = btoa(JSON.stringify(header));
    const payloadEncoded = btoa(JSON.stringify(payload));

    // Use secure secret from environment
    const secret = this.getJWTSecret();
    const signature = CryptoJS.HmacSHA256(`${headerEncoded}.${payloadEncoded}`, secret).toString();

    return `${headerEncoded}.${payloadEncoded}.${signature}`;
  }

  /**
   * Decode JWT token
   */
  private decodeJWT(token: string): any {
    try {
      const [header, payload, signature] = token.split('.');
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  /**
   * Setup 2FA for user
   */
  public async setupTwoFactor(userId: string): Promise<{ success: boolean; secret?: string; qrCode?: string; backupCodes?: string[] }> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        return { success: false };
      }

      // Generate 2FA secret
      const secret = this.encryption.generateSecureToken(32);
      
      // Generate backup codes
      const backupCodes = Array.from({ length: this.config.twoFactorAuth.backupCodesCount }, () => 
        this.encryption.generateSecureToken(8).toUpperCase()
      );

      // Update user
      user.security.twoFactorSecret = secret;
      user.security.backupCodes = backupCodes.map(code => this.encryption.hashPassword(code));
      
      await this.storeUser(user);

      // Generate QR code data
      const qrCode = `otpauth://totp/${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent('QuranApp')}`;

      return {
        success: true,
        secret,
        qrCode,
        backupCodes
      };
    } catch (error) {
      console.error('2FA setup error:', error);
      return { success: false };
    }
  }

  /**
   * Enable 2FA after verification
   */
  public async enableTwoFactor(userId: string, verificationCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.security.twoFactorSecret) {
        return { success: false, error: 'Two-factor authentication not set up' };
      }

      // Verify the code
      const isValid = await this.verifyTwoFactor(user, verificationCode);
      if (!isValid) {
        return { success: false, error: 'Invalid verification code' };
      }

      // Enable 2FA
      user.security.twoFactorEnabled = true;
      await this.storeUser(user);

      return { success: true };
    } catch (error) {
      console.error('2FA enable error:', error);
      return { success: false, error: 'Failed to enable two-factor authentication' };
    }
  }

  /**
   * Verify 2FA code
   */
  private async verifyTwoFactor(user: User, code: string): Promise<boolean> {
    if (!user.security.twoFactorSecret) {
      return false;
    }

    // Check if it's a backup code
    for (const hashedCode of user.security.backupCodes) {
      if (this.encryption.verifyPassword(code, hashedCode)) {
        // Remove used backup code
        user.security.backupCodes = user.security.backupCodes.filter(c => c !== hashedCode);
        await this.storeUser(user);
        return true;
      }
    }

    // Verify TOTP code (simplified - in production use a proper TOTP library)
    const timeStep = Math.floor(Date.now() / 30000);
    const expectedCode = this.generateTOTP(user.security.twoFactorSecret, timeStep);
    
    return code === expectedCode;
  }

  /**
   * Generate TOTP code (simplified implementation)
   */
  private generateTOTP(secret: string, timeStep: number): string {
    const hmac = CryptoJS.HmacSHA1(timeStep.toString(), secret);
    const code = parseInt(hmac.toString().slice(-6), 16) % 1000000;
    return code.toString().padStart(6, '0');
  }

  /**
   * Validate registration data
   */
  private validateRegistrationData(data: any): { valid: boolean; error?: string } {
    if (!data.email || !this.isValidEmail(data.email)) {
      return { valid: false, error: 'Invalid email address' };
    }

    if (!data.username || data.username.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' };
    }

    if (!this.isValidPassword(data.password)) {
      return { valid: false, error: 'Password does not meet security requirements' };
    }

    if (!data.displayName || data.displayName.trim().length === 0) {
      return { valid: false, error: 'Display name is required' };
    }

    return { valid: true };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private isValidPassword(password: string): boolean {
    const policy = this.config.passwordPolicy;
    
    if (password.length < policy.minLength) return false;
    if (policy.requireUppercase && !/[A-Z]/.test(password)) return false;
    if (policy.requireLowercase && !/[a-z]/.test(password)) return false;
    if (policy.requireNumbers && !/\d/.test(password)) return false;
    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

    return true;
  }

  /**
   * Handle failed login attempt
   */
  private async handleFailedLogin(user: User): Promise<void> {
    user.security.failedLoginAttempts++;
    
    if (user.security.failedLoginAttempts >= this.config.maxLoginAttempts) {
      user.security.lockedUntil = Date.now() + this.config.lockoutDuration;
    }

    await this.storeUser(user);
  }

  /**
   * Check rate limiting
   */
  private isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.rateLimitMap.get(identifier) || [];
    
    // Remove old attempts
    const recentAttempts = attempts.filter(time => now - time < this.config.lockoutDuration);
    
    // Update map
    this.rateLimitMap.set(identifier, recentAttempts);
    
    return recentAttempts.length >= this.config.maxLoginAttempts;
  }

  /**
   * Log login attempt
   */
  private logLoginAttempt(email: string, ipAddress: string, userAgent: string, success: boolean, failureReason?: string): void {
    const attempt: LoginAttempt = {
      email,
      ipAddress,
      userAgent,
      timestamp: Date.now(),
      success,
      failureReason
    };

    this.loginAttempts.push(attempt);

    // Keep only recent attempts
    this.loginAttempts = this.loginAttempts.filter(
      attempt => Date.now() - attempt.timestamp < 24 * 60 * 60 * 1000 // 24 hours
    );

    // Update rate limiting
    if (!success) {
      const attempts = this.rateLimitMap.get(email) || [];
      attempts.push(Date.now());
      this.rateLimitMap.set(email, attempts);
    }
  }

  /**
   * Generate unique user ID
   */
  private generateUserId(): string {
    return 'user_' + this.encryption.generateSecureToken(16);
  }

  /**
   * Get client IP address
   */
  private getClientIP(): string {
    // In a real application, this would be provided by the server
    return 'unknown';
  }

  /**
   * Store user securely
   */
  private async storeUser(user: User): Promise<void> {
    this.encryption.setSecureItem(`user_${user.id}`, user);
    this.encryption.setSecureItem(`user_email_${user.email}`, user.id);
  }

  /**
   * Get user by ID
   */
  private async getUserById(userId: string): Promise<User | null> {
    return this.encryption.getSecureItem<User>(`user_${userId}`);
  }

  /**
   * Get user by email
   */
  private async getUserByEmail(email: string): Promise<User | null> {
    const userId = this.encryption.getSecureItem<string>(`user_email_${email.toLowerCase()}`);
    if (!userId) return null;
    return await this.getUserById(userId);
  }

  /**
   * Setup session cleanup
   */
  private setupSessionCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.sessions.entries()) {
        if (now > session.expiresAt) {
          this.destroySession(sessionId);
        }
      }
    }, 300000); // Check every 5 minutes
  }

  /**
   * Load persisted sessions
   */
  private loadPersistedSessions(): void {
    // This would load sessions from secure storage on app start
    // Implementation depends on storage backend
  }

  /**
   * Get current user from token
   */
  public async getCurrentUser(token: string): Promise<User | null> {
    const validation = await this.validateSession(token);
    return validation.valid ? validation.user || null : null;
  }

  /**
   * Check if user has permission
   */
  public hasPermission(user: User, permission: Permission): boolean {
    return user.permissions.includes(permission) || user.role === 'super_admin';
  }

  /**
   * Get login attempts for monitoring
   */
  public getLoginAttempts(): LoginAttempt[] {
    return [...this.loginAttempts];
  }

  /**
   * Clear all user sessions
   */
  public async clearAllSessions(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (user) {
      for (const sessionId of user.security.sessionTokens) {
        await this.destroySession(sessionId);
      }
      user.security.sessionTokens = [];
      await this.storeUser(user);
    }
  }
}