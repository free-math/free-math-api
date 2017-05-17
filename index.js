const q = require('q')
const fs = require('fs')
const path = require('path')
const async = require('async')
const appDir = process.env.PWD + '/'

const db = require('./lib/mongoose.js')()
module.exports.db = db

const math = require('./lib/math.js')
module.exports.math = math

const ocr = require('./lib/ocr.js')
module.exports.ocr = ocr

const user = require('./lib/user.js')
module.exports.user = user

const utils = require('./lib/utils.js')
module.exports.utils = utils

const api = require('./api/main.js')
module.exports.api = api
