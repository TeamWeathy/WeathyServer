module.exports = {
    getUserIdFromToken: (token) => {
        return token.split(':')[0];
    }
};
