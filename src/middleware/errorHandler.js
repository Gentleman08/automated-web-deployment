// src/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message =
        process.env.NODE_ENV === "production"
            ? "Internal Server Error"
            : err.message;

    res.status(statusCode).json({
        error: {
            message: message,
            status: statusCode,
            timestamp: new Date().toISOString(),
        },
    });
};

module.exports = errorHandler;