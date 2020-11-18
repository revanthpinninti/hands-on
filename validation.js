//validation 
const Joi = require('@hapi/joi');

//register Validation
const registerValidation = data => {
    const schema = Joi.object({
        firstName: Joi.string()
                .required()
                .min(4)
                .max(255),
        lastName: Joi.string()
                .min(4)
                .max(255),
        email: Joi.string()
                .required()
                .email()
                .min(6)
                .max(255),
        password: Joi.string()
                .required()
                .min(6)
                .max(1024),
        gender: Joi.string(),
        city: Joi.string()
                .required(),
        country: Joi.string()
                .required()
    });
    return schema.validate(data);
};


//login validation
const loginValidation = data => {  
    const schema = Joi.object({
        email: Joi.string()
            .required()
            .email()
            .min(6)
            .max(255),
        password: Joi.string()
            .min(6)
            .max(1024)
            .required()
    });
    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;