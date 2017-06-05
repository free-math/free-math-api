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


## getExpType

#### Description:
Checks if the expression is an equation or a simple math
expression. Checks if there is an = sign and/or variables
to decide

#### Params
  * **expression**: String of the equation/expression.

| Property   | Value Type | Description                       |
| ---------- |:---------- | --------------------------------- |
| expression | String     | Input expression to be classified |

#### Return
  * **promise**: Object with result data. See example for detail.

| Property   | Value Type | Description                          |
| ---------- |:---------- | ------------------------------------ |
| isEq       | Boolean    | If the expression is an equation     |
| expression | String     | Simplified and normalized expression |

### Example

```javascript
const expression = 'x^2 + 7x +3 = 0'

math.getExpType(expression)
  .then(result => console.log(result))
  .catch(err => console.log(err))

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

## mathJsSolve

#### Description:
Solves non-equation expressions.

#### Params
  * **expressions**: Array of the expressions. Each expression should be a string.

| Property   | Value Type | Description                       |
| ---------- |:---------- | --------------------------------- |
| expression | Array      | Input expression to be classified |

#### Return
  * **promise**: Array of objects with solution data. Each object has the following
  structure

| Property   | Value Type | Description                                                    |
| ---------- |:---------- | -------------------------------------------------------------- |
| simplified | String     | Simplified expression. In this case, is the result as a String |
| expression | String     | Input Expression                                               |
| error      | String     | Error that occurred during solving of the expression           |
| Solution   | Number     | Solution of the expression                                     |

### Example

```javascript
const expressions = ['sqrt(9)', '123+77']

math.mathJsSolve(expressions)
  .then(result => console.log(result))
  .catch(err => console.log(err))

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

## wolframCall

#### Description:
Wraps promise over Wolfram Module.It needs input object to be validated beforehand.
I suggest you read the official [API documentation](https://products.wolframalpha.com/api/documentation/).
The API is very complex and I will only outline a few essential aspects here.

#### Params
  * **input**: Input expression to query Wolfram Api

| Property   | Value Type  | Description                           |
| ---------- |:----------- | ------------------------------------- |
| expression | String      | Input expression to query Wolfram Api |

#### Return
  * **promise**: The promise resolves an object, which is the parsed XML result
  from the Wolfram API. The *info* property is the attributes of the root XML node.

| Property      | Value Type | Description                                |
| ------------- |:---------- | ------------------------------------------ |
| info          | Objects    | Attributes of that XML node.               |
| pod           | String     | Solution pods                              |

## **Root Node Info:**

| Property      | Value Type | Description                                |
| ------------- |:---------- | ------------------------------------------ |
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
  .catch(err => console.log(err))

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
      recalculate: 'RECALCULATE URL',
      id: 'MSPa389520h2f1581b2f648i000038c90a35e24h5b61',
      host: 'https://www3.wolframalpha.com',
      server: '6',
      related: 'RELATED URL',
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
                  src: 'SOURCE URL',
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

## evaluate

#### Description:
Evaluates expression to see if it should be solved using MathJS or WolframAPI,
and returns its result along with some other information and data.

#### Params
  * **input**: Object with expression and user ID

| Property   | Value Type | Description                       |
| ---------- |:---------- | --------------------------------- |
| query      | String     | Expression/equation to be evaluated |
| user       | String     | String representation of userID |

#### Return
  * **promise**: Resolves an object with the evaluated data

| Property   | Value Type    | Description                                                     |
| ---------- |:------------- | --------------------------------------------------------------- |
| user       | String        | String representation of userID                                 |
| query      | String        | Wolfram Query, if any                                           |
| solution   | Number/Object | Solution to the expression                                      |
| solveType  | String        | Type of solution used to find the result. 'mathjs' or 'wolfram' |
| simplified | String        | Simplified expression.                                          |
| error      | Object        | Error object                                                    |
| expression | String        | Original input query                                            |

### Example

#### For a MathJS Solution
```javascript
const input = {
  query: 'sqrt(49) + 3',
  user: '68301f4aef1facb568301f4a'
}

math.evaluate(expressions)
  .then(result => console.log(result))
  .catch(err => console.log(err))

```

The result would be:

```javascript
  {
    user: '68301f4aef1facb568301f4a',
    query: '',
    solution: 10,
    solveType: 'mathjs',
    simplified: '10',
    error: null,
    expression: 'sqrt(49) + 3'
  }
```

#### For a Wolfram Solution
```javascript
const input = {
  query: '7 * x + 2 = 12',
  user: '68301f4aef1facb568301f4a'
}

math.evaluate(expressions)
  .then(result => console.log(result))
  .catch(err => console.log(err))

```

The result would be:

```javascript
  {
    user: '68301f4aef1facb568301f4a',
    query: '7 * x + 2 = 12',
    solution: {
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
        recalculate: 'RECALCULATE URL',
        id: 'MSPa389520h2f1581b2f648i000038c90a35e24h5b61',
        host: 'https://www3.wolframalpha.com',
        server: '6',
        related: 'RELATED URL',
        version: '2.6'
      },
      inputPod: { info: [Object], subpod: [Object] },
      resultPod: { info: [Object], subpod: [Object], states: [Object] }
    },
    solveType: 'wolfram'
  }
```

## getPodById

#### Description:
Looks through the pods array and returns the one with the specifiec ID.

#### Params
  * **input**: Object with expression and user ID

| Property   | Value Type | Description                           |
| ---------- |:---------- | ------------------------------------- |
| pods       | Array      | Array of pods from the wolfram result |
| id         | String     | ID of the pod to look for             |

#### Return
  * **promise**: Resolves the pod object. Please refer to the [wolframCall](#wolframCall)


### Example

#### For a MathJS Solution
```javascript
const id = 'Result'

math.wolframCall(query)
  .then(wolframResult => math.getPodById(wolframResult.pod))
  .then(result => console.log(result))
  .catch(err => console.log(err))

```

The result would be:

```javascript
  {
    info: {
      title: 'Solution',
      scanner: 'Reduce',
      id: 'Solution',
      position: '400',
      error: 'false',
      numsubpods: '1',
      primary: 'true'
    },
    subpod: {
      '0': {
        info: [Object],
        img: [Object],
        plaintext: [Object]
      }
    },
    states: {
      '0': {
        info: [Object],
        state: [Object]
      }
    }
  }
```
