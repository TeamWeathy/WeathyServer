const { Clothes, ClothesCategory } = require('../models');
const exception = require('../modules/exception');
const { isValidTokenById } = require('./tokenService');
const { Op } = require('sequelize');

async function getClothesByUserId(token, userId) {
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
}

async function addClothesByUserId(token, userId, category, name) {
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

        const returnClothesList = new Array();

        await tempCloset.forEach((element) => {
            returnClothesList.push({
                id: element.user_id,
                categoryId: element.category_id,
                name: element.name
            });
        });
        return returnClothesList;
    }
}

async function deleteClothesByUserId(token, userId, clothesList) {
    // token과 userid로 valid한지 체크하고, clothes에 해당하는 옷들 삭제
    const flag = await isValidTokenById(userId, token);
    if (!flag) {
        // 토큰이 맞지 않음. 잘못된 요청
        throw Error(exception.MISMATCH_TOKEN);
    } else {
        await Clothes.update(
            {
                is_deleted: 1
            },
            {
                where: {
                    id: {
                        [Op.in]: clothesList
                    }
                }
            }
        );

        /*
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
        */
    }

    const returnCloset = await getClothesByUserId(token, userId);
    return returnCloset;
}

module.exports = {
    getClothesByUserId,
    addClothesByUserId,
    deleteClothesByUserId
};
