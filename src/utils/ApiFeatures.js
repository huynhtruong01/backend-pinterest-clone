class ApiFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    // FILTERS
    filters() {
        // remove fields have: sort, page, limit, fields
        const queryStringClone = { ...this.queryString }
        const explainList = ['sort', 'fields', 'page', 'limit']
        explainList.forEach((x) => delete queryStringClone[x])

        // convert special characters: gte, gt, lte, lt
        const queryJsonStringify = JSON.stringify(queryStringClone)
        const newQueryString = queryJsonStringify.replace(
            /\b(gte, gt, lte, lt)\b/,
            (match) => `$${match}`
        )

        // find()
        this.query = this.query.find(JSON.parse(newQueryString))

        return this
    }

    // SORT
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-createdAt')
        }

        return this
    }

    // FIELDS
    fields() {
        if (this.queryString.fields) {
            const fields = this.queryString.split(',').join(' ')
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        }

        return this
    }

    // PAGINATE
    paginate() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.page * 1 || 100

        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)

        return this
    }
}

module.exports = ApiFeatures
