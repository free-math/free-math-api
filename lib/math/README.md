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

#### Return
  * **promise**: Object with result data. See example for detail.

| Property   | Value Type | Description                          |
| -----------|:-----------| -------------------------------------|
| isEq       | Boolean    | If the expression is an equation     |
| Expression | String     | Simplified and normalized expression |

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
