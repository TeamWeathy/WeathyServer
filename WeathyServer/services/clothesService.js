const { Clothes, ClothesCategory, WeathyClothes } = require('../models');
const exception = require('../modules/exception');
const { isValidTokenById } = require('./tokenService');
const { Op } = require('sequelize');

const setClothesForm = async () => {
    const closet = {};

    const clothesCategories = await ClothesCategory.findAll({
        attributes: ['name', 'id']
    });

    for (const c of clothesCategories) {
        closet[c.name] = {
            categoryId: c.id,
            clothes: []
        };
    }
    return closet;
};

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
                },
                order: [
                    ['updated_at', 'DESC'],
                    ['id', 'DESC']
                ]
            });
            const temp = new Object();
            temp.categoryId = category.id;
            const tempClothesList = new Array();
            await tempCloset.forEach((element) => {
                const tempClothes = new Object();
                tempClothes.id = element.id;
                tempClothes.name = element.name;
                tempClothesList.push(tempClothes);
            });
            temp.clothes = tempClothesList;
            returnCloset[category.name] = temp;
        }

        return returnCloset;
    }
}

async function getWeathyCloset(weathyId) {
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
        throw Error(exception.SERVER_ERROR);
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

        /*
        const tempCloset = await Clothes.findAll({
            where: { user_id: userId, category_id: category, is_deleted: 0 }
        });

        const returnClothesList = new Array();

        await tempCloset.forEach((element) => {
            returnClothesList.push({
                id: element.id,
                categoryId: element.category_id,
                name: element.name
            });
        });
        return returnClothesList;
        */

        const returnCloset = new Object();
        const clothesCategories = await ClothesCategory.findAll();

        for (const tempCategory of clothesCategories) {
            const tempCloset = await Clothes.findAll({
                where: {
                    user_id: userId,
                    category_id: tempCategory.id,
                    is_deleted: 0
                },
                order: [
                    ['updated_at', 'DESC'],
                    ['id', 'DESC']
                ]
            });
            const temp = new Object();
            temp.categoryId = tempCategory.id;
            const tempClothesList = new Array();
            await tempCloset.forEach((element) => {
                const tempClothes = new Object();
                tempClothes.id = element.id;
                tempClothes.name = element.name;
                tempClothesList.push(tempClothes);
            });
            if (tempCategory.id === category) {
                temp.clothes = tempClothesList;
            } else {
                temp.clothes = [];
            }
            returnCloset[tempCategory.name] = temp;
        }
        return returnCloset;
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
    }

    const returnCloset = await getClothesByUserId(token, userId);
    return returnCloset;
}

async function createClothesByName(userId, category, name) {
    // name으로 userId의 clothes 만들기
    await Clothes.create({
        user_id: userId,
        category_id: category,
        name: name,
        is_deleted: 0
    });
}

async function createDefaultClothes(userId) {
    // 유저 생성될 때 기본으로 생성되는 clothes들 만들기
    await createClothesByName(userId, 1, '니트');
    await createClothesByName(userId, 1, '후드티');
    await createClothesByName(userId, 1, '티셔츠');
    await createClothesByName(userId, 2, '데님팬츠');
    await createClothesByName(userId, 2, '스커트');
    await createClothesByName(userId, 2, '슬랙스');
    await createClothesByName(userId, 3, '패딩');
    await createClothesByName(userId, 3, '코트');
    await createClothesByName(userId, 3, '점퍼');
    await createClothesByName(userId, 4, '목도리');
    await createClothesByName(userId, 4, '장갑');
    await createClothesByName(userId, 4, '모자');
}

module.exports = {
    getClothesByUserId,
    addClothesByUserId,
    deleteClothesByUserId,
    getWeathyCloset,
    createDefaultClothes
};
