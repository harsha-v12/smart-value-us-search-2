const { describe, it } = require('node:test');
const assert = require('node:assert');
const config = require('../src/config/config');
const {
  evaluateFbclidRule,
  evaluateP2Rule,
  evaluateP15Rule,
  evaluateSub7Rule,
  validateTrackingParams,
  REQUIRED_PREFIX,
} = require('../src/rules/ruleEngine');
const TrackingService = require('../src/services/trackingService');

describe('Rule Engine - 3 Conditions Validation', () => {

  describe('Condition 1: fbclid Validation', () => {
    it('should DENY when fbclid is empty or missing', () => {
      const emptyCases = ['', '   ', null, undefined];
      for (const val of emptyCases) {
        const res = evaluateFbclidRule(val);
        assert.strictEqual(res.isDenied, true);
        assert.strictEqual(res.reason, 'fbclid_empty');
      }
    });

    it('should ALLOW when fbclid is a valid string', () => {
      const res = evaluateFbclidRule('fb_valid_click_12345');
      assert.strictEqual(res.isDenied, false);
      assert.strictEqual(res.reason, null);
    });
  });

  describe('Condition 2: P2 STARTS_WITH US-hs-Bv', () => {
    it('should DENY when p2 is empty or undefined', () => {
      const emptyCases = ['', '   ', null, undefined];
      for (const val of emptyCases) {
        const res = evaluateP2Rule(val);
        assert.strictEqual(res.isDenied, true);
      }
    });

    it('should DENY when p2 does NOT start with US-hs-Bv', () => {
      const invalidPrefixCases = ['camp_100', 'HI-Lead-Rvs', 'lead_rvs', 'wrong_prefix', '{campaign.id}'];
      for (const val of invalidPrefixCases) {
        const res = evaluateP2Rule(val);
        assert.strictEqual(res.isDenied, true);
      }
    });

    it('should ALLOW when p2 starts with US-hs-Bv or US-TIK-HI-RV', () => {
      const validCases = [
        'US-hs-Bv', 'US-hs-Bv-100', 'US-hs-Bv_promo_2026',
        'US-hs-Bv-camp1', 'us-hs-bv-2026',
        'US-TIK-HI-RVS', 'US-TIK-HI-RV', 'US-TIK-HI-RV-campaign1', 'us-tik-hi-rv-2026',
      ];
      for (const val of validCases) {
        const res = evaluateP2Rule(val);
        assert.strictEqual(res.isDenied, false);
        assert.strictEqual(res.reason, null);
      }
    });
  });

  describe('Condition 3: P15 STARTS_WITH US-hs-Bv', () => {
    it('should DENY when p15 is empty or undefined', () => {
      const emptyCases = ['', '   ', null, undefined];
      for (const val of emptyCases) {
        const res = evaluateP15Rule(val);
        assert.strictEqual(res.isDenied, true);
        assert.strictEqual(res.reason, 'p15_empty');
      }
    });

    it('should DENY when p15 does NOT start with US-hs-Bv', () => {
      const invalidPrefixCases = ['sub_abc', 'HI-Lead-Rvs', '12345', 'lead_rvs', '{p15}'];
      for (const val of invalidPrefixCases) {
        const res = evaluateP15Rule(val);
        assert.strictEqual(res.isDenied, true);
      }
    });

    it('should ALLOW when p15 starts with US-hs-Bv or US-TIK-HI-RV', () => {
      const validCases = [
        'US-hs-Bv', 'US-hs-Bv-test', 'US-hs-Bv_subgroup',
        'US-hs-Bv-sub1', 'us-hs-bv_group',
        'US-TIK-HI-RVS', 'US-TIK-HI-RV', 'US-TIK-HI-RV-sub1', 'us-tik-hi-rv-group',
      ];
      for (const val of validCases) {
        const res = evaluateP15Rule(val);
        assert.strictEqual(res.isDenied, false);
        assert.strictEqual(res.reason, null);
      }
    });
  });

  describe('Combined 3-Condition Evaluation (validateTrackingParams)', () => {
    it('should DENY if both fbclid and ttclid are missing even if p2 & p15 are valid', () => {
      const res = validateTrackingParams({
        p2: 'US-hs-Bv-1',
        p15: 'US-hs-Bv-2',
      });
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.isDenied, true);
    });

    it('should DENY if p2 does not start with valid prefix even if fbclid & p15 are valid', () => {
      const res = validateTrackingParams({
        fbclid: '12345',
        p2: 'other_campaign',
        p15: 'US-hs-Bv-2',
      });
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.isDenied, true);
    });

    it('should DENY if p15 does not start with valid prefix even if fbclid & p2 are valid', () => {
      const res = validateTrackingParams({
        fbclid: '12345',
        p2: 'US-hs-Bv-1',
        p15: 'other_sub',
      });
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.isDenied, true);
      assert.strictEqual(res.denyReason, 'p15_prefix_mismatch');
    });

    it('should ALLOW when ALL conditions are satisfied for Facebook (US-hs-Bv + fb=1)', () => {
      const res = validateTrackingParams({
        fbclid: '12345',
        p2: 'US-hs-Bv-campaign-100',
        p15: 'US-hs-Bv-adset-200',
        fb: '1',
      });
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.isDenied, false);
      assert.strictEqual(res.denyReason, null);
    });

    it('should DENY Facebook traffic when fb=1 is missing or not 1', () => {
      const resMissing = validateTrackingParams({
        fbclid: '12345',
        p2: 'US-hs-Bv-campaign-100',
        p15: 'US-hs-Bv-adset-200',
      });
      assert.strictEqual(resMissing.isValid, false);
      assert.strictEqual(resMissing.isDenied, true);
      assert.strictEqual(resMissing.denyReason, 'facebook_missing_fb');

      const resOther = validateTrackingParams({
        fbclid: '12345',
        p2: 'US-hs-Bv-campaign-100',
        p15: 'US-hs-Bv-adset-200',
        fb: '0',
      });
      assert.strictEqual(resOther.isValid, false);
      assert.strictEqual(resOther.isDenied, true);
      assert.strictEqual(resOther.denyReason, 'facebook_missing_fb');
    });

    it('should ALLOW when ALL conditions are satisfied for TikTok (ttclid + US-TIK-HI-RV + tk=1)', () => {
      const res = validateTrackingParams({
        ttclid: 'fb_123',
        p2: 'US-TIK-HI-RVS',
        p15: 'US-TIK-HI-RVS',
        tk: '1',
      });
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.isDenied, false);
      assert.strictEqual(res.denyReason, null);
    });

    it('should DENY TikTok traffic when tk=1 is missing or not 1', () => {
      const resMissing = validateTrackingParams({
        ttclid: 'fb_123',
        p2: 'US-TIK-HI-RVS',
        p15: 'US-TIK-HI-RVS',
      });
      assert.strictEqual(resMissing.isValid, false);
      assert.strictEqual(resMissing.isDenied, true);
      assert.strictEqual(resMissing.denyReason, 'tiktok_missing_tk');

      const resOther = validateTrackingParams({
        ttclid: 'fb_123',
        p2: 'US-TIK-HI-RVS',
        p15: 'US-TIK-HI-RVS',
        tk: '0',
      });
      assert.strictEqual(resOther.isValid, false);
      assert.strictEqual(resOther.isDenied, true);
      assert.strictEqual(resOther.denyReason, 'tiktok_missing_tk');
    });
  });
});

