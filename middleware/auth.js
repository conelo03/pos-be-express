const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

    if (!token) return res.status(401).json({ error: 'No token provided' })

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' })
  }
}

module.exports = { verifyToken }

