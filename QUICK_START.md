# QUICK START - Authentication Security Implementation

## Overview
15 authentication vulnerabilities to fix across Register, Login, and Token flows. Estimated effort: 34-40 hours.

## Key Files
| Issue | File | Lines | Priority |
|-------|------|-------|----------|
| #1 | frontend/src/app/(auth)/register/page.jsx | 65-67 | HIGH |
| #4 | backend/src/controllers/authController.js | 188-210 | CRITICAL |
| #6 | backend/src/middleware/rateLimiter.js | (rewrite) | HIGH |
| #7 | backend/src/controllers/authController.js | 281-287, 426-432 | CRITICAL |
| #8 | backend/src/controllers/authController.js | 250-279 | HIGH |
| #9 | backend/.env | (update) | CRITICAL |
| #13 | backend/src/controllers/authController.js | 43-49 | MEDIUM |
| #14 | backend/server.js | 22-36 | MEDIUM |

## Phase 1: Quick Wins (1 hour)

### 1. Remove localStorage
```diff
// frontend/src/app/(auth)/register/page.jsx:65-67
- document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
- localStorage.setItem("token", token);
```

### 2. Generate JWT Secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Run twice to get 2 secrets
```

### 3. Update .env
```bash
JWT_SECRET=<first-secret>
JWT_REFRESH_SECRET=<second-secret>
CORS_ORIGIN=http://localhost:3000
```

## Phase 2: Core Security (3 hours)

### 4. Password Validator
Create: `backend/src/utils/passwordValidator.js`
```javascript
export const validatePasswordStrength = (password) => {
  const errors = [];
  if (password.length < 8) errors.push("8+ chars");
  if (!/[a-z]/.test(password)) errors.push("lowercase");
  if (!/[A-Z]/.test(password)) errors.push("uppercase");
  if (!/[0-9]/.test(password)) errors.push("numbers");
  return { isValid: errors.length === 0, errors };
};
```

### 5. Update Register
```javascript
// authController.js - register()
const validation = validatePasswordStrength(password);
if (!validation.isValid) {
  return res.status(400).json({
    success: false,
    code: "WEAK_PASSWORD",
    details: validation.errors,
  });
}
```

### 6. Update Login - Timing Attack
```javascript
// authController.js - login()
let isMatch = false;
if (user) {
  isMatch = await user.comparePassword(password);
} else {
  const dummyHash = "$2a$10$..."; // dummy hash
  await bcrypt.compare(password, dummyHash);
}

if (!user || !isMatch) {
  return res.status(401).json({
    success: false,
    code: "INVALID_CREDENTIALS",
  });
}
```

## Phase 3: Advanced Features (2 hours)

### 7. Rate Limiter
Create: `backend/src/middleware/advancedRateLimiter.js`
- Register: 5 attempts/15min
- Login: 10 attempts/15min
- Include exponential backoff

### 8. Race Condition Fix
```javascript
// authController.js - rotateRefreshToken()
const updateResult = await RefreshToken.findOneAndUpdate(
  { token: hashedOldToken, isRevoked: false },
  { isRevoked: true, revokedAt: new Date() },
  { new: true }
);

if (!updateResult) {
  throw new Error("Token already rotated");
}
```

### 9. User Block Prevention
```javascript
// authController.js - login() & refresh()
if (user.isBlocked) {
  await revokeRefreshTokens(user._id.toString());
  res.clearCookie("accessToken", ...);
  res.clearCookie("refreshToken", ...);
  return res.status(403).json({
    success: false,
    code: "USER_BLOCKED",
  });
}
```

## Phase 4: Testing (8 hours)

### 10. Install Dependencies
```bash
npm install --save-dev jest supertest @babel/preset-env babel-jest
```

### 11. Create Tests
- Register: 5 tests
- Login: 4 tests
- Refresh: 4 tests
- Rate limiting: 3 tests
- Race condition: 2 tests
- **Total: 18+ tests**

## Error Codes Reference

```javascript
// Register
MISSING_FIELDS
WEAK_PASSWORD
USER_EXISTS

// Login
INVALID_CREDENTIALS
USER_BLOCKED

// Refresh
NO_REFRESH_TOKEN
INVALID_REFRESH_TOKEN
TOKEN_REVOKED
USER_NOT_FOUND
TOKEN_ROTATION_ERROR

// General
RATE_LIMITED
JWT_ERROR
DATABASE_ERROR
```

## Verification Checklist

- [ ] No localStorage in frontend
- [ ] httpOnly + Secure + SameSite cookies
- [ ] 8+ char passwords, mixed case, numbers
- [ ] Rate limiting active (5 register, 10 login)
- [ ] Timing attack prevented
- [ ] User block revokes tokens
- [ ] Race condition fixed
- [ ] All error codes returned
- [ ] JWT secrets separate and strong
- [ ] CORS environment-based
- [ ] 80%+ test coverage
- [ ] All tests passing

## File Sizes & Impact

| File | Current | Change | Type |
|------|---------|--------|------|
| authController.js | 594 lines | +100 | Major |
| register/page.jsx | 233 lines | -2 | Minor |
| server.js | 56 lines | +10 | Minor |
| rateLimiter.js | 15 lines | Rewrite | Major |
| RefreshToken.js | 96 lines | +5 | Minor |

## Git Commit Size

- Commit 1 (Foundation): ~50 lines
- Commit 2 (Register): ~80 lines
- Commit 3 (Login): ~120 lines
- Commit 4 (Token Flow): ~100 lines
- Commit 5 (Tests): ~400 lines
- **Total: ~750 lines added**

## Common Issues & Solutions

### Issue: Tests failing with "cannot find module"
**Solution**: Ensure all imports use relative paths and file extensions

### Issue: Rate limiting not working
**Solution**: Verify rate limiter applied BEFORE routes in server.js

### Issue: CORS blocked requests
**Solution**: Set CORS_ORIGIN in .env and restart server

### Issue: Cookies not sent
**Solution**: Verify axios has `withCredentials: true`

## Resources

- [OWASP Top 10 Auth](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Timing Attack Prevention](https://codahale.com/a-lesson-in-timing-attacks/)
- [Express Rate Limit Docs](https://github.com/nfriedly/express-rate-limit)
- [Cookie Security](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

---

**Total Estimated Time**: 34-40 hours
**Priority**: CRITICAL - Security fixes
**Team Size**: 1 developer
**Deployment**: Requires security review before production

