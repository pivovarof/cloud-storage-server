const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization error.' });
    }
    const decoded = jwt.verify(token, config.get('priveteKey'));
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Authorization error.' });
  }
};