describe('Tracking Service - Destination URL Generation', () => {
  it('should route to Fallback destination when any condition fails', () => {
    const result = TrackingService.resolveDestination({
      fbclid: 'test_fbclid_123',
      p2: 'wrong_prefix',
      p15: 'US-hs-Bv-1',
    });

    assert.strictEqual(result.isFallback, true);
    assert.strictEqual(result.targetPlatform, 'fallback');
    assert.ok(result.destinationUrl.startsWith(config.fallback.baseUrl));
    assert.match(result.destinationUrl, /clk=test_fbclid_123/);
    assert.ok(result.destinationUrl.includes(`zid=${config.fallback.param2Value || '9482163'}`));
    assert.match(result.destinationUrl, /src=test_fbclid_123/);
  });

  it('should route Facebook traffic to Routeclk when fb=1 is present and attach p11=1253687 before p15', () => {
    const result = TrackingService.resolveDestination({
      fbclid: 'fb_click_999',
      p2: 'US-hs-Bv-camp',
      p15: 'US-hs-Bv-sub',
      fb: '1',
      p3: 'test_p3',
      p4: 'test_p4',
      p5: 'test_p5',
      p6: 'test_p6',
      p10: 'test_p10',
    });

    assert.strictEqual(result.isFallback, false);
    assert.strictEqual(result.targetPlatform, 'routeclk');
    assert.ok(result.destinationUrl.startsWith(config.routeclk.baseUrl));
    assert.match(result.destinationUrl, /fbclid=fb_click_999/);
    assert.match(result.destinationUrl, /p2=US-hs-Bv-camp/);
    assert.match(result.destinationUrl, /p11=1253687/);
    assert.match(result.destinationUrl, /p15=US-hs-Bv-sub/);
    assert.match(result.destinationUrl, /p3=test_p3/);
    assert.match(result.destinationUrl, /p4=test_p4/);
    assert.match(result.destinationUrl, /p5=test_p5/);
    assert.match(result.destinationUrl, /p6=test_p6/);
    assert.match(result.destinationUrl, /p10=test_p10/);

    // Verify p11 is positioned before p15
    const p11Index = result.destinationUrl.indexOf('p11=1253687');
    const p15Index = result.destinationUrl.indexOf('p15=US-hs-Bv-sub');
    assert.ok(p11Index !== -1, 'p11 must be present in destinationUrl');
    assert.ok(p15Index !== -1, 'p15 must be present in destinationUrl');
    assert.ok(p11Index < p15Index, 'p11 must appear before p15');

    // Verify p11 is NOT the last parameter
    const url = new URL(result.destinationUrl);
    const searchParamsKeys = Array.from(url.searchParams.keys());
    const lastKey = searchParamsKeys[searchParamsKeys.length - 1];
    assert.notStrictEqual(lastKey, 'p11', 'p11 must NOT be the last parameter');
  });

  it('should route Facebook traffic to Fallback when fb=1 is missing', () => {
    const resultMissing = TrackingService.resolveDestination({
      fbclid: 'fb_click_999',
      p2: 'US-hs-Bv-camp',
      p15: 'US-hs-Bv-sub',
    });
    assert.strictEqual(resultMissing.isFallback, true);
    assert.strictEqual(resultMissing.targetPlatform, 'fallback');
    assert.strictEqual(resultMissing.denyReason, 'facebook_missing_fb');
    assert.ok(resultMissing.destinationUrl.startsWith(config.fallback.baseUrl));

    const resultOther = TrackingService.resolveDestination({
      fbclid: 'fb_click_999',
      p2: 'US-hs-Bv-camp',
      p15: 'US-hs-Bv-sub',
      fb: '0',
    });
    assert.strictEqual(resultOther.isFallback, true);
    assert.strictEqual(resultOther.targetPlatform, 'fallback');
    assert.strictEqual(resultOther.denyReason, 'facebook_missing_fb');
  });

  it('should route TikTok traffic to routeclk base URL with ttclid and p11=2876212 when tk=1', () => {
    const result = TrackingService.resolveDestination({
      ttclid: 'fb_123',
      p2: 'US-TIK-HI-RVS',
      p15: 'US-TIK-HI-RVS',
      tk: '1',
    });

    assert.strictEqual(result.isFallback, false);
    assert.strictEqual(result.targetPlatform, 'routeclk');
    assert.ok(result.destinationUrl.startsWith(config.routeclk.baseUrl));
    assert.match(result.destinationUrl, /ttclid=fb_123/);
    assert.match(result.destinationUrl, /p2=US-TIK-HI-RVS/);
    assert.match(result.destinationUrl, /p11=2876212/);
    assert.match(result.destinationUrl, /p15=US-TIK-HI-RVS/);

    // p11 must be before p15
    const p11Pos = result.destinationUrl.indexOf('p11=2876212');
    const p15Pos = result.destinationUrl.indexOf('p15=US-TIK-HI-RVS');
    assert.ok(p11Pos < p15Pos, 'p11 must appear before p15 for TikTok traffic');
  });

  it('should route TikTok traffic to Fallback when tk=1 is missing', () => {
    const result = TrackingService.resolveDestination({
      ttclid: 'fb_123',
      p2: 'US-TIK-HI-RVS',
      p15: 'US-TIK-HI-RVS',
    });

    assert.strictEqual(result.isFallback, true);
    assert.strictEqual(result.targetPlatform, 'fallback');
    assert.strictEqual(result.denyReason, 'tiktok_missing_tk');
    assert.ok(result.destinationUrl.startsWith(config.fallback.baseUrl));
  });
});
