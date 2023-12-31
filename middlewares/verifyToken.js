const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const verifyAccessToken =  asyncHandler(async(req,res,next) => {
    if (req?.headers?.authorization?.startsWith('Bearer')) {
    // bearer token
    // headers : {authorization: bearerToken}


    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
        
        if (err) return res.status(401).json({
            success: false,
            mes: "Invalid access token"
        })
        console.log(decode);
        req.user = decode
        next() // chuyển qua hàm mới
    })
  }else {
    return res.status(401).json({
        success: false,
        mes: 'Require authentication !!!'
    })
  }
})

module.exports = {
    verifyAccessToken
}