const { sendError } = require('../utils/helpers');

function notFoundHandler(req, res) {
  return sendError(res, 'Kaynak bulunamadı', 404);
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  // express.json() — bozuk JSON gövdesi
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400)) {
    return sendError(res, 'Geçersiz JSON gövdesi. Content-Type: application/json ve geçerli JSON kullanın.', 400);
  }

  // Mongoose — geçersiz ObjectId / cast
  if (err.name === 'CastError') {
    return sendError(res, 'Geçersiz kimlik veya veri formatı', 400);
  }

  // Multer fileFilter — geçersiz MIME
  if (err.message === 'Sadece JPEG, PNG, GIF veya WebP yükleyin') {
    return sendError(res, err.message, 400);
  }

  // Multer — dosya boyutu / tip
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'Dosya en fazla 2 MB olabilir', 400);
    }
    return sendError(res, err.message || 'Yükleme hatası', 400);
  }

  // Mongoose — şema doğrulama
  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => ({
      message: e.message,
      path: e.path ? [e.path] : [],
    }));
    return sendError(res, 'Veri doğrulama hatası', 400, details);
  }

  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';
  const message =
    statusCode === 500
      ? isProd
        ? 'Sunucu hatası'
        : err.message || 'Sunucu hatası'
      : err.message;
  const details = err.details;
  if (statusCode === 500 && !isProd) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return sendError(res, message, statusCode, details);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
