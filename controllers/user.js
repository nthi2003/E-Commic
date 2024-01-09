const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const { response } = require('express')
const register = asyncHandler(async (req, res) => {
    const { email, password, firstname, lastname } = req.body
    if (!email || !password || !lastname || !firstname)
        return res.status(404).json({
            sucess: false,
            mes: 'Missing inputs'
        })
    const user = await User.findOne({ email })
    if (user) throw new Error('User has existed')
    else {
        const newUser = await User.create(req.body)
        return res.status(200).json({
            sucess: newUser ? true : false,
            mes: newUser ? 'Register is successful. Please go login ~ ' : 'Something went wrong'
        })
    }

})

// Refresh token => cap moi assess token
// assess token xax thuc nguoi dung, phan quyen nguoi dung
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password)
        return res.status(400).json({
            sucess: false,
            mes: 'Missing inputs'
        })
    // plain obiject chi dung dc trong 1 obj thuong
    const response = await User.findOne({ email })

    if (response && response.isCorrectPassword(password)) {
        // tach password va role ra khoi reponsive
        const { password, role, ...userData } = response.toObject()
        // tao access token
        const accessToken = generateAccessToken(response._id, role)
        const refreshToken = generateRefreshToken(response._id)
        // luu refresh token vao database
        await User.findByIdAndUpdate(response._id, { refreshToken }, { new: true })
        // luu refresh token vao cookie
        res.cookie('refreshToken', refreshToken, { htppOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
        return res.status(200).json({
            sucess: true,
            accessToken,
            userData

        })
    }
    else {
        throw new Error('Invalid credentials!')
    }
})
const getCurrent = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password -role')
    return res.status(200).json({
        sucess: false,
        rs: user ? user : 'User not found'
    })


})
const refreshAccessToken = asyncHandler(async (req, res) => {
    // lấy token từ cookies
    const cookie = req.cookies
    // check xem có token hay khong
    if (!cookie && !cookie.refreshToken) throw new Error('No refresh token is cokkies')
    // check token co hop le hay khong
    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken })

    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccessToken(response._id, response.role) : 'Refresh token not matched'
    })

})
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie && !cookie.refreshToken) throw new Error('No refresh token in cookies')
    // xoa refresh token o db
    await User.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: '' }, { new: true })
    // xoa refresh token ở cookie trình duyệt
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    return res.status(200).json({
        success: true,
        mes: 'Logout is done'
    })
})
// client gui email
// Server check email co hop le hay khong => Gui email + kem theo link (password changs token)
// client check mail => click link
// client gui email kem token 
// check token co giong voi email da gui hay khong
// doi mat khau

const fogotPassword = asyncHandler(async(req, res) => {
    const {email} = req.query
    if(!email) throw new Error('Missing email')
    const user = await User.findOne({ email })
    if (!user) throw new Error(' User not found')
    const resetToken = user.createPasswordChangeToken()
    await user.save()


})
module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    fogotPassword
    
}