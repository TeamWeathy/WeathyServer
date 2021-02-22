const { Token } = require('../models');
const { generateToken } = require('../utils/tokenUtils');

module.exports = {
    createTokenOfUser: async (user_id) => {
        const token = generateToken(user_id);
        await Token.create({
            user_id: user_id,
            token: token
        });
        return token;
    }
};
