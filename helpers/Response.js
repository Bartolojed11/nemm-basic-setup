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

    if (message.length > 0 || message.message !== undefined) {
      responseBody.message = message.message
    }

    /**
     * https://www.samanthaming.com/tidbits/94-how-to-check-if-object-is-empty/
     * Object.keys(data).length !== 0 && data.constructor !== Object
     * Will check if object is empty
     */

    if (
      statusCode === 200 &&
      Object.keys(data).length !== 0 &&
      data.constructor !== Object
    ) {
      const tourData = {
        tours: data,
      }

      responseBody.results = data.length
      responseBody.data = tourData
    }

    console.log(
      '🚀 ~ file: Response.js ~ line 46 ~ Response ~ responseBody',
      responseBody
    )
    return res.status(statusCode).json(responseBody)
  }
}

module.exports = Response
