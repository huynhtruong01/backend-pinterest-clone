exports.filterObj = (fieldList, obj) => {
    const newObj = {}
    fieldList.forEach((field) => {
        if (obj[field]) newObj[field] = obj[field]
    })

    return newObj
}
