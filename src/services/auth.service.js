// const User = require('../models/User');

const register = async (userData) => {
    // Logic to create user
    // const user = await User.create(userData);
    // return user;
    return { name: userData.name, email: userData.email, token: 'fake-jwt-token' };
};

const login = async (email, password) => {
    // Logic to find user and check password
    return { token: 'fake-jwt-token', user: { email, role: 'user' } };
};

module.exports = {
    register,
    login,
};
