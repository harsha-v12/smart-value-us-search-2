try {
  require('dotenv').config();
} catch {
  // dotenv not installed yet or using built-in --env-file
}

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  routeclk: {
    // /us/search-2/ always uses the dedicated url_id=2 destination.
    search2BaseUrl: process.env.ROUTECLK_SEARCH2_BASE_URL || 'https://nav.rutorbit.com/t/NDkwNV82NDA1/?url_id=2',
    baseUrl: process.env.ROUTECLK_BASE_URL || 'https://nav.rutorbit.com/t/NDkwNV82NDA1/?url_id=2',
    tiktokBaseUrl: process.env.ROUTECLK_TIKTOK_BASE_URL || 'https://nav.rutorbit.com/t/NDkwNV82NDA1/?url_id=2',
    tiktokP11: process.env.TIKTOK_P11_VAL || process.env.TIKTOK_SUB1_VAL || '2876212',
    facebookP11: process.env.FACEBOOK_P11_VAL || process.env.FACEBOOK_SUB1_VAL || '1253687',
    get tiktokSub1() { return this.tiktokP11; },
    get facebookSub1() { return this.facebookP11; },
  },

  fallback: {
    baseUrl: process.env.FALLBACK_BASE_URL || 'https://openvista.live/',
    param1: process.env.FALLBACK_PARAM1 || 'clk',
    param2: process.env.FALLBACK_PARAM2 || 'zid',
    param3: process.env.FALLBACK_PARAM3 || 'src',
    param2Value: process.env.FALLBACK_PARAM2_VAL || process.env.FALLBACK_EFDG || '9482163',
  },
  // Backward compatibility alias
  get valuerise() {
    return this.fallback;
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};

module.exports = config;
