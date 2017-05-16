const _ = require('lodash')
const q = require('q')
const unirest = require('unirest')
const wolframAPI = process.env.app_id || null

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

module.exports = {
  buildUrl: buildUrl
}
