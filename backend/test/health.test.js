const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const { appVersion } = require('../version');

describe('GET /api/health', () => {
  it('returns ok status and metadata', async () => {
    const res = await request(app).get('/api/health');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.ok(res.body.timestamp, 'should include timestamp');
    assert.ok(res.body.uptime >= 0, 'should include uptime');
    assert.strictEqual(res.body.version, appVersion);
    assert.ok(res.body.ai);
  });
});
