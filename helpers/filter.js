const { Op } = require('sequelize')

const operatorMap = {
  '$eq': Op.eq,
  '$ne': Op.ne,
  '$gt': Op.gt,
  '$gte': Op.gte,
  '$lt': Op.lt,
  '$lte': Op.lte,
  '$like': Op.like,
  '$in': Op.in,
  '$ilike': Op.iLike
}

function buildWhere(filter, filterBy, group) {
  if (!filter || !filterBy) return {}

  const conditions = filterBy.map((cond, i) => {
    const match = cond.match(/\$(\w+)\((\w+)\)/)
    if (!match) return null
    const [, op, column] = match

    let value = filter[i]
    if (op.toLowerCase() === 'like' || op.toLowerCase() === 'ilike') {
      value = `%${value}%`
    }

    if (op.toLowerCase() === 'ilike') {
      return { [column]: { [Op.iLike]: `%${filter[i]}%` } }
    }

    return { [column]: { [Op[op.toLowerCase()]]: value } }
  }).filter(Boolean)

  if (!conditions.length) return {}

  // group operator: 'and' / 'or'
  const groupOp = group && group[0] && group[0].toLowerCase() === 'or' ? Op.or : Op.and
  return { [groupOp]: conditions }
}

function buildOrder(orderBy, order) {
  if (!orderBy || !order) return [['created_at', 'DESC']]

  return orderBy.map((col, i) => {
    const dbCol = col.replace(/([A-Z])/g, '_$1').toLowerCase()
    return [order[i], dbCol]
  })
}

function buildCondition(query) {
  let { filter, filterBy, group, orderBy, order } = query

  if (filterBy && !Array.isArray(filterBy)) filterBy = [filterBy]
  if (filter && !Array.isArray(filter)) filter = [filter]
  if (orderBy && !Array.isArray(orderBy)) orderBy = [orderBy]
  if (order && !Array.isArray(order)) order = [order]

  const where = buildWhere(filter, filterBy, group)
  const orderArray = buildOrder(orderBy, order)

  return { where, orderArray }
}

module.exports = { buildCondition }