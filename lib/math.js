//Requires
const _ = require('lodash')
const q = require('q')
const async = require('async')
const mathjs = require('mathjs')

/**
 * Checks if the expression is an equation or a simple math
 * expression. Checks if there is an = sign and/or variables
 * to decide.
 * @type {Function}
 * @param {String} expressions Math expressions
 * @return {Promise} promise
 */
var getExpType = (expression) => {
  var dfd = q.defer()

  var paramError = {message: 'Please provide a parameter'}
  var typeError = {message: 'Parameter must be a string'}

  var funcArray = [
    (callback) => {
      if (!expression) return callback( paramError )
      if (typeof expression != 'string') return callback( typeError )

      var isEquation = expression.indexOf('=') > -1 // Needs to be improved

      if(isEquation) {
        var equation = {}
        var expressions = expression.split('=')
        equation.leftHandSide = mathjs.parse(expressions[0]).toString()
        equation.leftHandSide = mathjs.simplify( equation.leftHandSide ).toString()
        equation.rightHandSide = mathjs.parse(expressions[1]).toString()
        equation.rightHandSide = mathjs.simplify( equation.rightHandSide ).toString()
        callback(null, equation, isEquation)
      } else {
        expression = mathjs.parse(expression).toString()
        callback(null, expression, isEquation)
      }
    },
    (en, isEq, callback) => {
      var err = null
      var result = {
        equation: isEq
      }
      if (isEq) {
        result.expression = en.leftHandSide + ' = ' + en.rightHandSide
      } else {
        result.expression = en
      }
      callback(err, result)
    }
  ]

  async.waterfall(
    funcArray,
    (err, result) => err ? dfd.reject(err) : dfd.resolve(result)
  )

  return dfd.promise
}



module.exports = {
  getExpType: getExpType
}
