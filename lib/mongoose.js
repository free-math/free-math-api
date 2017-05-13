const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId
const _ = require('lodash')
const config = require('./private.config.js')

//Models
var models = {
  History: () => {
    //Model info
    var collectionName = ''
    var modelName = ''
    var model = {}

    //Define Schema
    var dataSchema = mongoose.Schema(model, {collection: collectionName})

    //Define hooks
    dataSchema.pre('save', function(next){
      next()
    })

    return {
      schema: dataSchema,
      name: modelName,
      model: model
    }
  },
  User: () => {
    //Model info
    var collectionName = ''
    var modelName = ''
    var model = {}

    //Define Schema
    var dataSchema = mongoose.Schema(model, {collection: collectionName})

    //Define hooks
    dataSchema.pre('save', function(next){
      next()
    })

    return {
      schema: dataSchema,
      name: modelName,
      model: model
    }
  }

}

module.exports = () => _.mapValue(models, (value, key) => {
  var model = value()
  return mongoose.model(model.modelName, model.schema)
})
