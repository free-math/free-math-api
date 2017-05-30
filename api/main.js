const q = require('q')
const fs = require('fs')
const path = require('path')
const async = require('async')
const express = require('express')
const bodyParser = require('body-parser')
const address = '127.0.0.1'
const port = 7000
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({limit: '10mb'}))

const ocr = require('./ocr/ocr.api.js')
// const math = require('./math/math.api.js')
// const user = require('./user/user.api.js')

app.get('/api/test', (req, res) => {
  res.json({ message: 'API Testing here' })
})

app.use('/api', ocr)
// app.use('/api', math)
// app.use('/api', user)


var listener = app.listen(port, address, () => {
  console.log('API running on: ' + listener.address().address+':'+listener.address().port)
})

module.exports = {
  // math: math,
  // user: user,
  ocr: ocr,
  app: app
}
