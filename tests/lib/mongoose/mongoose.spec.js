
const chai = require('chai')
const path = require('path')
const nock = require('nock')
const unirest = require('unirest')
const qs = require('qs')
const fs = require('fs')
const _ = require('lodash')

const appDir = (path.resolve(__dirname) + '/').replace('tests/lib/mongoose', '')
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

describe('Mongoose connection', () => {
  it('should connect without error', function (done) {
    this.timeout(5000)
    var arg = null
    setTimeout(() => {
      try {
        expect(mongoose.connection.readyState).to.be.equal(1)
      } catch (err) {
        arg = err
      }
      done(arg)
    }, 1000)
  })
  it('should save History without error', function (done) {
    this.timeout(5000)

    var mErr = null
    var hist = null

    try {
      hist = new History({
        solveType: 'mathjs',
        query: '2*x + 5 = 0',
        expression: '2*x + 5 = 0',
        result: {
          testUrl: '123123',
          mixed: true
        }
      })
    } catch (error) {
      mErr = error
    }

    hist.save(err => {
      if (err) return done(err)
      History.findByIdAndRemove(hist._id, (err, result) => {
        if (err) return done(err)
        History.findById(hist._id, (err, result) => {
          try {
            expect(err).to.be.not.ok
            expect(result).to.be.not.ok
          } catch (error) {
            mErr = error
          }
          done(mErr)
        })
      })
    })
  })
})
