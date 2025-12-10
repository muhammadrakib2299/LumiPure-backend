const express = require('express');
const { register, login } = require('../controllers/auth.controller');
// const { validate } = require('../middleware/validate');
// const { registerSchema, loginSchema } = require('../validators/auth.schema');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;
