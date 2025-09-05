const express = require('express')
const db = require('../models/index')
const { verifyToken } = require('../middleware/auth')
const { success, error } = require('../helpers/response')
const { buildWhere, buildOrder, buildCondition } = require('../helpers/filter')

const { Product } = db

const router = express.Router()

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, price } = req.body

    const product = await Product.create({
      name,
      description,
      price,
      updatedBy: req.user.id,
      createdBy: req.user.id
    })

    return success(res, product, 'Product created')
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

    const { count, rows: products } = await Product.findAndCountAll({
      limit,
      offset,
      order: orderArray,
      where
    })

    const total = Math.ceil(count / limit)

    const data = {
      result: products,
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
    const product = await Product.findByPk(req.params.id)
    if (!product) return error(res, 'Product not found', [], 400)

    return success(res, product, 'Product retrieved')
  } catch (err) {
    console.error(err)
    return error(res, 'Server error', [], 500)
  }
})

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, description, price } = req.body
    const product = await Product.findByPk(req.params.id)

    if (!product) return error(res, 'Product not found', [], 400)

    await product.update({ name, description, price, updatedBy: req.user.id })

    return success(res, product, 'Product updated')
  } catch (err) {
    console.error(err)
    return error(res, 'Server error', [], 500)
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product) return error(res, 'Product not found', [], 400)

    await product.destroy()
    return success(res, {}, 'Product deleted')
  } catch (err) {
    console.error(err)
    return error(res, 'Server error', [], 500)
  }
})

module.exports = router
