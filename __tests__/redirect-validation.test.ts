/**
 * Tests for redirect path validation utility
 *
 * Validates defense-in-depth against open redirect via query strings.
 * See: t_8338ea5f — MEDIUM: Redirect validation passes through unsanitized query strings
 */

import { validateRedirectPath } from '@/lib/utils/redirect-validation'

describe('validateRedirectPath', () => {
  describe('valid allowlisted paths', () => {
    it('should return /dashboard for exact match', () => {
      expect(validateRedirectPath('/dashboard')).toBe('/dashboard')
    })

    it('should return /profile for exact match', () => {
      expect(validateRedirectPath('/profile')).toBe('/profile')
    })

    it('should return / for root path', () => {
      expect(validateRedirectPath('/')).toBe('/')
    })

    it('should return /settings for exact match', () => {
      expect(validateRedirectPath('/settings')).toBe('/settings')
    })
  })

  describe('dynamic path patterns', () => {
    it('should allow /weather/[city]', () => {
      expect(validateRedirectPath('/weather/london')).toBe('/weather/london')
    })

    it('should allow /gfs-model/[region]/[run]', () => {
      expect(validateRedirectPath('/gfs-model/us/00z')).toBe('/gfs-model/us/00z')
    })

    it('should allow /education/[topic]', () => {
      expect(validateRedirectPath('/education/hurricanes')).toBe('/education/hurricanes')
    })

    it('should reject deep nested paths under /weather', () => {
      expect(validateRedirectPath('/weather/london/extra')).toBe('/dashboard')
    })
  })

  describe('query string handling — the fix', () => {
    it('should strip query params from allowlisted paths, returning only the normalized path', () => {
      expect(validateRedirectPath('/dashboard?foo=bar')).toBe('/dashboard')
    })

    it('should strip query params from dynamic pattern paths', () => {
      expect(validateRedirectPath('/weather/london?units=metric')).toBe('/weather/london')
    })

    it('should strip fragments from allowlisted paths', () => {
      expect(validateRedirectPath('/dashboard#section')).toBe('/dashboard')
    })

    it('should strip both query params and fragments', () => {
      expect(validateRedirectPath('/dashboard?foo=bar#section')).toBe('/dashboard')
    })

    it('should handle the open-redirect-via-query attack: /dashboard?next=//evil.com', () => {
      // This is the key defense-in-depth case. Even though /dashboard is allowlisted,
      // the query param value ?next=//evil.com could be used by downstream code
      // that reads URLSearchParams to construct a redirect.
      // After the fix, validateRedirectPath returns only the normalized path,
      // stripping the dangerous query param entirely.
      expect(validateRedirectPath('/dashboard?next=//evil.com')).toBe('/dashboard')
    })

    it('should strip ?next=//evil.com from any allowlisted path', () => {
      expect(validateRedirectPath('/?next=//evil.com')).toBe('/')
      expect(validateRedirectPath('/settings?next=//evil.com')).toBe('/settings')
      expect(validateRedirectPath('/profile?next=//evil.com')).toBe('/profile')
    })

    it('should strip query params containing javascript: URI', () => {
      expect(validateRedirectPath('/dashboard?redirect=javascript:alert(1)')).toBe('/dashboard')
    })

    it('should strip query params containing data: URI', () => {
      expect(validateRedirectPath('/dashboard?x=data:text/html,<script>alert(1)</script>')).toBe('/dashboard')
    })
  })

  describe('blocked inputs', () => {
    it('should return default for null input', () => {
      expect(validateRedirectPath(null)).toBe('/dashboard')
    })

    it('should return default for empty string', () => {
      expect(validateRedirectPath('')).toBe('/dashboard')
    })

    it('should block protocol-relative URLs', () => {
      expect(validateRedirectPath('//evil.com')).toBe('/dashboard')
    })

    it('should block javascript: scheme', () => {
      expect(validateRedirectPath('javascript:alert(1)')).toBe('/dashboard')
    })

    it('should block data: scheme', () => {
      expect(validateRedirectPath('data:text/html,<script>alert(1)</script>')).toBe('/dashboard')
    })

    it('should block backslash traversal', () => {
      expect(validateRedirectPath('/dashboard\\\\evil.com')).toBe('/dashboard')
    })

    it('should block colons in path (CWE-601)', () => {
      // Colons can indicate protocol schemes
      expect(validateRedirectPath('/dashboard:evil')).toBe('/dashboard')
    })

    it('should block paths that do not start with /', () => {
      expect(validateRedirectPath('dashboard')).toBe('/dashboard')
    })

    it('should block unknown paths', () => {
      expect(validateRedirectPath('/unknown-path')).toBe('/dashboard')
    })

    it('should use custom default path when provided', () => {
      expect(validateRedirectPath('//evil.com', '/')).toBe('/')
      expect(validateRedirectPath(null, '/')).toBe('/')
    })
  })
})