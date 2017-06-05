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
