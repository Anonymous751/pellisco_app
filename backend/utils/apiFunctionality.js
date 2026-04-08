class APIFunctionality {

  constructor(query, queryStr) {
    this.query = query
    this.queryStr = queryStr
  }

  // SEARCH
  search(searchField = "name") { // Default is "name" for products
  if (this.queryStr.keyword) {
    const keyword = {
      [searchField]: { // Uses square brackets to make the key dynamic
        $regex: this.queryStr.keyword,
        $options: "i"
      }
    };

    this.query = this.query.find(keyword);
  }

  return this;
}


  // FILTER
  filter() {

    const queryCopy = { ...this.queryStr }

    const removeFields = ["keyword", "page", "limit", "sort"]

    removeFields.forEach(el => delete queryCopy[el])

    let queryStr = JSON.stringify(queryCopy)

    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|eq)\b/g,
      match => `$${match}`
    )

    const parsedQuery = JSON.parse(queryStr)

    this.query = this.query.find(parsedQuery)

    return this
  }


  // SORT
  sort() {

    if (this.queryStr.sort) {

      const sortBy = this.queryStr.sort.split(",").join(" ")

      this.query = this.query.sort(sortBy)

    } else {

      // default newest products
      this.query = this.query.sort("-createdAt")

    }

    return this
  }


  // PAGINATION
  pagination(resultPerPage) {

    const currentPage = Number(this.queryStr.page) || 1

    const skip = resultPerPage * (currentPage - 1)

    this.query = this.query.limit(resultPerPage).skip(skip)

    return this
  }

}

export default APIFunctionality
