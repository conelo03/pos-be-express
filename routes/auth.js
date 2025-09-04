const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../models/index')
const { verifyToken } = require('../middleware/auth')

const { User } = db
const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body

    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: 'Data tidak lengkap' })
    }

    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return res.status(400).json({ message: 'Email has been Registered' })
    }

    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
      return res.status(400).json({ message: 'Username has been taken' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, username, password: hashed, role })

    res.json({ message: 'User added successfully', user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const user = await User.findOne({ where: { username } })
    if (!user) return res.status(400).json({ error: 'User not found' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ error: 'Wrong password' })

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    const { password: _, ...userData } = user.toJSON()

    res.json({ token, user: userData, message: 'Login Success' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)

    if (!user) return res.status(404).json({ message: 'User not Found' })

    const { password: _, ...userData } = user.toJSON()

    res.json({ user: userData })
  } catch (err) {
    res.status(403).json({ message: 'Invalid Token' })
  }
})

router.post('/logout', verifyToken, (req, res) => {
  // stateless JWT → tidak perlu hapus token di server
  // frontend cukup hapus token dari localStorage / cookie
  res.json({ message: 'Logout successful' })
})

module.exports = router
