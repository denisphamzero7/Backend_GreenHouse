
const ApiError = require('../untiles/apiError');

const validate = (schema) => (req, res, next) => {
  const options = {
    abortEarly: false,
    stripUnknown: true,
    errors: { label: 'key' },
  };

  const sections = ['body', 'query', 'params'];
  const errors = [];

  for (const section of sections) {
    if (!schema[section]) continue;
    const { value, error } = schema[section].validate(req[section], options);
    if (error) {
     
      for (const detail of error.details) {

        throw new ApiError(
          400,
          detail.context.key,
          detail.message
        );
      }
    } else {
      req[section] = value;
    }
  }

  next();
};

module.exports = validate;
