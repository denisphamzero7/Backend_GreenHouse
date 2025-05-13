const authValidators = require('./auth.validation')
const userValidator = require('./user.validation')
const customValidator = require('./custom.validation')
const bedValidator = require('./beds.validation')
const categoryValidator = require('./category.validation')
const greenhouseValidator = require('./greenhouse.validation')
const greenhousecageValidator = require('./greenhousecage.validation')
const productValidator = require('./product.validation')
const vegetableValidator = require('./vegetable.validation')

 module.exports={
    authValidators,userValidator,customValidator,bedValidator,categoryValidator,greenhouseValidator,greenhousecageValidator,productValidator,vegetableValidator
 }