const path = require('path')
const currentDir = (path.resolve(__dirname) + '/')
const appDir = currentDir.replace('api/ocr', '')
const ocr = require(appDir+'/index.js').ocr
const express = require('express')
const tesseract_wrapper = require('tesseract-wrapper')
const bodyParser = require('body-parser')
const app = express()
const router = express.Router()


router.post('/ocr', (req, res) => {
  var result, options = req.body

  if(!req.body.data || !req.body.lang) {
    res.status(500).send({
      error: "Data missing",
      message: "Please provide image data and language data"
    })
  }

  tesseract_wrapper
    .execTesseract(options)
    .then(ocrImg => {
      result = ocrImg
      return ocr.getLines(result.fileContent)
    })
    .then(content => {
      result.fileContent = content
      res.json(result)
    })
    .catch(err => res.status(500).send(err))
})

module.exports = router
