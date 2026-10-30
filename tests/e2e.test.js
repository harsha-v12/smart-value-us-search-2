const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const config = require('../src/config/config');
const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

// Helper for making HTTP requests without following redirects
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', reject);
  });
}

describe('End-to-End Test Suite: 3-Condition Rule Engine & SmartValue Endpoints', () => {

  describe('Condition 1: fbclid check', () => {
    it('should redirect to fallback if fbclid is missing', async () => {
      const res = await makeRequest('/us/search-2/?p2=US-hs-Bv-1&p15=US-hs-Bv-2');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });

    it('should redirect to fallback if fbclid is empty', async () => {
      const res = await makeRequest('/us/search-2/?fbclid=&p2=US-hs-Bv-1&p15=US-hs-Bv-2');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });
  });

  describe('Condition 2: p2 STARTS_WITH US-hs-Bv', () => {
    it('should redirect to fallback if p2 does NOT start with US-hs-Bv', async () => {
      const res = await makeRequest('/us/search-2/?fbclid=12345&p2=other_campaign&p15=US-hs-Bv-2');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });

    it('should redirect to fallback if p2 is empty', async () => {
      const res = await makeRequest('/us/search-2/?fbclid=12345&p2=&p15=US-hs-Bv-2');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });
  });

  describe('Condition 3: p15 STARTS_WITH US-hs-Bv', () => {
    it('should redirect to fallback if p15 does NOT start with US-hs-Bv', async () => {
      const res = await makeRequest('/us/search-2/?fbclid=12345&p2=US-hs-Bv-1&p15=wrong_sub');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });

    it('should redirect to fallback if p15 is missing', async () => {
      const res = await makeRequest('/us/search-2/?fbclid=12345&p2=US-hs-Bv-1');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });
  });

  describe('Positive Case: ALL Conditions Satisfied (ALLOW -> Stay on Landing Page)', () => {
    it('should return 200 HTML with age buttons pointing to Routeclk for Facebook (fb=1 & p11=1253687)', async () => {
      const res = await makeRequest('/us/search-2/?fbclid=12345&p2=US-hs-Bv-camp1&p15=US-hs-Bv-sub1&fb=1&p3=geo_us&p4=feed_ad');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /text\/html/);

      const expectedTrackingUrl = new URL(config.routeclk.baseUrl);
      expectedTrackingUrl.searchParams.set('fbclid', '12345');
      expectedTrackingUrl.searchParams.set('p2', 'US-hs-Bv-camp1');
      expectedTrackingUrl.searchParams.set('p11', '1253687');
      expectedTrackingUrl.searchParams.set('p15', 'US-hs-Bv-sub1');
      expectedTrackingUrl.searchParams.set('p3', 'geo_us');
      expectedTrackingUrl.searchParams.set('p4', 'feed_ad');

      assert.ok(res.body.includes(expectedTrackingUrl.toString()));
      assert.ok(res.body.includes('18-25'));
      assert.ok(res.body.includes('26-35'));
      assert.ok(res.body.includes('36-45'));
      assert.ok(res.body.includes('46-55'));
      assert.ok(res.body.includes('56+'));
      assert.ok(res.body.includes('Protect Your Home in Minutes'));
    });

    it('should return 404 for removed /info/home route', async () => {
      const res = await makeRequest('/info/home/?fbclid=12345&p2=US-hs-Bv-camp1&p15=US-hs-Bv-sub1&fb=1');
      assert.strictEqual(res.statusCode, 404);
    });

    it('should return JSON API response when requested via API with fb=1', async () => {
      const res = await makeRequest('/api/v1/tracking/resolve?fbclid=12345&p2=US-hs-Bv-camp1&p15=US-hs-Bv-sub1&fb=1');
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.strictEqual(json.status, 'success');
      assert.strictEqual(json.isFallback, false);
      assert.strictEqual(json.targetPlatform, 'routeclk');
      assert.ok(json.destinationUrl.includes('p11=1253687'));
      assert.ok(json.destinationUrl.includes('p15=US-hs-Bv-sub1'));
      assert.strictEqual(json.denyReason, null);
    });

    it('should redirect Facebook traffic to fallback if fb=1 is missing', async () => {
      const res = await makeRequest('/us/search-2/?fbclid=12345&p2=US-hs-Bv-camp1&p15=US-hs-Bv-sub1');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });

    it('should return isFallback: true via JSON API when Facebook traffic is missing fb=1', async () => {
      const res = await makeRequest('/api/v1/tracking/resolve?fbclid=12345&p2=US-hs-Bv-camp1&p15=US-hs-Bv-sub1');
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.strictEqual(json.status, 'success');
      assert.strictEqual(json.isFallback, true);
      assert.strictEqual(json.denyReason, 'facebook_missing_fb');
      assert.strictEqual(json.targetPlatform, 'fallback');
    });

    it('should handle TikTok traffic (ttclid + US-TIK-HI-RVS + tk=1) and wire buttons to search2 destination', async () => {
      const res = await makeRequest('/us/search-2/?ttclid=fb_123&p2=US-TIK-HI-RVS&p15=US-TIK-HI-RVS&tk=1');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /text\/html/);

      const expectedTrackingUrl = new URL(config.routeclk.baseUrl);
      expectedTrackingUrl.searchParams.set('ttclid', 'fb_123');
      expectedTrackingUrl.searchParams.set('p2', 'US-TIK-HI-RVS');
      expectedTrackingUrl.searchParams.set('p11', '2876212');
      expectedTrackingUrl.searchParams.set('p15', 'US-TIK-HI-RVS');
      assert.ok(res.body.includes(expectedTrackingUrl.toString()));
    });

    it('should return JSON destination for TikTok traffic via API when tk=1', async () => {
      const res = await makeRequest('/api/v1/tracking/resolve?ttclid=fb_123&p2=US-TIK-HI-RVS&p15=US-TIK-HI-RVS&tk=1');
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.strictEqual(json.status, 'success');
      assert.strictEqual(json.isFallback, false);

      const expectedTrackingUrl = new URL(config.routeclk.baseUrl);
      expectedTrackingUrl.searchParams.set('ttclid', 'fb_123');
      expectedTrackingUrl.searchParams.set('p2', 'US-TIK-HI-RVS');
      expectedTrackingUrl.searchParams.set('p11', '2876212');
      expectedTrackingUrl.searchParams.set('p15', 'US-TIK-HI-RVS');
      assert.strictEqual(json.destinationUrl, expectedTrackingUrl.toString());
    });

    it('should redirect TikTok traffic to fallback if tk=1 is missing', async () => {
      const res = await makeRequest('/us/search-2/?ttclid=fb_123&p2=US-TIK-HI-RVS&p15=US-TIK-HI-RVS');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });

    it('should return isFallback: true via JSON API when TikTok traffic is missing tk=1', async () => {
      const res = await makeRequest('/api/v1/tracking/resolve?ttclid=fb_123&p2=US-TIK-HI-RVS&p15=US-TIK-HI-RVS');
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.strictEqual(json.status, 'success');
      assert.strictEqual(json.isFallback, true);
      assert.strictEqual(json.denyReason, 'tiktok_missing_tk');
      assert.strictEqual(json.targetPlatform, 'fallback');
    });
  });

  describe('Health Check Endpoint', () => {
    it('GET /health should return 200 and ok status', async () => {
      const res = await makeRequest('/health');
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.strictEqual(json.status, 'ok');
      assert.ok(json.uptime >= 0);
      assert.ok(json.timestamp);
    });
  });
});
