const _ = require('lodash')
const q = require('q')
const unirest = require('unirest')
const wolframAPI = process.env.app_id || null
const xml2js = require('xml2js').parseString

const buildUrl = (params) => {
  var dfd = q.defer()

  const url = unirest.get()
                  .url(params.url)
                  .query('input=' + encodeURIComponent(params.input) )
                  .query('primary=true')
                  .query('appid=' + wolframAPI)
                  .options.url
                  .split(' ').join('%20')

  const query = url.replace(params.url, '')

  dfd.resolve({
    url:url,
    query:query
  })

  return dfd.promise
}

const mapKeysDeep = (obj, cb) => {
  return _.mapValues(_.mapKeys(obj, cb), val => {
    return _.isObject(val) ? mapKeysDeep(val, cb) : val
  })
}

const parseXml = (xml) => {
  var dfd = q.defer()
  xml2js(xml, (err, result) => {
    if (err) return dfd.reject(err)
    result = mapKeysDeep(result, (val, key) => {
      return key === '$'? 'info' : key
    })
    dfd.resolve(result)
  })
  return dfd.promise
}

module.exports = {
  mapKeysDeep: mapKeysDeep,
  buildUrl: buildUrl,
  parseXml: parseXml
}
