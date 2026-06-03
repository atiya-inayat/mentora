# IMPLEMENTATION CHECKLIST - 15 Authentication Issues

## PHASE 1: REGISTER COMPONENT FIXES

### Issue #1: Remove localStorage/document.cookie
- [ ] File: `frontend/src/app/(auth)/register/page.jsx`
- [ ] Line: 65 - Remove: `document.cookie = \`token=...\``
- [ ] Line: 67 - Remove: `localStorage.setItem("token", token)`
- [ ] Keep: `setAuth(user)` on line 63
- [ ] Verify: Cookies automatically sent via axios `withCredentials: true`
- [ ] Test: `test("should NOT store token in localStorage")`

### Issue #4: Backend Password Validation
- [ ] Create: `backend/src/utils/passwordValidator.js`
  - [ ] Export: `validatePasswordStrength(password)`
  - [ ] Check: 8+ characters
  - [ ] Check: At least one uppercase letter
  - [ ] Check: At least one lowercase letter
  - [ ] Check: At least one number
  - [ ] Return: `{ isValid: boolean, errors: string[] }`
  
- [ ] Update: `backend/src/controllers/authController.js`
  - [ ] Line 18: Add import for passwordValidator
  - [ ] Line 194-198: Add validation call
  - [ ] Return 400 with code: `WEAK_PASSWORD`
  - [ ] Include `details` array in response
  
- [ ] Test: 5 test cases
  - [ ] Reject password < 8 chars
  - [ ] Reject password without uppercase
  - [ ] Reject password without lowercase
  - [ ] Reject password without numbers
  - [ ] Accept valid password "Password123"

### Issue #6: Rate Limiting (Register)
- [ ] Create: `backend/src/middleware/advancedRateLimiter.js`
  - [ ] Export: `registerLimiter` (5 attempts per 15 min)
  - [ ] Export: `loginLimiter` (10 attempts per 15 min)
  - [ ] Export: `generalLimiter` (100 requests per 15 min)
  - [ ] Implement exponential backoff
  - [ ] Return code: `RATE_LIMITED`
  - [ ] Include `retryAfter` in response
  
- [ ] Update: `backend/server.js`
  - [ ] Line 16: Import advancedRateLimiter
  - [ ] Line 42-43: Replace with new limiters
  - [ ] Apply registerLimiter to `/api/auth/register`
  - [ ] Apply loginLimiter to `/api/auth/login`
  
- [ ] Test: 3 test cases
  - [ ] Allow 5 registration attempts
  - [ ] Block 6th registration attempt (429)
  - [ ] Return retry-after header

### Issue #10: Email Normalization (Backend)
- [ ] Update: `backend/src/controllers/authController.js`
  - [ ] Line 201: Add `email.toLowerCase().trim()`
  - [ ] Apply to `findOne()` query
  - [ ] Apply to `User.create()`
  
- [ ] Verify: `backend/src/models/User.js:14`
  - [ ] Confirm: `lowercase: true` in schema
  
- [ ] Test: 1 test case
  - [ ] Register with "john@example.com"
  - [ ] Try register with "JOHN@EXAMPLE.COM"
  - [ ] Should return 409 USER_EXISTS

### Issue #11: Error Codes (Register)
- [ ] Update: `backend/src/controllers/authController.js` register()
  - [ ] Line 196: Add code: `MISSING_FIELDS`
  - [ ] Line 206: Add code: `USER_EXISTS`
  - [ ] Line 216: Add code: `WEAK_PASSWORD` (with details)
  
- [ ] Verify: All error responses include `code` field
  - [ ] [ ] MISSING_FIELDS
  - [ ] [ ] WEAK_PASSWORD
  - [ ] [ ] USER_EXISTS

---

## PHASE 2: LOGIN COMPONENT FIXES

### Issue #2: httpOnly Cookies (Already Fixed ✓)
- [ ] Verify: `frontend/src/lib/axios.js:24-27`
  - [ ] Confirm: `withCredentials: true`
  - [ ] Confirm: No localStorage usage
  - [ ] Confirm: No Authorization header
- [ ] Test: `test("should send credentials with axios requests")`
- [ ] Status: COMPLETE ✓

### Issue #7: User Block Bypass Prevention
- [ ] Update: `backend/src/controllers/authController.js` login()
  - [ ] Line 282: Check `user.isBlocked`
  - [ ] Line 284: Call `revokeRefreshTokens(user._id.toString())`
  - [ ] Line 287: Call `res.clearCookie()` for both tokens
  - [ ] Line 292: Add code: `USER_BLOCKED`
  
