
const chai = require('chai')
const path = require('path')
const nock = require('nock')
const unirest = require('unirest')
const qs = require('qs')
const fs = require('fs')
const _ = require('lodash')

const appDir = (path.resolve(__dirname) + '/').replace('tests/lib/ocr', '')
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

describe('Testing Lib OCR module', () => {
  describe('the functionalities of the Get Lines Method', () => {
    it('should be a function', function (done) {
      var err = null
      try {
        expect(typeof ocr.getLines).to.be.equal('function')
      } catch (error) {
        err = error
      }
      done(err)
    })
    it('Should split lines correctly', function (done) {
      this.timeout(5000)
      var fileContent = '2x" -7x +3 = 0\n(2x -1) (x -3)= 0\n\n'
      ocr
        .getLines(fileContent)
        .then(result => {
          var err = null
          try {
            expect(result).to.be.an('array')
            expect(result[0]).to.be.a('string').and.to.be.equal('2x" -7x +3 = 0')
            expect(result[1]).to.be.a('string').and.to.be.equal('(2x -1) (x -3)= 0')
          } catch (error) {
            err = error
          }
          done(err)
        })
        .catch(err => {
          done(expect(err).to.be.ok)
        })
    }) // OK
    it('Should return error when no parameter', function (done) {
      this.timeout(5000)
      ocr
        .getLines()
        .then(result => {
          done(expect(result).to.be.not.ok)
        })
        .catch(err => {
          var mErr = null
          try {
            expect(err).to.be.an('object')
            expect(err.message).to.be.equal('Please provide a parameter')
          } catch (error) {
            mErr = error
          }
          done(mErr)
        })
    }) // OK
    it('Should return error when type of parameter is not string', function (done) {
      this.timeout(5000)
      ocr
        .getLines(123)
        .then(result => {
          done(expect(result).to.be.not.ok)
        })
        .catch(err => {
          var mErr = null
          try {
            expect(err).to.be.an('object')
            expect(err.message).to.be.equal('Parameter must be a string')
          } catch (error) {
            mErr = error
          }
          done(mErr)
        })
    })
  })
})
