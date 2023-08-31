export class ApiFeatures {
    constructor(mongooseQuery, queryData) {
        this.mongooseQuery = mongooseQuery;
        this.queryData = queryData;
    }

    pagination = (model) => {
        let { size, page } = this.queryData;
        if (!size || size <= 0) size = 5;
        if (!page || page <= 0) page = 1;
        const skip = size * (page - 1);
        this.mongooseQuery.skip(skip).limit(size);
        model.countDocuments().then((val) => {
            this.queryData.totalPages = Math.ceil(val / size);
            if (this.queryData.totalPages > page) {
                this.queryData.next = Number(page) + 1;
            }
            if (page > 1) {
                this.queryData.previous = Number(page) - 1;
            }

            this.queryData.count = val;
        })
        return this;
    }

    filter = () => {
        const excludeQuery = ['page', 'size', 'sort', 'searchKey', 'fields'];
        let filterQuery = { ...this.queryData };
        excludeQuery.forEach(ele => {
            delete filterQuery[ele];
        });
        filterQuery = JSON.parse(JSON.stringify(filterQuery).replace(/gt|gte|lt|lte/g, (match) => `$${match}`))
        this.mongooseQuery.find(filterQuery);
        return this;
    }

    sort = () => {
        this.queryData.sort = this.queryData.sort.replace(/,/g, ' ')
        this.mongooseQuery.sort(this.queryData.sort);
        return this;
    }

    search = () => {
        if (this.queryData?.searchKey) {
            this.mongooseQuery.find({
                $or: [
                    { name: { $regex: this.queryData.searchKey } },
                    { description: { $regex: this.queryData.searchKey } }
                ]
            })
        }
        return this;
    }

    select = () => {
        this.mongooseQuery.fields = this.queryData.fields?.replace(/,/g, ' ');
        // Include 'price' and 'discount' in the selected fields
        if (!this.mongooseQuery.fields || !this.mongooseQuery.fields.includes('price')) {
            this.mongooseQuery.fields += ' price';
        }
        if (!this.mongooseQuery.fields || !this.mongooseQuery.fields.includes('discount')) {
            this.mongooseQuery.fields += ' discount';
        }
        this.mongooseQuery.select(this.mongooseQuery.fields);
        return this;
    }
}