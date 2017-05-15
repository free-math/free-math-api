// Requires
const xml2js = require('xml2js').parseString
const _ = require('lodash')
const q = require('q')
const async = require('async')
const unirest = require('unirest')
const mathjs = require('mathjs')
const mongoose = require('mongoose')
const wolframAPI = process.env.app_id || null
const mongoAddress = 'mongodb://localhost'
mongoose.connect(mongoAddress)

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

  var paramErrorMessage = 'Please provide a parameter'
  var arrayErrorMessage = 'Expression array is empty!'
  var typeErrorMessage = 'Parameter must be an array'
  var expressionErrorMessage = 'Expression must be a string'

  var funcArray = [
    (callback) => {
      var hasExpressionError = false
      var paramError = {
        status: false,
        message: null
      }

      if ( !expressions ) {
        paramError.status = true
        paramError.message = paramErrorMessage
      }

      if ( !_.isArray(expressions) && !!expressions ) {
        paramError.status = true
        paramError.message = typeErrorMessage
      }

      if ( _.isArray(expressions) && _.isEmpty(expressions) ) {
        paramError.status = true
        paramError.message = arrayErrorMessage
      }

      var hasError = paramError.status

      if (!hasError) {
        solvedExpressions = _.map(expressions, (expression) => {
          var simplified, result, error
          try {
            if (typeof expression !== 'string') throw new Error(expressionErrorMessage)
            simplified = mathjs.simplify(expression).toString()
            result = {
              simplified: simplified,
              expression: expression,
              error: null,
              solution: mathjs.eval(simplified)
            }
          } catch (error) {
            hasExpressionError = true
            result = {
              expression: expression,
              error: error
            }
          }
          return result
        })
        if(hasExpressionError) solvedExpressions.hasExpressionError = hasExpressionError
        callback(null, solvedExpressions)
      } else {
        callback(paramError)
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
 * It needs input object to be validated
 * before hand. This also saves the Wolfram
 * result to the database.
 * @type {Function}
 * @param {Object} input Input information
 * @return {Promise} promise
 */
var wolframCall = (input) => {
  var dfd = q.defer()

  unirest
    .get('https://api.wolframalpha.com/v2/query')
    .query('input=' + input)
    .query('primary=true')
    .query('appid=' + wolframAPI)
    .end(res => {
      if (res.statusCode == 200) { // A OK
        xml2js(res.body, (err, result) => {
          if ( err ) return dfd.reject(err)
          if ( !result ) return dfd.reject(new Error('Result was not parsed!'))
          if ( result.queryresult.$.error === "true") return dfd.reject(result.queryresult)
          dfd.resolve(result.queryresult)
        })
      } else {
        dfd.reject(res)
      }
    })
  return dfd.promise
}

/**
 * Evaluate expression function.
 * 1 - Get Expression type
 * 2 - Send to solve
 * 3 - build and return result object
 * @type {Function} evaluate
 * @param {Object} input input data
 * @return {Promise} promise
 */
var evaluate = (input) => {
  var dfd = q.defer()

  var funcArray = [
    ( callback ) => {
      getExpType(input.query)
        .then(result => {
          var endRes = {
            user: result.user,
            query: input.query
          }
          if (result.isEq) { // WolframSolve
            wolframCall(input.query)
              .then(solution => {
                endRes.solveType = ['wolfram']
                endRes.result = solution
                callback(null, endRes)
              })
              .catch(err => callback(err))
          } else { // MathJS Solve
            mathJsSolve([input.query])
              .then(solution => {
                endRes.solveType = ['mathjs']
                endRes.result = solution
                callback(null, endRes)
              })
              .catch(err => callback(err))
          }
        })
        .catch(err => callback(err))
    }
  ]

  async.waterfall(
    funcArray,
    (err, result) => err ? dfd.reject(err) : dfd.resolve(result)
  )

  return dfd.promise
}

/**
 * Main Solve function, check if exists in the database,
 * if not, evaluates the input and saves the result at the end
 * @type {Function} solve
 * @param {Object} input input data
 * @return {Promise} promise
 */
var solve = (input) => {
  var dfd = q.defer()

  var funcArray = [
    ( callback ) => { // 1
      //VALIDATE INPUT HERE
      History
        .findOne({query: input.query})
        .where('active', true)
        .exec((err, doc) => {
          callback(err, doc, input)
        })
    },
    (doc, input, callback) => { // 2
      if (doc) return callback(null, null, doc)
      evaluate(input)
        .then(result => callback(null, result, null))
        .catch(err=> callback(err))
    },
    (result, doc, callback) => { // 3
      if (result && !doc) {
        var model = new History({
          user: result.user,
          solveType: result.solveType,
          query: result.query,
          result: result.res
        })
        model.save(err => err? callback(err) : callback(null, model))
      } else {
        callback(null, doc)
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
 * Exports
 */
module.exports = {
  db: mongoose,
  wolframCall: wolframCall,
  getExpType: getExpType,
  mathJsSolve: mathJsSolve
}
