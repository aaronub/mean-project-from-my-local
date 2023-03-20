const path = require('path')
require('dotenv').config({ path : path.join(__dirname, '../../.env')})
const jwt = require('jsonwebtoken')

const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1]
    // console.log("token:"+token)
    if (token) {
        // jwt.verify(token, process.env.JWT_SECRET, (error, decode) => {
        //     if (error) {
        //         return res.sendStatus(401)
        //     }
        //     req.payload = decode
        //     console.log("token:"+req.payload)
        //     next()
        // })
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log("de:"+decode)
        req.payload = decode
        next()
    } else {
        return res.status(403).json({ message: "Not authorized" });
    }
}

const authorizationJWT = (req, res, next) => {
    // const token = req.headers['authorization'].split(' ')[1]
    // console.log(`req.headers['authorization']=`, req.headers['authorization'])
    const token = req.headers['authorization'].split(' ')[1]
    // console.log("token:"+token)
    if (token) {
        // jwt.verify(token, process.env.JWT_SECRET, (error, decode) => {
        //     // if (error || decode.role !== 'admin') {
        //     //     return res.sendStatus(401)
        //     // }

        //     req.payload = decode
        //     console.log("token:"+req.payload)
        //     next()
        // })
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log("de:"+decode)
        req.payload = decode
        next()
    } else {
        return res.status(403).json({ message: "Not authorized" });
    }
}

module.exports = { authenticateJWT, authorizationJWT }
