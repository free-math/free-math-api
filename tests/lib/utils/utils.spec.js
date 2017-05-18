
const chai = require('chai')
const path = require('path')
const nock = require('nock')
const unirest = require('unirest')
const qs = require('qs')
const fs = require('fs')
const _ = require('lodash')

const appDir = (path.resolve(__dirname) + '/').replace('tests/lib/utils', '')
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

describe('Testing the Utils Module', () => {
  describe('the functionalities of the buildUrl method', () => {
    it('should be a function', function (done) {
      var err = null
      try {
        expect(typeof utils.buildUrl).to.be.equal('function')
      } catch (error) {
        err = error
      }
      done(err)
    })
    it('should build url correctly', function (done) {
      var err = null
      const args = {
        url: 'https://api.wolframalpha.com/v2/query',
        input: '(7*x)+2=12'
      }
      const testUrl = 'https://api.wolframalpha.com/v2/query?input=(7*x)%2B2%3D12&primary=true&appid='+wolframAPI

      utils
        .buildUrl(args)
        .then(result => {
          var err = null
          try {
            expect(result.url).to.be.equal(testUrl)
          } catch (error) {
            err = error
          }
          done(err)
        })
        .catch(err => done(err))
    })
    it('should build query correctly', function (done) {
      var err = null
      const args = {
        url: 'https://api.wolframalpha.com/v2/query',
        input: '(7*x)+2=12'
      }
      const testUrl = '?input=(7*x)%2B2%3D12&primary=true&appid='+wolframAPI

      utils
        .buildUrl(args)
        .then(result => {
          var err = null
          try {
            expect(result.query).to.be.equal(testUrl)
          } catch (error) {
            err = error
          }
          done(err)
        })
        .catch(err => done(err))
    })
  })
  describe('the functionalities of the parseXML method', () => {
    it('should be a function', function (done) {
      var err = null
      try {
        expect(typeof utils.parseXml).to.be.equal('function')
      } catch (error) {
        err = error
      }
      done(err)
    })
    it('should parse xml correctly correctly', function (done) {
      const XML = fs.readFileSync(appDir + '/tests/(7*x)+2=12.xml', 'utf-8')

      utils
        .parseXml(XML)
        .then(result => {
          var err = null
          try {
            expect(result.queryresult).to.have.property('info')
          } catch (error) {
            err = error
          }
          done(err)
        })
        .catch(err => done(err))
    })
    it('should build query correctly', function (done) {
      var err = null
      const args = {
        url: 'https://api.wolframalpha.com/v2/query',
        input: '(7*x)+2=12'
      }
      const testUrl = '?input=(7*x)%2B2%3D12&primary=true&appid='+wolframAPI

      utils
        .buildUrl(args)
        .then(result => {
          var err = null
          try {
            expect(result.query).to.be.equal(testUrl)
          } catch (error) {
            err = error
          }
          done(err)
        })
        .catch(err => done(err))
    })
  })
})
