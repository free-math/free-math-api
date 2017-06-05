// Requires
const path = require('path')
const currentDir = (path.resolve(__dirname) + '/')
const appDir = currentDir.replace('lib/math', '')

const _ = require('lodash')
const q = require('q')
const fs = require('fs')
const async = require('async')
const unirest = require('unirest')
const mathjs = require('mathjs')

const mainFile = require(appDir+'index.js')
const utils = mainFile.utils
const wolframAPI = process.env.app_id || null
const History = mainFile.db.models.History
const ObjectId = mainFile.db.mongoose.Schema.Types.ObjectId

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

  const paramError = {message: 'Please provide a parameter'}
  const typeError = {message: 'Parameter must be a string'}

  const funcArray = [
    (callback) => {
      if (!expression) return callback(paramError)
      if (typeof expression !== 'string') return callback(typeError)

      const isEquation = expression.indexOf('=') > -1 // Needs to be improved

      if (isEquation) {
        const equation = {}
        const expressions = expression.split('=')
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
      const result = {
        isEq: isEq
      }
      if (isEq) {
        result.expression = en.leftHandSide + ' = ' + en.rightHandSide
      } else {
        result.expression = en
      }
      callback(null, result)
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

  const paramErrorMessage = 'Please provide a parameter'
  const arrayErrorMessage = 'Expression array is empty!'
  const typeErrorMessage = 'Parameter must be an array'
  const expressionErrorMessage = 'Expression must be a string'

  const funcArray = [
    (callback) => {
      var hasExpressionError = false
      const paramError = {
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

      const hasError = paramError.status

      if (!hasError) {
        solvedExpressions = _.map(expressions, (expression) => {
          var simplified, result
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
 * beforehand.
 * @type {Function}
 * @param {Object} input Input information
 * @return {Promise} promise
 */
var wolframCall = (input) => {
  var dfd = q.defer()
  utils
    .buildUrl({
      input: input,
      url: 'https://api.wolframalpha.com/v2/query'
    })
    .then(bUrl => {
      console.log(bUrl)
      unirest
      .get(bUrl.url)
      .end(res => {
        if (res.statusCode == 200) { // A OK
          utils.parseXml(res.body)
          .then(result => {
            if ( !result ) {
              return dfd.reject(new Error('Result was not parsed!'))
            }
            if ( result.queryresult.info.error === "true") {
              return dfd.reject(result.queryresult)
            }
            dfd.resolve(result.queryresult)
          })
          .catch(err => dfd.reject(err))
        } else {
          dfd.reject(res)
        }
      })
    })
    .catch(err => dfd.reject(err))
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

  const funcArray = [
    ( callback ) => {
      const endRes = {
        user: input.user,
        query: {},
        solution: {}
      }
      var cache = {}
      getExpType(input.query)
        .then(result => {
          if (result.isEq) { // WolframSolve
            endRes.query = result.expression
            endRes.solveType = 'wolfram'
            wolframCall(input.query)
              .then(result => {
                cache = utils.mapKeysDeep(result, (val, key) => {
                  return key === '$'? 'info' : key
                })
                endRes.solution.info = cache.info
                return getPodById(cache.pod, 'Input')
              })
              .then(inputPod => {
                endRes.solution.inputPod = inputPod
                return getPodById(cache.pod, 'Result')
              })
              .then(resultPod => {

                endRes.solution.resultPod = resultPod
                callback(null, endRes)
              })
              .catch(err => callback(err))
          } else { // MathJS Solve
            endRes.solveType = 'mathjs'
            mathJsSolve([input.query])
              .then(result => {
                endRes.solution = result[0].solution
                endRes.simplified = result[0].simplified
                endRes.error = result[0].error
                endRes.expression = result[0].expression

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
 * Returns pod by id
 * @type {Function} getPodById
 * @param {Array} pods Wolfram pods
 * @return {Promise} promise
 */
var getPodById = (pods, id) => {
  var dfd = q.defer()
  const id2 = id === 'Result'? 'Solution' : null
  const funcArray = [
    ( callback ) => { // Sweep pods looking for result id
      var count = 0
      if(!_.isArray(pods) && !_.isObject(pods)) {
        return callback({message: 'Parameter is not valid!'})
      }
      _.forEach(pods, (value) => {
        const podId = ((value || {}).info || {}).id
        if( podId === id || podId === id2) return callback(null, value)
        count++
        if (count == pods.length) callback({message: 'No '+id +' found!'})
      })
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

  const funcArray = [
    ( callback ) => { // 1
      const eval = {
        evaluation: {},
        firstTime: true
      }
      const paramError = {message: 'Please provide a parameter'}
      const queryTypeError = {message: 'Query must be a string'}
      const provideQueryError = {message: 'Input object must have query property'}

      if (_.isEmpty(input)) return callback(paramError)
      if (!input.query) return callback(provideQueryError)
      if (typeof (input || {}).query !== 'string') return callback(queryTypeError)

      History
        .findOne({query: input.query})
        .exec((err, doc) => {
          callback(err, doc, input)
        })
    },
    (doc, input, callback) => { // 2
      if (doc) { return callback(null, null, doc) }
      evaluate(input)
        .then(result => {
          return callback(null, result, null)
        })
        .catch(err=> {
          return callback(err)
        })
    },
    (result, doc, callback) => { // 3s

      if (result && !doc) {

        const res = {
          user: input.user,
          solveType: result.solveType,
          expression: result.expression || result.query,
          query: input.query,
          ocrResult: result.ocrResult || null,
          result: result.solution
        }
        // console.log(res)
        const model = new History(res)
        model.save(err => {
          // console.log(err)
          eval.evaluation = model
          eval.firstTime = true
          return err? callback(err) : callback(null, eval)
        })
      } else {
        eval.evaluation = doc
        eval.firstTime = false
        callback(null, eval)
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
  wolframCall: wolframCall,
  getPodById: getPodById,
  solve: solve,
  evaluate: evaluate,
  getExpType: getExpType,
  mathJsSolve: mathJsSolve
}
