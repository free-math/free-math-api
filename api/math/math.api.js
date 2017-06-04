const path = require('path')
const currentDir = (path.resolve(__dirname) + '/')
const appDir = currentDir.replace('api/math', '')
const math = require(appDir+'/index.js').math
const express = require('express')
const tesseract_wrapper = require('tesseract-wrapper')
const bodyParser = require('body-parser')
const app = express()
const router = express.Router()


router.post('/math/solve', (req, res) => {

  const expression = req.body.line
  const noLinesMessage = {
    message: 'Please provide an equation or expression for solving!'
  }
  const inputTypeMessage = {
    error: "Wrong input type",
    message: "Equation or expression must be a string!"
  }

  if(!expression) return res.status(500).send(noLinesMessage)

  if(typeof expression !== 'string') {
    return res.status(500).send(inputTypeMessage)
  }

  const input = {
    query: expression
  }

  math
    .solve(input)
    .then(solution => {
      res.json({
        evaluation: solution.evaluation,
        firstTime: solution.firstTime
      })
    })
    .catch(err => res.status(500).send(err))

})

module.exports = router
