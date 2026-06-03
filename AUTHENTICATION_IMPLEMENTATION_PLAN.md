# DETAILED AUTHENTICATION IMPLEMENTATION PLAN - FIXING 15 ISSUES

## Executive Summary
- **Project**: Mentora (Next.js 14 + Express.js + MongoDB)
- **Status**: Token rotation with httpOnly cookies already implemented ✓
- **Issues**: 15 authentication vulnerabilities to fix
- **Estimated Effort**: 40-60 hours
- **Priority**: CRITICAL - Security

## Quick Reference: 15 Issues Map

| Issue | Category | Severity | Location | Status |
|-------|----------|----------|----------|--------|
| #1 | Register | HIGH | Frontend setAuth | Blocking localStorage |
| #2 | Login | HIGH | Frontend axios | Already fixed ✓ |
| #3 | Refresh | HIGH | Error handling | Missing error codes |
| #4 | Register | CRITICAL | Password validation | No backend enforcement |
| #5 | Refresh | HIGH | Race condition | Atomic ops needed |
| #6 | Register/Login | HIGH | Rate limiting | Weak limits, no backoff |
| #7 | Login | CRITICAL | User block bypass | Missing revoke on block |
| #8 | Login | HIGH | Timing attack | Variable response times |
| #9 | Config | CRITICAL | JWT secrets | Exposed in git |
| #10 | Register/Login | MEDIUM | Email normalization | Partial (schema only) |
| #11 | Register/Login | MEDIUM | Error codes | Missing across endpoints |
| #12 | - | - | - | (not defined) |
| #13 | Config | MEDIUM | Secure cookie flag | Dev/prod aware needed |
| #14 | Config | MEDIUM | CORS | Hardcoded domains |
| #15 | - | - | - | (not defined) |

---

## PHASE 1: REGISTER COMPONENT (5 Issues)

### Issue #1: Remove localStorage Storage
**File**: `frontend/src/app/(auth)/register/page.jsx:60-78`
**Impact**: XSS vulnerability - tokens exposed to JavaScript

**Change**: Remove lines storing to localStorage/document.cookie
- Delete: `document.cookie = ...`
- Delete: `localStorage.setItem("token", token)`
- Keep: `setAuth(user)` (updates auth store only)
- Rely on: httpOnly cookies from backend

---

### Issue #4: Backend Password Validation
**File**: `backend/src/controllers/authController.js:188-210`
**Impact**: Weak passwords accepted despite frontend validation

**Changes**:
1. Create: `backend/src/utils/passwordValidator.js`
   - Function: `validatePasswordStrength(password)`
   - Rules: 8+ chars, uppercase, lowercase, numbers
   
2. Update authController.js register():
   - Import password validator
   - Add validation before User.create()
   - Return error code: `WEAK_PASSWORD`

---

### Issue #6: Rate Limiting with Exponential Backoff
**File**: `backend/src/middleware/rateLimiter.js` (REWRITE)
**File**: `backend/server.js:42-43`
**Impact**: Brute force attacks possible

**Changes**:
1. Create: `backend/src/middleware/advancedRateLimiter.js`
   - Register: 5 attempts per 15 min
   - Login: 10 attempts per 15 min
   - Exponential backoff: 2^n seconds
   
2. Update server.js:
   - Import advanced limiters
   - Apply to `/api/auth/register` and `/api/auth/login`

---

### Issue #10: Email Normalization (Backend)
**File**: `backend/src/controllers/authController.js:200`
**Impact**: Duplicate accounts with different cases

**Change**:
- Before DB query: `email.toLowerCase().trim()`
- Apply to all register and login operations

Note: User schema already has `lowercase: true`, but add normalization in code too.

---

### Issue #11: Error Codes (Register/Login)
**File**: Multiple error responses
**Impact**: Frontend can't handle specific errors

**Changes**: Add `code` field to all error responses:
```
MISSING_FIELDS
WEAK_PASSWORD
USER_EXISTS
INVALID_CREDENTIALS
USER_BLOCKED
NO_TOKEN
TOKEN_EXPIRED
RATE_LIMITED
```

---

## PHASE 2: LOGIN COMPONENT (6 Issues)

