function errorHandler(err, req, res, next) {
    res.status.json(500)({
        message: 'Generic server occurred.'
    })
}

module.exports = {errorHandler};