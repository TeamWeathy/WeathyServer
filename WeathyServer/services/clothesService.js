const { Clothes, ClothesCategory, WeathyClothes } = require('../models');
const exception = require('../modules/exception');
const { isValidTokenById } = require('./tokenService');

const setClothesForm = async () => {
    const closet = {};

    const clothesCategories = await ClothesCategory.findAll({
        attributes: ['name', 'id']
    });

    for (const c of clothesCategories) {
        closet[c.name] = {
            id: c.id,
            clothes: []
        };
    }
    return closet;
};
module.exports = {
    getClothesByUserId: async function (token, userId) {
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
                const tempClothes = await Clothes.findOne({
                    where: { id: clothes, is_deleted: 0 }
                });
                if (tempClothes === null) {
                    // 없는 옷
                    throw Error(exception.NO_CLOTHES);
                } else if (tempClothes.user_id != userId) {
                    // 자기 옷이 아님
                    throw Error(exception.NOT_AUTHORIZED_CLOTHES);
                } else {
                    await Clothes.update(
                        { is_deleted: 1 },
                        { where: { id: clothes } }
                    );
                }
            }
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
    },

    getWeathyCloset: async (weathyId) => {
        try {
            const closet = await setClothesForm();

            const weathyClothes = await WeathyClothes.findAll({
                include: [
                    {
                        model: Clothes,
                        required: true,
                        paranoid: false,
                        attributes: ['id', 'name'],
                        include: [
                            {
                                model: ClothesCategory,
                                required: true,
                                paranoid: false,
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ],
                where: {
                    weathy_id: weathyId
                }
            });

            for (let wc of weathyClothes) {
                const categoryName = wc.Clothe.ClothesCategory.name;
                const clothesId = wc.Clothe.id;
                const clothesName = wc.Clothe.name;

                closet[categoryName].clothes.push({
                    id: clothesId,
                    name: clothesName
                });
            }

            return closet;
        } catch (err) {
            console.log(err);
        }
    }
};