### Issue #2: httpOnly Cookies (Already Fixed ✓)
**File**: `frontend/src/lib/axios.js:24-27`
- Already using: `withCredentials: true`
- Already NOT using localStorage
- No changes needed

---

### Issue #7: User Block Bypass Prevention
**File**: `backend/src/controllers/authController.js:281-287, 426-432`
**Impact**: Blocked users can still use old tokens

**Changes**:
1. On login (line 281):
   - Check `user.isBlocked`
   - If true: `revokeRefreshTokens()` + clear cookies
   - Return code: `USER_BLOCKED`

2. On refresh (line 426):
   - Check `user.isBlocked`
   - If true: `revokeRefreshTokens()` + clear cookies
   - Return code: `USER_BLOCKED`

---

### Issue #8: Timing Attack Prevention
**File**: `backend/src/controllers/authController.js:250-279`
**Impact**: Attacker can detect valid email addresses

**Change**:
- Always do bcrypt comparison, even for non-existent users
- Use dummy hash for comparison if user not found
- Unified error message for both scenarios

---

### Issue #11: Error Codes (Login)
Already covered in Phase 2 above - add codes to all login errors.

---

## PHASE 3: REFRESH/TOKEN FLOW (5 Issues)

### Issue #3: Enhanced Error Handling (Refresh)
**File**: `backend/src/controllers/authController.js:377-458`
**Impact**: Generic error messages don't help debugging

**Changes**:
1. Add specific error codes:
   - `NO_REFRESH_TOKEN`
   - `INVALID_REFRESH_TOKEN`
   - `TOKEN_REVOKED`
   - `USER_NOT_FOUND`
   - `TOKEN_ROTATION_ERROR`
   - `JWT_ERROR`
   - `DATABASE_ERROR`

2. Enhanced catch block:
   - Differentiate error types
   - Log with context
   - Return appropriate status codes

---

### Issue #5: Race Condition Prevention
**File**: `backend/src/controllers/authController.js:146-167`
**File**: `backend/src/models/RefreshToken.js:58-68`
**Impact**: Multiple simultaneous refresh requests can both succeed

**Changes**:
1. Update RefreshToken schema:
   - Add: `revokedAt: Date` field
   - Add index on `isRevoked`

2. Update `rotateRefreshToken()`:
   - Use atomic `findOneAndUpdate()` instead of `updateOne()`
   - Check condition: `isRevoked: false`
   - If no match: throw error (already rotated)

---

### Issue #9: JWT Secrets Configuration
**File**: `backend/.env`
**File**: `backend/src/controllers/authController.js:23-24`
**Impact**: Secrets exposed in git, shared between access/refresh

**Changes**:
1. Generate two separate secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Update .env:
   ```
   JWT_SECRET=<32-byte-hex-string>
   JWT_REFRESH_SECRET=<different-32-byte-hex-string>
   ```

3. Create .env.example (no actual secrets)

4. Update authController.js:
   - Validate both secrets exist
   - Warn if they're the same
   - Exit if missing

5. Ensure .gitignore has `.env`

---

### Issue #13: Secure Cookie Flag
**File**: `backend/src/controllers/authController.js:43-49`
**Impact**: Cookies sent over HTTP in development

**Change**:
```javascript
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || 
          process.env.SECURE_COOKIES === "true",
  sameSite: "strict",
  path: "/",
  maxAge: maxAge,
});
```

---

### Issue #14: CORS Configuration
**File**: `backend/server.js:22-36`
**Impact**: Hardcoded to localhost:3000, fails in production

**Changes**:
1. Update server.js:
   - Use `process.env.CORS_ORIGIN`
   - Support multiple origins (comma-separated)
   - Validate in production

2. Update .env:
   ```
   CORS_ORIGIN=http://localhost:3000
   # Production:
   # CORS_ORIGIN=https://example.com,https://www.example.com
   ```

3. Apply to both Express CORS and Socket.io

---

## PHASE 4: TESTING SETUP

### Jest + Supertest Integration

**Step 1**: Install dependencies
```bash
npm install --save-dev jest supertest @babel/preset-env babel-jest
```

**Step 2**: Create jest.config.js

**Step 3**: Create test utilities and setup files

**Step 4**: Write comprehensive tests
- Register flow
- Login flow  
- Token refresh
- Error handling
- Rate limiting
- Security measures

**Step 5**: Achieve 80%+ coverage

