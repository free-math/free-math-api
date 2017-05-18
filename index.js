const q = require('q')
const fs = require('fs')
const path = require('path')
const async = require('async')
const appDir = process.env.PWD + '/'

const db = require('./lib/mongoose/mongoose.js')()
module.exports.db = db

const utils = require('./lib/utils/utils.js')
module.exports.utils = utils

const math = require('./lib/math/math.js')
module.exports.math = math

const ocr = require('./lib/ocr/ocr.js')
module.exports.ocr = ocr

const user = require('./lib/user/user.js')
module.exports.user = user

const api = require('./api/main.js')
module.exports.api = api
