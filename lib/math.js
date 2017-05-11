// Requires
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
      if (!expression) return callback(paramError)
      if (typeof expression !== 'string') return callback(typeError)

      var isEquation = expression.indexOf('=') > -1 // Needs to be improved

      if (isEquation) {
        var equation = {}
        var expressions = expression.split('=')
        equation.leftHandSide = mathjs.parse(expressions[0]).toString()
        equation.leftHandSide = mathjs.simplify(equation.leftHandSide).toString()
        equation.rightHandSide = mathjs.parse(expressions[1]).toString()
        equation.rightHandSide = mathjs.simplify(equation.rightHandSide).toString()
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

/**
 * Solves mathematical expression
 * @type {Function}
 * @param {Array} expressions Math expressions
 * @return {Promise} promise
 */
var mathJsSolve = (expressions) => {
  var dfd = q.defer()

  var paramError = {message: 'Please provide a parameter'}
  var typeError = {message: 'Parameter must be an array'}
  var expressionError = {message: 'Expression must be a string'}

  var funcArray = [
    (callback) => {
      var hasError = false
      var solvedExpressions = _.map(expressions, (expression) => {
        var simplified, result, error
        try {
          simplified = mathjs.simplify(expression).toString()
          result = {
            simplified: simplified,
            expression: expression,
            error: null,
            solution: mathjs.eval(simplified)
          }
        } catch (error) {
          hasError = true
          result = {
            expression: expression,
            error: error
          }
        }
        return result
      })

      if (hasError) {
        callback(solvedExpressions)
      } else {
        callback(null, solvedExpressions)
      }
    }
  ]

  async.waterfall(
    funcArray,
    (err, result) => err ? dfd.reject(err) : dfd.resolve(result)
  )

  return dfd.promise
}

/**
 * Wraps promise over Wolfram Module.
 * needs input object to be validated
 * before hand. This also saves the Wolfram
 * result to the database.
 * @type {Function}
 * @param {Object} input Input information
 * @return {Promise} promise
 */
var wolframCall = (input) => {
  var dfd = q.defer()

  wolfram.query(input.query, (err, result) => {
    if (err) return dfd.reject(err)

    var hist = new History({{
      user: input.user,
      query: input.query,
      equation: input.equation,
      result: result
    })

    hist.save( err => {
      if (err) return dfd.reject(err)
      dfd.resolve(err)
    })
  })

  return dfd.promise
}

/**
 * Gets wolfram result from Wolfram API
 * 1 - Checks if input is saved on database
 * 2 - if not, call wolfram
 * 3 - Save wolfram result to database
 * 4 - Resolves data-base entry
 * @type {Function}
 * @param {Array} expressions Math expressions
 * @return {Promise} promise
 */
var wolframSolve = (input) => {
  var dfd = q.defer()

  var paramError = {message: 'Please provide a parameter'}
  var typeError = {message: 'Parameter must be an array'}
  var expressionError = {message: 'Expression must be a string'}

  var funcArray = [
    ( callback ) => { // 1
      //INPUT ASSERTS HERE
      History
        .findOne({query: input.query})
        .where('active': true)
        .exec((err, doc) => {
          callback(err, doc, input)
        })
    },
    ( doc, input, callback ) => {
      if ( !doc ) { // 2
        wolframCall( input ) // 3
        .then( res => callback( null, res ) ) // 4
        .catch( err => callback( err ) )
      } else {
        callback( null, doc ) // 4
      }
    }
  ]

  async.waterfall(
    funcArray,
    (err, result) => err ? dfd.reject(err) : dfd.resolve(result)
  )

  return dfd.promise
}



module.exports = {
  getExpType: getExpType,
  mathJsSolve: mathJsSolve
}
