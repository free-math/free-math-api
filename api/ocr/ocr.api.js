const express = require('express')
const tesseract_wrapper = require('tesseract-wrapper');
const bodyParser = require('body-parser')
const app = express()
const router = express.Router()


router.post('/ocr', (req, res) => {
  var options = req.body

  if(!req.body.data || !req.body.lang) {
    res.status(500).send({
      error: "Data missing",
      message: "Please provide image data and language data"
    })
  }

  tesseract_wrapper
    .execTesseract(options)
    .then(result => {
      res.json(result)
    })
    .catch(err => {
      res.status(500).send(err)
    })
})

module.exports = router
