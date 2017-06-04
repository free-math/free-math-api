const path = require('path')
const currentDir = (path.resolve(__dirname) + '/')
const apiDir = currentDir.replace('tests/api/math', '')
const mainFile = require(apiDir + '/api/main.js')
const chai = require('chai')
const unirest = require('unirest')
const fs = require('fs')

const expect = chai.expect

describe('API testing', () => {
  it('should return test message', function (done) {
    unirest
      .get('http://127.0.0.1:7000/api/test')
      .end(result => {
        var err = null
        try {
          expect(result.body)
          .to.have.property('message')
          .and.to.equal('API Testing here')
        } catch (error) {
          err = error
        }
        done(err)
      })
  })

  describe('Endpoints testing', () => {
    it('should return solution for 1 + 1', function (done) {
      const expression = {
        line: '1+1'
      }
      unirest
      .post('http://127.0.0.1:7000/api/math/solve')
      .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
      .send(expression)
      .end(result => {

        const body = result.body
        const eval = body.evaluation
        const status = result.status

        var err = null

        try {
          expect(status).to.be.equal(200)
          expect(body).to.have.property('evaluation')
          expect(eval).to.have.property('solveType', 'mathjs')
          expect(eval).to.have.property('expression', '1+1')
          expect(eval).to.have.property('query', '1+1')
          expect(eval).to.have.property('ocrResult', null)
          expect(eval).to.have.property('result', 2)
          expect(eval).to.have.property('active', true)
        } catch (e) {
          err = e
        }

        done(err)
      })
    })
  })
})