- [ ] Update: `backend/src/controllers/authController.js` refresh()
  - [ ] Line 427: Check `user.isBlocked`
  - [ ] Line 429: Call `revokeRefreshTokens(user._id.toString())`
  - [ ] Line 432: Call `res.clearCookie()` for both tokens
  - [ ] Line 437: Add code: `USER_BLOCKED`
  
- [ ] Test: 3 test cases
  - [ ] Reject login for blocked user (403 USER_BLOCKED)
  - [ ] Clear cookies when user blocked
  - [ ] Prevent refresh if user blocked

### Issue #8: Timing Attack Prevention
- [ ] Update: `backend/src/controllers/authController.js` login()
  - [ ] Line 251: Add import for bcrypt
  - [ ] Line 263: Find user by email
  - [ ] Line 265-275: Add timing attack mitigation:
    - [ ] Always do bcrypt comparison
    - [ ] Use dummy hash if user not found
    - [ ] Unified error message
  
- [ ] Test: 2 test cases
  - [ ] Same response time for wrong password vs non-existent user
  - [ ] Same error message for both scenarios

### Issue #11: Error Codes (Login)
- [ ] Update: `backend/src/controllers/authController.js` login()
  - [ ] Line 255: Add code: `MISSING_FIELDS`
  - [ ] Line 275: Add code: `INVALID_CREDENTIALS`
  - [ ] Line 286: Add code: `USER_BLOCKED`
  
- [ ] Verify: All error responses include `code` field
  - [ ] [ ] MISSING_FIELDS
  - [ ] [ ] INVALID_CREDENTIALS
  - [ ] [ ] USER_BLOCKED

---

## PHASE 3: REFRESH/TOKEN FLOW FIXES

### Issue #3: Enhanced Error Handling (Refresh)
- [ ] Update: `backend/src/controllers/authController.js` refresh()
  - [ ] Line 382: Add code: `NO_REFRESH_TOKEN`
  - [ ] Line 393: Add code: `INVALID_REFRESH_TOKEN`
  - [ ] Line 412: Add code: `TOKEN_REVOKED` (already there)
  - [ ] Line 423: Add code: `USER_NOT_FOUND`
  - [ ] Line 437: Add code: `USER_BLOCKED`
  - [ ] Line 450: Add code: `TOKEN_ROTATION_ERROR`
  - [ ] Line 460: Add code: `TOKEN_REFRESHED`
  
- [ ] Update: Catch block (line 452-458)
  - [ ] Add error type differentiation
  - [ ] Handle JsonWebTokenError
  - [ ] Handle MongooseError
  - [ ] Return appropriate status codes
  
- [ ] Test: 5 test cases
  - [ ] NO_REFRESH_TOKEN when missing
  - [ ] INVALID_REFRESH_TOKEN when expired
  - [ ] TOKEN_REVOKED when already used
  - [ ] USER_NOT_FOUND when deleted
  - [ ] USER_BLOCKED when blocked

### Issue #5: Race Condition Prevention
- [ ] Update: `backend/src/models/RefreshToken.js`
  - [ ] Line 59: Add index: `index: true` to `isRevoked`
  - [ ] Line 63: Add new field:
    ```javascript
    revokedAt: {
      type: Date,
      default: null,
    },
    ```
  
- [ ] Update: `backend/src/controllers/authController.js` rotateRefreshToken()
  - [ ] Line 154-158: Replace `updateOne()` with `findOneAndUpdate()`
  - [ ] Add condition: `isRevoked: false`
  - [ ] Add update: `revokedAt: new Date()`
  - [ ] Check result: `if (!updateResult) throw Error(...)`
  
- [ ] Test: 2 test cases
  - [ ] Only one refresh succeeds in simultaneous requests
  - [ ] Second refresh returns 401 TOKEN_REVOKED

### Issue #9: JWT Secrets Configuration
- [ ] Generate: Two new JWT secrets
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  
- [ ] Update: `backend/.env`
  - [ ] Replace JWT_SECRET with new 64-char hex string
  - [ ] Add JWT_REFRESH_SECRET with different 64-char hex string
  
- [ ] Create: `backend/.env.example`
  - [ ] Include placeholder values (not actual secrets)
  
- [ ] Update: `.gitignore`
  - [ ] Confirm: `.env` is ignored
  - [ ] Confirm: `.env.*.local` is ignored
  
