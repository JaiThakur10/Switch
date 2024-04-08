const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolvere(requestHandler(req,res,next)).catch((err) => next(err))
    }
}

export {asyncHandler}









/*
const asyncHandler = (fn) => async (req,res,next) => {
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(err.code || 500).jason({
            success:flase,
            message:err.message
        })
    }
}*/