# aws-lambda-res

> is a tiny helper to create a response object for AWS Lambda with Proxy integration

[Usage](#usage) |
[Annotated source](#annotated-source) |
[License](#license)

[![NPM version](https://badge.fury.io/js/aws-lambda-res.svg)](http://badge.fury.io/js/aws-lambda-res)
[![No deps](https://img.shields.io/badge/dependencies-none-green.svg)](https://github.com/fibo/aws-lambda-res)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![KLP](https://img.shields.io/badge/kiss-literate-orange.svg)](http://g14n.info/kiss-literate-programming)

## Usage

Suppose you have an *API Gateway* resource with a method configured with
*Lambda Proxy integration*.

![proxy flag](http://g14n.info/aws-lambda-res/images/Use-Lambda-Proxy-integration.png){:.responsive}

Suppose you have a dummy endpoint which returns JSON `{ "ok": true }`,
then the following code will be a working implementation.

```js
const response = require('aws-lambda-res')

function handler (event, context, callback) {
  callback(null, response(200)({ ok: true }))
}

exports.handler = handler
```

You can pass headers as second argument, body can be null: for example to
logout and redirect to homepage you can use something like

```js
function handler (event, context, callback) {
  const Expires = 'Sat, 01 Jan 2000 00:00:00 GMT' // Some day in the past.

  callback(null, response(302)(null, {
    'Location': 'https://example.org',
    'set-cookie': `user_authenticated=; Domain=example.com; Expires=${Expires}`
  }))
}

exports.handler = handler
```

Let me write few tips I want to remember. When a method on API Gateway is
configured with *Lambda Proxy integration* no additional mapping is needed.
Everything you need will be available in `event` argument.

To get a JSON payload, just parse it from body.


```js
function handler (event, context, callback) {
  const { id, name } = JSON.parse(event.body)

  // Follows your code...
}
```

To extract form parameters, use `querystring` package.

```js
const querystring = require('querystring')

function handler (event, context, callback) {
  const { email, password } = querystring.parse(event.body)

  // Follows your code...
}
```

To get cookies, parse `event.cookie`.

```js
function handler (event, context, callback) {
  const cookies = event.cookie.split(';')

  let session

  cookies.forEach(cookie => {
    if (cookie.indexOf('session=') === 0) {
      session = cookie.split('=')[1]
    }
  })

  // Follows your code...
}
```

To get headers, look into `event.headers`.
For example, you can get a JWT header with the following snippet.

```js
function handler (event, context, callback) {
  const auth = event.headers.Authorization

  const token = (auth && auth.startsWith('BEARER ')) ? auth.substring(7) : null

  // Follows your code...
}
```

For route placeholders, for example suppose you want to handle an enpoint
like `GET /user/{id}`, go to API Gateway and create first a resource with
path `/user`. Then create a child resource with path `/{id}` and add a GET
method.  The code of associated Lambda function will be something like the
following.

```js
function handler (event, context, callback) {
  const { id } = event.pathParameters

  // Follows your code...
}
```

## Annotated source

```javascript
// This code is generated by command: npm run markdown2code
```

Lambda Proxy integration needs a response with the following properties:

* isBase64Encoded
* statusCode
* headers
* body

```javascript
/**
 * Create a response helper.
 *
 * @params {Number} statusCode
 * @returns {Function} awsLambdaResponse helper
 */

function response (statusCode) {
```

The exported `response` function, requires `statusCode` argument and returns
an helper function which accepts parameters:

1. `body`: can be any data, even null.
2. `headers`, defaults to `{ 'Content-type': 'application/json' }`.

```javascript
  /**
   * AWS Lambda response helper.
   *
   * @params {Object|null} body
   * @params {Object} [headers]
   * @returns {Object} responseObj required by AWS Lambda Proxy integration
   */

  function awsLambdaResponse (
    body,
    headers = { 'Content-Type': 'application/json' }
  ) {
    const responseObj = {
      isBase64Encoded: false,
      headers,
      statusCode,
      body: body === null ? null : JSON.stringify(body)
    }

    return responseObj
  }
```

Return helper and export function

```javascript
  return awsLambdaResponse
}

module.exports = response
```

## License

[MIT](http://g14n.info/mit-license/)

