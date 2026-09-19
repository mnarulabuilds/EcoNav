/** Isolate API integration tests from shell / .env.production leakage. */
process.env.NODE_ENV = 'test';
process.env.RATE_LIMIT_ENABLED = 'false';
delete process.env.TRUST_PROXY;
