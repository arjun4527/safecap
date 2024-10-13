const noCacheMiddleware = (req, res, next) => {
  res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
  });

  next();
}

module.exports = 

  noCacheMiddleware
  
