const express = require('express');
const Login = require('../controllers/login.controller');

const router = express.Router();

router.post('/', Login.loginUser);
router.post('/register', Login.registerUser);

module.exports = router;
