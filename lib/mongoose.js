const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId
const _ = require('lodash')

//Models
var models = {
  History: () => {
    //Model info
    var collectionName = 'history'
    var modelName = 'History'
    var model =  {
      user: {
        type: ObjectId,
        required: false
      },
      solveType: {
        type: String,
        required: true,
        enum: ['mathjs', 'wolfram']
      }
      query: {
        type: String,
        required: true
      },
      result: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }

    //Define Schema
    var dataSchema = mongoose.Schema(model, {collection: collectionName})

    //Define hooks
    dataSchema.pre('save', function(next){
      next()
    })

    //return Schema and Model Name
    return {
      schema: dataSchema,
      name: modelName
    }
  },
  User: () => {
    //Model info
    var collectionName = ''
    var modelName = ''
    var model = {
      email: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: false,
      },
      password: {
        type: String,
        required: true
      },
      date_registered: {
        type: Date,
        default: Date.now
      }
    }

    //Define Schema
    var dataSchema = mongoose.Schema(model, {collection: collectionName})

    //Define hooks
    dataSchema.pre('save', function(next){
      next()
    })

    //return Schema and Model Name
    return {
      schema: dataSchema,
      name: modelName
    }
  }

}

module.exports = () => _.mapValue(models, (value, key) => {
  var model = value()
  return mongoose.model(model.modelName, model.schema)
})
