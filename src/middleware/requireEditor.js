const requireAuth = require('./requireAuth');

module.exports = function requireEditor(req, res, next) {
  return requireAuth(req, res, () => {
    if (req.session.role === 'editor') return next();
    return res.status(403).json({ error: 'Només la persona editora pot modificar dades' });
  });
};