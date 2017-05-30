const path = require('path')
const currentDir = (path.resolve(__dirname) + '/')
const apiDir = currentDir.replace('tests/api/ocr', '')
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
        expect(result.body)
          .to.have.property('message')
          .and.to.equal('API Testing here')
        done()
      })
  })

  it('should OCR result specified', function (done) {
    fs.readFile(
      currentDir + '/clean_photo_test.jpg',
      (err, data) => {

        if (err) return done(err)

        var options = {
          data: new Buffer(data).toString('base64'),
          lang: 'eng'
        }

        unirest
          .post('http://127.0.0.1:7000/api/ocr')
          .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
          .send(options)
          .end(result => {
            if(result.status == 500) return done(result.body)
            expect(result.body)
              .to.be.an('object')
              .and.to.have.property('fileContent')
              .and.to.not.be.equal('')
            done()
          })
      }
    )
  })
})
