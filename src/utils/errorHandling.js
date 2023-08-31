export const asyncHandler = (fun) => {
    return (req, res, next) => {
        fun(req, res, next).catch(err => {
            return next(new Error(err, {cause:500}))
        })
    }
}

export const globalErrorHandling = (err, req, res, next) => {
    if (process.env.MOOD == 'DEV') {
        return res.status(err.cause || 500).json({ message: err.message, err, stack: err.stack })
    } else {
        return res.status(err.cause || 500).json({ message: err.message})
    }
}