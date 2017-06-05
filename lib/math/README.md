# Welcome to the Math Library Module

## What is this?
This module contains all the functions required to classify mathematical expressions,
fetch the resolve and save history of queries.


## Methods
  * [getExpType](#getExpType)
  * [mathJsSolve](#mathJsSolve)
  * [wolframCall](#wolframCall)
  * [evaluate](#evaluate)
  * [solve](#solve)


### getExpType

#### Description:
Checks if the expression is an equation or a simple math
expression. Checks if there is an = sign and/or variables
to decide

#### Params
  * **expression**: String of the equation/expression.

| Property   | Value Type | Description                       |
| -----------|:-----------| ----------------------------------|
| expression | String     | Input expression to be classified |

#### Return
  * **promise**: Object with result data. See example for detail.

| Property   | Value Type | Description                          |
| -----------|:-----------| -------------------------------------|
| isEq       | Boolean    | If the expression is an equation     |
| expression | String     | Simplified and normalized expression |

### Example

```javascript
const expression = 'x^2 + 7x +3 = 0'

math.getExpType(expression)
  .then(result => console.log(result))
  .then(err => console.log(err))

```

The result would be:

```javascript
  {
    isEq: true,
    expression: 'x ^ 2 - 7 * x + 3 = 0'
  }
```

Please note that the result expression is different from the original expression.
The MathJS module simplifies and normalizes the input, giving out a much nicer
result expression.

### mathJsSolve

#### Description:
Solves non-equation expressions.

#### Params
  * **expressions**: Array of the expressions. Each expression should be a string.

| Property   | Value Type | Description                       |
| -----------|:-----------| ----------------------------------|
| expression | Array      | Input expression to be classified |

#### Return
  * **promise**: Array of objects with solution data. Each object has the following
  structure

| Property   | Value Type | Description                                                    |
| -----------|:-----------| ---------------------------------------------------------------|
| simplified | String     | Simplified expression. In this case, is the result as a String |
| expression | String     | Input Expression                                               |
| error      | String     | Error that occurred during solving of the expression           |
| Solution   | Number     | Solution of the expression                                     |

### Example

```javascript
const expressions = ['sqrt(9)', '123+77']

math.mathJsSolve(expressions)
  .then(result => console.log(result))
  .then(err => console.log(err))

```

The result would be:

```javascript
  [
    {
      simplified: '3',
      expression: 'sqrt(9)',
      error: null,
      solution: 3
    },
    {
      simplified: '200',
      expression: '123+77',
      error: null,
      solution: 200
    }
  ]

```

### wolframCall

#### Description:
Wraps promise over Wolfram Module.It needs input object to be validated beforehand.
I suggest you read the official [API documentation](https://products.wolframalpha.com/api/documentation/).
The API is very complex and I will only outline a few essential aspects here.

#### Params
  * **input**: Input expression to query Wolfram Api

| Property   | Value Type  | Description                           |
| -----------|:----------- | --------------------------------------|
| expression | String      | Input expression to query Wolfram Api |

#### Return
  * **promise**: The promise resolves an object, which is the parsed XML result
  from the Wolfram API. The *info* property is the attributes of the root XML node.

| Property      | Value Type | Description                                |
| ------------- |:-----------| -------------------------------------------|
| info          | Objects    | Attributes of that XML node.               |
| pod           | String     | Solution pods                              |

## **Root Node Info:**

| Property      | Value Type | Description                                |
| ------------- |:-----------| -------------------------------------------|
| success       | String     | If query was successful                    |
| error         | String     | If query had error                         |
| datatypes     | String     |                                            |
| timedout      | String     | If query has timedout                      |
| timedoutpods  | String     | If any pod result has timeout              |
| timing        | String     | Time taken by the query to return a result |
| parsetiming   | String     | Time taken to parse the query              |
| parsetimedout | String     | If the parsing has timedout                |
| id            | String     | ID of the operation                        |
| host          | String     | Host that performed the operation          |
| server        | String     | Server that performed the operation        |
| related       | String     | Related queries list                       |
| version       | String     | Version of the query                       |



### **Pod:**

Each pod can have its own subpods, with detailed intormation. Please read [this](https://products.wolframalpha.com/api/documentation/#explanation-of-pods)
for a more complete explanation of why these pods exist.

**Info:**

| Property   | Value Type | Description                                                   |
| ---------- |:---------- | ------------------------------------------------------------- |
| title      | String     | Title of this pod task                                        |
| scanner    | String     | Type of scanner to parse the information on this step         |
| id         | String     | If query had error                                            |
| position   | String     | Pod position order. 500 means it's the fifth pod, for example |
| error      | String     | String representation of the boolean true or false            |
| numsubpods | String     | Number of subpods this pod has                                |

The Subpods has a number of different properties and inputs. I won't detail them so please
read the official wolfram documentation.

### Example

```javascript
const expression = '7 x + 2 = 12'

math.wolframCall(expression)
  .then(result => console.log(result))
  .then(err => console.log(err))

```

The result would be:

```javascript
  {
    info: {
      success: 'true',
      error: 'false',
      numpods: '5',
      datatypes: '',
      timedout: '',
      timedoutpods: '',
      timing: '1.161',
      parsetiming: '0.246',
      parsetimedout: 'false',
      recalculate: 'https://www3.wolframalpha.com/api/v2/recalc.jsp?id=MSPa389420h2f1581b2f648i00000d5eh9842ea4388b&s=6',
      id: 'MSPa389520h2f1581b2f648i000038c90a35e24h5b61',
      host: 'https://www3.wolframalpha.com',
      server: '6',
      related: 'https://www3.wolframalpha.com/api/v2/relatedQueries.jsp?id=MSPa389620h2f1581b2f648i000038f2i0e69g467fa9&s=6',
      version: '2.6'
    },
    pod: {
      '0': {
        info: {
          title: 'Input',
          scanner: 'Identity',
          id: 'Input',
          position: '100',
          error: 'false',
          numsubpods: '1'
        },
        subpod: {
          '0': {
            info: { title: '' },
            img: {
              '0': {
                info: {
                  src: 'https://www3.wolframalpha.com/Calculate/MSP/MSP389720h2f1581b2f648i000034ia7fe9di443fa5?MSPStoreType=image/gif&s=6',
                  alt: '7 x + 2 = 12',
                  title: '7 x + 2 = 12',
                  width: '79',
                  height: '18'
                }
              }
            },
            plaintext: { '0': '7 x + 2 = 12' } }
        }
      },
      '1': { info: [Object], subpod: [Object] },
      '2': { info: [Object], subpod: [Object] },
      '3': { info: [Object], subpod: [Object], states: [Object] },
      '4': { info: [Object], subpod: [Object] } } }
```
