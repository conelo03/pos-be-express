const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')

const app = express()
app.use(cors())
app.use(express.json())

// routes
app.get('/api', (req, res) => {
  res.send('Server running 🚀 (CommonJS mode)')
})
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)

module.exports = app
