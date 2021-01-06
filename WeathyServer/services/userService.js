const { User } = require('../models');
const exception = require('../modules/exception');

module.exports = {
    getUserByAccount: async (uuid) => {
        // uuid로 user_id 가져오기
        const user = await User.findOne({ where: { uuid: uuid } });
        if (user == null) {
            throw Error(exception.NO_USER);
        } else {
            return user.id;
        }
    }
};
