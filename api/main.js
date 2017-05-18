const q = require('q')
const fs = require('fs')
const path = require('path')
const async = require('async')

const appDir = process.env.PWD + '/'

const math = require('./math/math.api.js')
const ocr = require('./ocr/ocr.api.js')
const user = require('./user/user.api.js')

module.exports = {
  math: math,
  ocr: ocr,
  user: user
}
