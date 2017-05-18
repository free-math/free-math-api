
const chai = require('chai')
const path = require('path')
const nock = require('nock')
const unirest = require('unirest')
const qs = require('qs')
const fs = require('fs')
const _ = require('lodash')

const appDir = (path.resolve(__dirname) + '/').replace('tests/lib/user', '')
const mainFile = require(appDir + 'index.js')
const wolframAPI = process.env.app_id || null
const wolframMock = nock('https://api.wolframalpha.com/v2/')

const db = mainFile.db
const Models = db.models
const mongoose = db.mongoose
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const Mixed = Schema.Types.Mixed
const History = Models.History

const ocr = mainFile.ocr
const math = mainFile.math
const user = mainFile.user
const utils = mainFile.utils
const api = mainFile.api

var expect = chai.expect
var dbStatus = 0
