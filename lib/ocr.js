//Requires
const _ = require('lodash')
const q = require('q')
const async = require('async')

/**
 * Split string by line separtor \n
 * @type {Function}
 * @param {String} fileContent File content from OCR result
 * @return {Promise} promise
 */
var getLines = (fileContent) => {
  var dfd = q.defer()

  var paramError = {message: 'Please provide a parameter'}
  var typeError = {message: 'Parameter must be a string'}

  async.waterfall(
    [(callback) => {
      if (!fileContent) return callback( paramError )
      if (typeof fileContent != 'string') return callback( typeError )
      var fileContentArray = _.compact( fileContent.split('\n') )
      callback(null, fileContentArray)
    }],
    (err, result) => err ? dfd.reject(err) : dfd.resolve(result)
  )

  return dfd.promise
}

module.exports = {
  getLines: getLines
}
