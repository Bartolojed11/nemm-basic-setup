class Response {
  constructor(
    res,
    statusCode = 200,
    message = {},
    status = 'success',
    data = {}
  ) {
    this.res = res
    this.statusCode = statusCode
    this.message = message
    this.status = status
    this.data = data

    let responseBody = {
      status: status,
    }

    if (message.length > 0) {
      responseBody.message = message
      if (message.message !== undefined) {
        responseBody.message = message.message
      }
    } else if (Object.entries(message).length > 0) {
      responseBody.message = message
    }

    /**
    * https://www.samanthaming.com/tidbits/94-how-to-check-if-object-is-empty/
    * Object.keys(data).length !== 0 && data.constructor !== Object
    * Will check if object is empty
    */

    if (statusCode === 200) {
      const tourData = {
        tours: data,
      }

      if (data !== null && data !== undefined) {
        if (Object.keys(data).length !== 0 && data.constructor !== Object) {
          if (data.length !== undefined) responseBody.results = data.length
          responseBody.data = tourData
        }
      } else {
        responseBody.results = 0
        responseBody.data = tourData
      }
    }

    return res.status(statusCode).json(responseBody)
  }
}

module.exports = Response
