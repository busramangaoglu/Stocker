const { app } = require('../app/server');
const { connectDatabase } = require('../app/config/database');

module.exports = async (req, res) => {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (err) {
    console.error('Sunucu başlatma hatası:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};