- [ ] Update: `backend/src/controllers/authController.js`
  - [ ] Line 24-25: Add validation:
    ```javascript
    if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
      throw new Error("CRITICAL: Secrets not set")
    }
    ```
  - [ ] Add warning if secrets are same
  
- [ ] Test: 4 test cases
  - [ ] Require JWT_SECRET
  - [ ] Require JWT_REFRESH_SECRET
  - [ ] Use different secrets for access/refresh
  - [ ] Secrets at least 32 characters

### Issue #13: Secure Cookie Flag
- [ ] Update: `backend/src/controllers/authController.js` getCookieOptions()
  - [ ] Line 45: Change secure flag logic:
    ```javascript
    secure: process.env.NODE_ENV === "production" || 
            process.env.SECURE_COOKIES === "true",
    ```
  
- [ ] Update: `backend/.env` (for development)
  - [ ] Add: `SECURE_COOKIES=false`
  
- [ ] Test: 3 test cases
  - [ ] Secure flag set in production
  - [ ] httpOnly flag always set
  - [ ] SameSite=Strict always set

### Issue #14: CORS Configuration
- [ ] Update: `backend/server.js`
  - [ ] Line 22-27: Replace hardcoded origin with:
    ```javascript
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
      // ... other options
    };
    ```
  - [ ] Line 32-36: Use corsOptions for Express CORS
  - [ ] Line 23-27: Use corsOptions for Socket.io
  
- [ ] Update: `backend/.env`
  - [ ] Add: `CORS_ORIGIN=http://localhost:3000`
  
- [ ] Update: `backend/.env.example`
  - [ ] Include comments for multiple origins
  - [ ] Include production examples
  
- [ ] Test: 3 test cases
  - [ ] Allow configured origin
  - [ ] Reject unauthorized origin (production)
  - [ ] Include credentials in CORS headers

---

## PHASE 4: TESTING SETUP

### Install Dependencies
- [ ] Run: `npm install --save-dev jest supertest @babel/preset-env babel-jest`
- [ ] Update: `backend/package.json`
  - [ ] Add script: `"test": "jest --forceExit --coverage"`
  - [ ] Add script: `"test:watch": "jest --watch"`

### Create Jest Configuration
- [ ] Create: `backend/jest.config.js`
  - [ ] Set testEnvironment: "node"
  - [ ] Set coverage threshold: 80%
  - [ ] Add setupFilesAfterEnv

### Create Test Utilities
- [ ] Create: `backend/src/__tests__/setup.js`
- [ ] Create: `backend/src/__tests__/utils/testHelper.js`
  - [ ] Export: `testUser` object
  - [ ] Export: `createTestUser()` function
  - [ ] Export: `clearDatabase()` function
  - [ ] Export: `extractCookies()` function
  - [ ] Export: `hashToken()` function

### Write Comprehensive Tests
- [ ] Create: `backend/src/__tests__/auth.integration.test.js`
  - [ ] [ ] Register tests (5 test cases)
  - [ ] [ ] Login tests (4 test cases)
  - [ ] [ ] Token refresh tests (4 test cases)
  - [ ] [ ] Logout tests (1 test case)
  - [ ] [ ] Session management tests (2 test cases)
  - [ ] Total: 16+ test cases
  
- [ ] Run: `npm test`
- [ ] Verify: 80%+ coverage

---

## PHASE 5: FILES CHECKLIST

### New Files to Create
- [ ] `backend/src/utils/passwordValidator.js`
- [ ] `backend/src/middleware/advancedRateLimiter.js`
- [ ] `backend/jest.config.js`
- [ ] `backend/src/__tests__/setup.js`
- [ ] `backend/src/__tests__/utils/testHelper.js`
- [ ] `backend/src/__tests__/auth.integration.test.js`
- [ ] `backend/.env.example`
- [ ] `backend/.env.test`

### Files to Modify
- [ ] `backend/src/controllers/authController.js` (Major - ~100 lines)
- [ ] `backend/src/models/RefreshToken.js` (Minor - 2 fields)
- [ ] `backend/src/middleware/rateLimiter.js` (Rewrite)
- [ ] `backend/server.js` (Minor - CORS/rate limiter)
- [ ] `backend/.env` (Update secrets)
- [ ] `backend/.gitignore` (Verify .env)
- [ ] `backend/package.json` (Add test deps/scripts)
- [ ] `frontend/src/app/(auth)/register/page.jsx` (Minor - 2 lines removed)

### Verify Files
- [ ] Confirm: All imports are correct
- [ ] Confirm: No syntax errors
- [ ] Confirm: All paths are absolute

