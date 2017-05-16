const q = require('q')
const fs = require('fs')
const path = require('path')
const async = require('async')
const appDir = process.env.PWD + '/'

//Imports
const math = require('./lib/math.js')
const ocr = require('./lib/ocr.js')
const user = require('./lib/user.js')
const utils = require('./lib/utils.js')
const api = require('./api/main.js')

//Exports
module.exports = {
  api: api,
  math: math,
  ocr: ocr,
  utils: utils,
  user: user
}
