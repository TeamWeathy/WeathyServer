const { Clothes, ClothesCategory } = require('../models');
const exception = require('../modules/exception');
const { isValidTokenById } = require('./tokenService');

module.exports = {
    getClothesByUserId: async (token, userId) => {
        // token과 userId로 valid한지 체크하고, clothes 가져옴
        const flag = await isValidTokenById(userId, token);
        if (!flag) {
            // 토큰이 맞지 않음. 잘못된 요청임
            throw Error(exception.MISMATCH_TOKEN);
        } else {
            const returnCloset = new Object();
            const clothesCategories = await ClothesCategory.findAll();

            for (const category of clothesCategories) {
                const tempCloset = await Clothes.findAll({
                    where: {
                        user_id: userId,
                        category_id: category.id,
                        is_deleted: 0
                    }
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
    },
    addClothesByUserId: async (token, userId, category, name) => {
        // token과 userId로 valid한지 체크하고, clothes 가져옴
        const flag = await isValidTokenById(userId, token);
        if (!flag) {
            // 토큰이 맞지 않음. 잘못된 요청임
            throw Error(exception.MISMATCH_TOKEN);
        } else {
            // 이미 한 번 지워졌던 값인지 확인
            const alreadyClothes = await Clothes.findOne({
                where: { user_id: userId, category_id: category, name: name }
            });

            const returnClothesList = new Array();
            if (alreadyClothes == null) {
                await Clothes.create({
                    user_id: userId,
                    category_id: category,
                    name: name,
                    is_deleted: 0
                });
            } else {
                if (alreadyClothes.is_deleted === 0) {
                    throw Error(exception.ALREADY_CLOTHES);
                }
                await Clothes.update(
                    { is_deleted: 0 },
                    {
                        where: {
                            user_id: userId,
                            category_id: category,
                            name: name
                        }
                    }
                );
            }

            const tempCloset = await Clothes.findAll({
                where: { user_id: userId, category_id: category, is_deleted: 0 }
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
    },
    deleteClothesByUserId: async (token, userId, clothesList) => {
        // token과 userid로 valid한지 체크하고, clothes에 해당하는 옷들 삭제
        const flag = await isValidTokenById(userId, token);
        if (!flag) {
            // 토큰이 맞지 않음. 잘못된 요청
            throw Error(exception.MISMATCH_TOKEN);
        } else {
            for (const clothes of clothesList) {
                await Clothes.update(
                    { is_deleted: 1 },
                    { where: { id: clothes } }
                );
            }

            // getClothesByUserId 와 동일. 어떻게 써먹을 수 있을까요?ㅠㅠ
            const returnCloset = new Object();
            const clothesCategories = await ClothesCategory.findAll();
            for (const category of clothesCategories) {
                const tempCloset = await Clothes.findAll({
                    where: {
                        user_id: userId,
                        category_id: category.id,
                        is_deleted: 0
                    }
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
    }
};
