const express = require('express')
const db = require('../models/index')
const bcrypt = require('bcrypt')
const { verifyToken } = require('../middleware/auth')
const { success, error } = require('../helpers/response')
const { buildCondition } = require('../helpers/filter')

const { User } = db

const router = express.Router()

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body

    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return error(res, 'Email has been Registered', [], 400)
    }

    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
      return error(res, 'Username has been taken', [], 400)
    }

    const hashed = await bcrypt.hash(password, 10)

    const data = await User.create({
      name,
      email,
      username,
      password: hashed,
      role,
      updatedBy: req.user.id,
      createdBy: req.user.id
    })

    return success(res, data, 'User created')
  } catch (err) {
    console.error(err)
    return error(res, 'Server error', [], 500)
  }
})

router.get('/', verifyToken, async (req, res) => {
  try {
    let { page, limit, ...query } = req.query

    page = parseInt(page) || 1
    limit = parseInt(limit) || 10

    const offset = (page - 1) * limit

    const { where, orderArray } = buildCondition(query)

    const { count, rows: users } = await User.findAndCountAll({
      limit,
      offset,
      order: orderArray,
      where
    })

    const total = Math.ceil(count / limit)

    const data = {
      result: users,
      page,
      count,
      limit,
      total
    }
    return success(res, data)
  } catch (err) {
    console.error(err)
    return error(res, 'Server error', [], 500)
  }
})

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const data = await User.findByPk(req.params.id)
    if (!data) return error(res, 'User not found', [], 400)

    return success(res, data, 'User retrieved')
  } catch (err) {
    console.error(err)
    return error(res, 'Server error', [], 500)
  }
})

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, username, role } = req.body
    const data = await User.findByPk(req.params.id)

    if (!data) return error(res, 'User not found', [], 400)

    const existing = await User.findOne({ where: { username } })
    if (existing && (username !== data.username)) {
      return error(res, 'Username has been Taken', [], 400)
    }

    await data.update({ name, username, role, updatedBy: req.user.id })

    return success(res, data, 'User updated')
  } catch (err) {
    console.error(err)
    return error(res, 'Server error', [], 500)
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const data = await User.findByPk(req.params.id)

    if (!data) return error(res, 'User not found', [], 400)

    await data.destroy()
    return success(res, {}, 'User deleted')
  } catch (err) {
    console.error(err)
    return error(res, 'Server error', [], 500)
  }
})

module.exports = router
