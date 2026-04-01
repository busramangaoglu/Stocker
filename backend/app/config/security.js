/**
 * İleride JWT, rate limiting, helmet vb. burada yapılandırılabilir.
 * CORS_ORIGINS: virgülle ayrılmış izinli origin listesi (production'da kullanın).
 * Örn: https://frontend.vercel.app,https://custom-domain.com
 */
module.exports = {
  corsOptions: {
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
      : true,
    credentials: true,
  },
};
