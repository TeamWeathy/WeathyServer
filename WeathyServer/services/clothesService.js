const { Clothes, ClothesCategory } = require('../models');
const exception = require('../modules/exception');
const { isValidTokenById } = require('./tokenService');

module.exports = {
    getClothesByUserId: async (token, userId) => {
        // token과 userId로 valid한지 체크하고, clothes 가져옴
        try {
            const flag = await isValidTokenById(userId, token);
            if (!flag) {
                // 토큰이 맞지 않음. 잘못된 요청임
                throw Error(exception.MISMATCH_TOKEN);
            } else {
                const returnCloset = new Object();
                const clothesCategories = await ClothesCategory.findAll();
                for (const category of clothesCategories) {
                    const tempCloset = await Clothes.findAll({
                        where: { user_id: userId, category_id: category.id }
                    });
                    const tempClothesList = new Array();
                    await tempCloset.forEach((element) => {
                        const tempClothes = new Object();
                        tempClothes.id = element.user_id;
                        tempClothes.categoryId = element.category_id;
                        tempClothes.name = element.name;
                        tempClothesList.push(tempClothes);
                    });
                    returnCloset[category.name] = tempClothesList;
                }
                return returnCloset;
            }
        } catch (error) {
            switch (error.message) {
                // isValidTokenById 에서 받아오는 error들
                // 토큰 만료 or DB에 존재하지 않는 토큰
                case exception.EXPIRED_TOKEN:
                    throw Error(exception.EXPIRED_TOKEN);
                case exception.INVALID_TOKEN:
                    throw Error(exception.INVALID_TOKEN);
                case exception.MISMATCH_TOKEN:
                    throw Error(exception.MISMATCH_TOKEN);
                default:
                    throw Error(exception.SERVER_ERROR);
            }
        }
    },
    addClothesByUserId: async (token, userId, category, name) => {
        // token과 userId로 valid한지 체크하고, clothes 가져옴
        try {
            const flag = await isValidTokenById(userId, token);
            if (!flag) {
                // 토큰이 맞지 않음. 잘못된 요청임
                throw Error(exception.MISMATCH_TOKEN);
            } else {
                const returnClothesList = new Array();
                await Clothes.create({
                    user_id: userId,
                    category_id: category,
                    name: name
                });

                const tempCloset = await Clothes.findAll({
                    where: { user_id: userId, category_id: category }
                });
                await tempCloset.forEach((element) => {
                    const tempClothes = new Object();
                    tempClothes.id = element.user_id;
                    tempClothes.categoryId = element.category_id;
                    tempClothes.name = element.name;
                    returnClothesList.push(tempClothes);
                });

                return returnClothesList;
            }
        } catch (error) {
            switch (error.message) {
                // isValidTokenById 에서 받아오는 error들
                // 토큰 만료 or DB에 존재하지 않는 토큰
                case exception.EXPIRED_TOKEN:
                    throw Error(exception.EXPIRED_TOKEN);
                case exception.INVALID_TOKEN:
                    throw Error(exception.INVALID_TOKEN);
                case exception.MISMATCH_TOKEN:
                    throw Error(exception.MISMATCH_TOKEN);
                default:
                    throw Error(exception.SERVER_ERROR);
            }
        }
    },
    deleteClothesByUserId: async (token, userId, clothesList) => {
        // token과 userid로 valid한지 체크하고, clothes에 해당하는 옷들 삭제
        try {
            const flag = await isValidTokenById(userId, token);
            if (!flag) {
                // 토큰이 맞지 않음. 잘못된 요청
                throw Error(exception.MISMATCH_TOKEN);
            } else {
                for (const clothes of clothesList) {
                    await Clothes.destroy({
                        where: {
                            user_id: userId,
                            id: clothes
                        }
                    });
                }

                // getClothesByUserId 와 동일. 어떻게 써먹을 것인가
                const returnCloset = new Object();
                const clothesCategories = await ClothesCategory.findAll();
                for (const category of clothesCategories) {
                    const tempCloset = await Clothes.findAll({
                        where: { user_id: userId, category_id: category.id }
                    });
                    const tempClothesList = new Array();
                    await tempCloset.forEach((element) => {
                        const tempClothes = new Object();
                        tempClothes.id = element.user_id;
                        tempClothes.categoryId = element.category_id;
                        tempClothes.name = element.name;
                        tempClothesList.push(tempClothes);
                    });
                    returnCloset[category.name] = tempClothesList;
                }
                return returnCloset;
            }
        } catch (error) {
            console.log(error.message);
            switch (error.message) {
                // isValidTokenById 에서 받아오는 error들
                // 토큰 만료 or DB에 존재하지 않는 토큰
                case exception.EXPIRED_TOKEN:
                    throw Error(exception.EXPIRED_TOKEN);
                case exception.INVALID_TOKEN:
                    throw Error(exception.INVALID_TOKEN);
                case exception.MISMATCH_TOKEN:
                    throw Error(exception.MISMATCH_TOKEN);
                default:
                    throw Error(exception.SERVER_ERROR);
            }
        }
    }
};
