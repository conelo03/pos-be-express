function success(res, data = {}, message = 'Success', status = 200) {
  return res.status(status).json({ success: true, message, data })
}

function error(res, message = 'Error', errors = [], status = 400) {
  return res.status(status).json({ success: false, message, errors })
}

module.exports = {
  success, 
  error
}
