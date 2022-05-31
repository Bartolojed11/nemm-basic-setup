class Filtering {
  constructor(model, req) {
    this.model = model.find()
    this.req = req
    this.query = model
  }

  filter() {
    let req = this.req
    if (req.query.name) {
      this.model = this.model.where('name', req.query.name)
    }

    if (req.query.difficulty) {
      this.model = this.model.where('difficulty', req.query.difficulty)
    }

    if (req.query.duration) {
      this.model = this.model.where('duration').gte(req.query.duration)
    }

    this.query = this.model

    return this;
  }

  selectedFields() {
    /**
     * This getting of selected fields only should be after where clauses
     * To exlclude some fields, append minus on the column
     * (eg) -__v
     * -__v is used by mongoose
     */
    let req = this.req
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      this.model = this.model.select(fields)
    } else {
      this.model = this.model.select('-__v')
    }
    
    this.query = this.model
    return this;
  }

  sort() {
    let req = this.req
    /**
     * To sort descending, just append a minus sign on the column
     * (eg) sort=-price
     * */

    if (req.query.sort) {
      /**
       * For sorting multiple columns
       * On the payload, it should be like this: sort=-price,ratingsAverage
       */
      const sortBy = req.query.sort.split(',').join(' ')
      this.model = this.model.sort(sortBy)
    }

    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || process.env.PAGINATION_LIMIT

    // Index starts at 0, so we need to -1
    const skip = (page - 1) * limit

    // Number method is used to here to make sure that value passed is a number
    this.model = this.model.skip((skip)).limit(Number(limit))

    this.query = this.model

    return this
  }
}

module.exports = Filtering
