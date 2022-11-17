function cors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Decompressed-Content-Length, Authorization'
  );
  next();
}

module.exports = cors;
