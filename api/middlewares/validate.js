const ApiError = require('../untiles/apiError');

const validate = (schema) => (req, res, next) => {
  const options = {
    abortEarly: false,
    stripUnknown: true,
    errors: { label: 'key' },
  };

  const sections = ['body', 'query', 'params'];

  try {
    for (const section of sections) {
      if (!schema[section]) continue;
      const { value, error } = schema[section].validate(req[section], options);
      if (error) {
        const message = error.details.map((d) => d.message).join(', ');
        throw new ApiError(400, 'ValidationError', message);
      } else {
        req[section] = value;
      }
    }

    next(); // chỉ gọi khi mọi thứ OK
  } catch (err) {
    next(err); // để error middleware xử lý
  }
};

module.exports = validate;