---

## FILES TO CREATE

1. `backend/src/utils/passwordValidator.js` - Password strength validation
2. `backend/src/middleware/advancedRateLimiter.js` - Advanced rate limiting
3. `backend/jest.config.js` - Jest configuration
4. `backend/src/__tests__/setup.js` - Test setup
5. `backend/src/__tests__/utils/testHelper.js` - Test utilities
6. `backend/src/__tests__/auth.integration.test.js` - Integration tests
7. `backend/.env.example` - Environment template
8. `.env.test` - Test environment variables

---

## FILES TO MODIFY

1. `backend/src/controllers/authController.js` - Major changes
2. `backend/src/models/RefreshToken.js` - Add revokedAt field
3. `backend/src/middleware/rateLimiter.js` - Rewrite with advanced limiter
4. `backend/server.js` - Update CORS and rate limiter setup
5. `backend/.env` - Update JWT secrets
6. `frontend/src/app/(auth)/register/page.jsx` - Remove localStorage
7. `backend/package.json` - Add test scripts and dependencies

---

## IMPLEMENTATION ORDER

### Week 1: Foundation
- [ ] Generate JWT secrets
- [ ] Update .env and .gitignore
- [ ] Install testing dependencies
- [ ] Create test setup files

### Week 2: Register Fixes
- [ ] Create password validator
- [ ] Add backend password validation to register
- [ ] Add error codes to register
- [ ] Remove localStorage from register page
- [ ] Email normalization
- [ ] Write register tests

### Week 3: Login Fixes
- [ ] Add timing attack prevention
- [ ] Add user block bypass prevention
- [ ] Add error codes to login
- [ ] Add email normalization to login
- [ ] Write login tests

### Week 4: Token Flow & Config
- [ ] Implement race condition fix
- [ ] Enhanced error handling for refresh
- [ ] Add error codes to refresh
- [ ] Implement advanced rate limiter
- [ ] Update CORS configuration
- [ ] Update secure cookie flag
- [ ] Write integration tests

### Week 5: Testing & Validation
- [ ] Complete test suite
- [ ] Achieve 80%+ coverage
- [ ] Security testing
- [ ] Performance testing
- [ ] Documentation

---

## SECURITY CHECKLIST

- [ ] No tokens in localStorage
- [ ] No tokens in Authorization header
- [ ] httpOnly + Secure + SameSite cookies
- [ ] Password: 8+ chars, mixed case, numbers
- [ ] Rate limiting: 5 register / 10 login per 15 min
- [ ] Timing attack: same response time for all login failures
- [ ] User block: immediate token revocation
- [ ] Race condition: atomic token rotation
- [ ] Error codes: specific feedback without leaking info
- [ ] JWT secrets: strong, separate, environment variables
- [ ] CORS: environment-based, validated
- [ ] Token rotation: refresh token rotated on each use
- [ ] Token family: track sessions
- [ ] Error logging: detailed for debugging

---

## ROLLOUT PLAN

1. **Branch**: Create `security/auth-hardening` branch
2. **Phase-by-phase**: Implement each phase with tests
3. **Code Review**: Security-focused review
4. **Staging**: Deploy to staging environment
5. **Load Testing**: Verify rate limiting under load
6. **Production**: Deploy with monitoring
7. **Rollback**: Have rollback procedure ready

---

## VERIFICATION

After implementation, verify:

1. **JWT Secrets**: Different for access/refresh ✓
2. **Password Policy**: 8+ chars, mixed case, numbers ✓
3. **Rate Limiting**: 5 register, 10 login per 15 min ✓
4. **Token Storage**: Only in httpOnly cookies ✓
5. **User Block**: Immediate token revocation ✓
6. **Timing Attack**: Similar response times ✓
7. **Race Condition**: Only one token refresh succeeds ✓
8. **Error Codes**: All endpoints return specific codes ✓
9. **CORS**: Works with multiple domains ✓
10. **Tests**: 80%+ coverage, all passing ✓

---

## REFERENCES

- [OWASP: Authentication](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Token Rotation](https://github.com/stalniy/express-jwt-permissions)
- [Rate Limiting](https://github.com/nfriedly/express-rate-limit)
- [Timing Attack Prevention](https://codahale.com/a-lesson-in-timing-attacks/)

