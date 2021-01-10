const cryptoRandomString = require('crypto-random-string');

module.exports = {
    generateToken: (user_id) => {
        return (
            user_id +
            ':' +
            cryptoRandomString({ length: 30, type: 'alphanumeric' })
        );
    },
    getUserIdFromToken: (token) => {
        return token.split(':')[0];
    },
    isUserOwnerOfToken: (userId, token) => {
        return userId == token.split(':')[0];
    }
};
