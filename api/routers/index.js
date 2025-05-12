const greenhouseroute = require("./greenhouse")
const greenhousecageroute =require("./greenhousecage")
const bedroute = require("./bed")
const croproute = require("./crop")
const productroute = require("./product")
const userroute = require("./user")
const categoryroute = require("./category")
const uploadImage = require("./uploadimage")
const {notFound, errorHandler} = require("../middlewares/errorhandler")
const introuter = (app)=>{
    app.use('/api/greenhouse',greenhouseroute)
    app.use('/api/greenhousecage',greenhousecageroute)
    app.use('/api/bed',bedroute)
    app.use('/api/crop',croproute)
    app.use('/api/category',categoryroute)
    app.use('/api/product',productroute)
    app.use('/api/user',userroute)
    app.use('/api/upload',uploadImage)
    app.use(notFound)
    app.use(errorHandler)
}

module.exports = introuter;