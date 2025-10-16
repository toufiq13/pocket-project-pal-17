# Testing Guide - LuxInnovate Interiors

## Overview

This document covers all testing requirements and procedures for the LuxInnovate Interiors platform.

## Table of Contents

1. [Unit Tests](#unit-tests)
2. [Integration Tests](#integration-tests)
3. [Load Testing](#load-testing)
4. [Security Testing](#security-testing)
5. [Running Tests](#running-tests)

---

## 1. Unit Tests

### Frontend Unit Tests (Vitest)

We use **Vitest** for testing React components and services.

#### Running Unit Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

#### Test Structure

```typescript
// Example: src/services/__tests__/authService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { authService } from '../authService';

describe('AuthService', () => {
  it('should login successfully', async () => {
    const result = await authService.login('user@example.com', 'password');
    expect(result.data).toBeTruthy();
  });
});
```

#### Covered Services

- ✅ Authentication Service
- ✅ Payment Service
- ✅ Recommendation Service (ML)
- ✅ Product Service
- ✅ Order Service
- ✅ Cart Service

---

## 2. Integration Tests

### Payment Flow Integration Tests

Tests the complete payment lifecycle:

1. **Create Payment**
   - Validate payment data
   - Create payment record
   - Generate transaction ID

2. **Verify Payment**
   - Verify transaction
   - Update payment status
   - Update order status

```typescript
// Example: Payment integration test
describe('Payment Integration', () => {
  it('should complete payment flow', async () => {
    const payment = await paymentService.createPayment('order_1', 1000, 'card');
    expect(payment.data?.success).toBe(true);
    
    const verification = await paymentService.verifyPayment(
      payment.data.transaction_id, 
      'order_1'
    );
    expect(verification.data?.verified).toBe(true);
  });
});
```

### ML Recommendation Integration Tests

Tests machine learning recommendation flows:

1. **User-based Recommendations**
   - Track user interactions
   - Generate personalized recommendations
   - Return scored products

2. **Product Similarity**
   - Calculate product similarity
   - Return similar items
   - Apply category filters

```typescript
// Example: ML integration test
describe('ML Recommendations', () => {
  it('should generate user recommendations', async () => {
    await recommendationService.trackInteraction('product_1', 'view');
    const recs = await recommendationService.getRecommendations('user_1');
    expect(recs.data).toHaveLength(6);
  });
});
```

### Edge Function Tests (Deno)

Edge functions have their own test files using Deno's testing framework.

```bash
# Run edge function tests
cd supabase/functions/process-payment
deno test test.ts

cd supabase/functions/get-recommendations  
deno test test.ts
```

---

## 3. Load Testing

### Using Postman for Load Testing

1. **Import Collection**
   - Import `postman_collection.json`
   - Set environment variables

2. **Configure Collection Runner**
   - Select collection
   - Set iterations (e.g., 100)
   - Set delay between requests

3. **Monitor Performance**
   - Response times
   - Success rate
   - Error distribution

### Using JMeter

1. **Install JMeter**
```bash
# macOS
brew install jmeter

# Linux
apt-get install jmeter
```

2. **Create Test Plan**

```xml
<!-- Example: JMeter test plan structure -->
- Thread Group (Users: 100, Ramp-up: 10s)
  - HTTP Request: GET /api/products
  - HTTP Request: POST /api/cart
  - HTTP Request: POST /api/orders
  - HTTP Request: POST /api/payment/create
```

3. **Run Load Tests**

```bash
jmeter -n -t load_test.jmx -l results.jtl -e -o report/
```

### Load Testing Targets

| Endpoint | Expected Response Time | Concurrent Users |
|----------|----------------------|-----------------|
| GET /products | < 200ms | 500 |
| POST /cart | < 150ms | 300 |
| POST /orders | < 300ms | 200 |
| POST /payment/create | < 500ms | 100 |
| GET /recommendations | < 400ms | 200 |

---

## 4. Security Testing

### JWT Validation Tests

```typescript
describe('JWT Security', () => {
  it('should reject invalid JWT tokens', async () => {
    const invalidToken = 'invalid.jwt.token';
    // Test should fail authentication
  });

  it('should reject expired JWT tokens', async () => {
    const expiredToken = 'expired.jwt.token';
    // Test should fail authentication
  });

  it('should validate JWT signature', async () => {
    const tamperedToken = 'tampered.jwt.token';
    // Test should fail authentication
  });
});
```

### SQL Injection Tests

```typescript
describe('SQL Injection Protection', () => {
  const maliciousInputs = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
    "' UNION SELECT * FROM payments--"
  ];

  maliciousInputs.forEach(input => {
    it(`should sanitize: ${input}`, async () => {
      const result = await productService.search(input);
      // Should not execute SQL, should return empty or error
      expect(result.error).toBeTruthy();
    });
  });
});
```

### XSS Prevention Tests

```typescript
describe('XSS Protection', () => {
  it('should sanitize HTML in product descriptions', async () => {
    const xssInput = '<script>alert("XSS")</script>';
    const result = await productService.create({
      name: 'Test',
      description: xssInput
    });
    
    expect(result.data?.description).not.toContain('<script>');
  });
});
```

### Rate Limiting Tests

```typescript
describe('Rate Limiting', () => {
  it('should block after exceeding rate limit', async () => {
    // Make 100 requests rapidly
    const requests = Array(100).fill(null).map(() => 
      fetch('/api/payment/create')
    );
    
    const responses = await Promise.all(requests);
    const blocked = responses.filter(r => r.status === 429);
    
    expect(blocked.length).toBeGreaterThan(0);
  });
});
```

### Input Validation Tests

All input validation is tested through the Zod schemas:

```typescript
import { authSchema, productSchema, paymentSchema } from '@/lib/validation';

describe('Input Validation', () => {
  it('should validate email format', () => {
    const result = authSchema.safeParse({
      email: 'invalid-email',
      password: 'pass123'
    });
    expect(result.success).toBe(false);
  });

  it('should validate price is positive', () => {
    const result = productSchema.safeParse({
      name: 'Product',
      price: -100
    });
    expect(result.success).toBe(false);
  });
});
```

---

## 5. Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Run all frontend tests
npm run test

# Run with coverage report
npm run test:coverage

# Run edge function tests
cd supabase/functions/process-payment && deno test test.ts
cd supabase/functions/get-recommendations && deno test test.ts

# Run security tests specifically
npm run test -- --grep="Security"
```

### CI/CD Integration

Add to your `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:coverage
      - uses: denoland/setup-deno@v1
      - run: |
          cd supabase/functions/process-payment
          deno test test.ts
```

### Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Services | > 80% |
| Components | > 70% |
| Edge Functions | > 75% |
| Overall | > 75% |

---

## Test Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:edge": "cd supabase/functions && for dir in */; do cd $dir && deno test test.ts && cd ..; done"
  }
}
```

---

## Security Testing Checklist

- ✅ JWT token validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Input validation
- ✅ Password strength requirements
- ✅ Session management
- ✅ API authentication
- ✅ Role-based access control (RBAC)

---

## Best Practices

1. **Write tests first (TDD)** - Define expected behavior before implementation
2. **Test edge cases** - Include boundary conditions and error scenarios
3. **Mock external services** - Use MSW for API mocking
4. **Keep tests isolated** - Each test should be independent
5. **Use descriptive names** - Test names should explain what they verify
6. **Test user flows** - Integration tests should mirror real user journeys
7. **Continuous testing** - Run tests on every commit
8. **Monitor coverage** - Maintain minimum coverage thresholds

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Deno Testing](https://deno.land/manual/testing)
- [JMeter Documentation](https://jmeter.apache.org/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

---

## Support

For testing issues or questions:
- Check existing tests in `src/services/__tests__/`
- Review security tests in `src/lib/validation.ts`
- Consult the development team
