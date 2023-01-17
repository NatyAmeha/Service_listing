
import Joi from 'joi';

export const configSchema = Joi.object({
    DB_URL: Joi.string().required(),
});