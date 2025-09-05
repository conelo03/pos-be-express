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

function buildWhere(filter, filterBy, grouping) {
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

  if (!grouping || !grouping.length) {
    return { [Op.and]: conditions }; // default
  }

  // 🔥 fold conditions step by step
  let result = conditions[0];
  for (let i = 0; i < grouping.length; i++) {
    const op = grouping[i].toLowerCase() === "or" ? Op.or : Op.and
    result = { [op]: [result, conditions[i + 1]] }
  }

  return result
}

function buildOrder(orderBy, order) {
  if (!orderBy || !order) return [['created_at', 'DESC']]

  return orderBy.map((col, i) => {
    const dbCol = col.replace(/([A-Z])/g, '_$1').toLowerCase()
    return [order[i], dbCol]
  })
}

function buildCondition(query) {
  let { filter, filterBy, grouping, orderBy, order } = query

  if (filterBy && !Array.isArray(filterBy)) filterBy = [filterBy]
  if (filter && !Array.isArray(filter)) filter = [filter]
  if (grouping && !Array.isArray(grouping)) grouping = [grouping]
  if (orderBy && !Array.isArray(orderBy)) orderBy = [orderBy]
  if (order && !Array.isArray(order)) order = [order]

  const where = buildWhere(filter, filterBy, grouping)
  const orderArray = buildOrder(orderBy, order)

  return { where, orderArray }
}

module.exports = { buildCondition }