---

## PHASE 6: FINAL VERIFICATION

### Security Checklist
- [ ] No tokens in localStorage ✓
- [ ] No tokens in Authorization header ✓
- [ ] httpOnly + Secure + SameSite cookies ✓
- [ ] Password: 8+ chars, mixed case, numbers ✓
- [ ] Rate limiting: 5 register / 10 login per 15 min ✓
- [ ] Timing attack: same response time ✓
- [ ] User block: immediate token revocation ✓
- [ ] Race condition: atomic token rotation ✓
- [ ] Error codes: specific feedback ✓
- [ ] JWT secrets: strong, separate, environment ✓
- [ ] CORS: environment-based ✓
- [ ] Token rotation: on each use ✓
- [ ] Token family: tracked ✓
- [ ] Error logging: detailed ✓

### Testing Checklist
- [ ] All tests passing: `npm test`
- [ ] Coverage 80%+: `npm test -- --coverage`
- [ ] No lint errors: `npm run lint` (if configured)
- [ ] Manual testing completed
  - [ ] Register with valid data
  - [ ] Register with weak password (rejected)
  - [ ] Register with duplicate email (rejected)
  - [ ] Rate limit triggers at 6th attempt
  - [ ] Login with valid credentials
  - [ ] Login with wrong password (timing attack)
  - [ ] Token refresh works
  - [ ] Simultaneous refresh prevented
  - [ ] User block prevents login
  - [ ] User block revokes tokens

### Documentation
- [ ] Update: `AUTHENTICATION_IMPLEMENTATION_PLAN.md` (DONE)
- [ ] Create: `IMPLEMENTATION_CHECKLIST.md` (THIS FILE)
- [ ] Update: `README.md` with security info
- [ ] Document: Error codes in API docs
- [ ] Document: Environment variables

---

## COMMIT STRATEGY

### Commit 1: Foundation
```
git commit -m "chore: add authentication security foundation

- Setup Jest testing framework
- Create test utilities and setup
- Add .env.example template
- Add password validator utility
- Create advanced rate limiter middleware
"
```

### Commit 2: Register Security
```
git commit -m "security: harden register endpoint

- Add backend password strength validation (8+ chars, mixed case, numbers)
- Add email normalization
- Add error codes to register responses
- Remove localStorage storage from register component
- Add rate limiting (5 attempts per 15 min)
"
```

### Commit 3: Login Security
```
git commit -m "security: harden login endpoint

- Prevent timing attacks on authentication
- Add user block handling with token revocation
- Add error codes to login responses
- Apply email normalization
- Add rate limiting (10 attempts per 15 min)
"
```

### Commit 4: Token Flow Security
```
git commit -m "security: harden token refresh flow

- Fix race condition with atomic token rotation
- Enhance error handling with specific error codes
- Separate JWT secrets for access and refresh
- Update CORS configuration (environment-based)
- Update secure cookie flags
"
```

### Commit 5: Tests
```
git commit -m "test: add comprehensive authentication tests

- 16+ integration tests covering all flows
- Rate limiting tests with exponential backoff
- Race condition prevention tests
- Timing attack prevention tests
- Token rotation and revocation tests
- 80%+ code coverage
"
```

---

## ROLLOUT STEPS

1. [ ] Create branch: `git checkout -b security/auth-hardening`
2. [ ] Implement Phase 1-4
3. [ ] Run tests: `npm test`
4. [ ] Code review: security-focused
5. [ ] Deploy to staging
6. [ ] Load testing
7. [ ] Production deployment
8. [ ] Monitor error rates
9. [ ] Rollback procedure ready

---

## ESTIMATED TIMELINE

| Phase | Task | Hours |
|-------|------|-------|
| 1 | Setup & Dependencies | 2 |
| 1 | Register Validation | 4 |
| 1 | Register Rate Limiting | 3 |
| 2 | Login Timing Attack | 4 |
| 2 | Login User Block | 2 |
| 3 | Token Race Condition | 3 |
| 3 | JWT Secrets | 2 |
| 3 | CORS & Cookies | 2 |
| 4 | Tests | 8 |
| 5 | Review & Deploy | 4 |
| **TOTAL** | | **34 hours** |

---

## SIGN-OFF

Once all items are complete:

- [ ] All 15 issues fixed
- [ ] All tests passing (80%+ coverage)
- [ ] Security review completed
- [ ] Production deployed
- [ ] Monitoring active

**Date Completed**: ___________
**Developer**: ___________
**Reviewer**: ___________

