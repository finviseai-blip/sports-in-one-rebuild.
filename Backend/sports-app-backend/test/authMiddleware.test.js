const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { verifyToken, requireRole } = require('../src/middleware/authMiddleware');

const TEST_SECRET = 'test-only-secret-that-is-long-enough-for-jwt-checks';
const ORIGINAL_SECRET = process.env.JWT_SECRET;

function responseDouble() {
  return {
    statusCode: 200,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}

test.afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = ORIGINAL_SECRET;
});

test('rejects requests with no bearer token', () => {
  process.env.JWT_SECRET = TEST_SECRET;
  const res = responseDouble();
  let calledNext = false;
  verifyToken({ headers: {} }, res, () => { calledNext = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(calledNext, false);
});

test('rejects authorization headers using a non-Bearer scheme', () => {
  process.env.JWT_SECRET = TEST_SECRET;
  const res = responseDouble();
  verifyToken({ headers: { authorization: 'Basic abc123' } }, res, () => {});
  assert.equal(res.statusCode, 401);
});

test('fails closed when JWT_SECRET is missing or too short', () => {
  process.env.JWT_SECRET = 'short';
  const res = responseDouble();
  verifyToken({ headers: { authorization: 'Bearer abc.def.ghi' } }, res, () => {});
  assert.equal(res.statusCode, 503);
});

test('accepts a valid signed bearer token and attaches user claims', () => {
  process.env.JWT_SECRET = TEST_SECRET;
  const token = jwt.sign({ userId: 'student-1', role: 'STUDENT' }, TEST_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = responseDouble();
  let calledNext = false;
  verifyToken(req, res, () => { calledNext = true; });
  assert.equal(calledNext, true);
  assert.equal(req.user.userId, 'student-1');
  assert.equal(req.user.role, 'STUDENT');
});

test('rejects roles that are not authorized for an endpoint', () => {
  const res = responseDouble();
  let calledNext = false;
  requireRole('ADMIN')({ user: { role: 'STUDENT' } }, res, () => { calledNext = true; });
  assert.equal(res.statusCode, 403);
  assert.equal(calledNext, false);
});

test('allows an authorized role to continue', () => {
  const res = responseDouble();
  let calledNext = false;
  requireRole('ADMIN', 'COACH')({ user: { role: 'COACH' } }, res, () => { calledNext = true; });
  assert.equal(calledNext, true);
});
