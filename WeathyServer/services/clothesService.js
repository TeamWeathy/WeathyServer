const { Clothes, ClothesCategory, WeathyClothes } = require('../models');
const exception = require('../modules/exception');
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

const unionTwoCloset = (closet1, closet2) => {
    const top1 = closet1.top.clothes;
    const top2 = closet2.top.clothes;
    const unionTop = top2.concat(top1).filter(function (cl) {
        return this.has(cl.id) ? false : this.add(cl.id);
    }, new Set());
    const bottom1 = closet1.bottom.clothes;
    const bottom2 = closet2.bottom.clothes;
    const unionBottom = bottom2.concat(bottom1).filter(function (cl) {
        return this.has(cl.id) ? false : this.add(cl.id);
    }, new Set());
    const outer1 = closet1.outer.clothes;
    const outer2 = closet2.outer.clothes;
    const unionOuter = outer2.concat(outer1).filter(function (cl) {
        return this.has(cl.id) ? false : this.add(cl.id);
    }, new Set());
    const etc1 = closet1.etc.clothes;
    const etc2 = closet2.etc.clothes;
    const unionEtc = etc2.concat(etc1).filter(function (cl) {
        return this.has(cl.id) ? false : this.add(cl.id);
    }, new Set());

    const unionCloset = {
        top: {
            categoryId: 1,
            clothesNum: top1.length,
            clothes: unionTop
        },
        bottom: {
            categoryId: 2,
            clothesNum: bottom1.length,
            clothes: unionBottom
        },
        outer: {
            categoryId: 3,
            clothesNum: outer1.length,
            clothes: unionOuter
        },
        etc: {
            categoryId: 4,
            clothesNum: etc1.length,
            clothes: unionEtc
        }
    };
    return unionCloset;
};

async function getClothesNumByUserId(userId) {
    const aliveClothes = await Clothes.findAndCountAll({
        where: {
            user_id: userId,
            is_deleted: 0
        }
    });
    return aliveClothes.count;
}

async function getClothesByUserId(userId) {
    const responseCloset = new Object();
    const clothesCategories = await ClothesCategory.findAll();

    for (const category of clothesCategories) {
        const categoryClothes = await Clothes.findAll({
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

        const categoryCloset = new Object();
        categoryCloset.categoryId = category.id;
        const categoryClothesList = new Array();
        await categoryClothes.forEach((element) => {
            const clothes = new Object();
            clothes.id = element.id;
            clothes.name = element.name;
            categoryClothesList.push(clothes);
        });
        categoryCloset.clothes = categoryClothesList;
        categoryCloset.clothesNum = categoryClothesList.length;
        responseCloset[category.name] = categoryCloset;
    }
    return responseCloset;
}

async function getClothesByWeathyId(userId, weathyId) {
    const responseCloset = new Object();
    const clothesCategories = await ClothesCategory.findAll();

    const weathyClothes = await WeathyClothes.findAll({
        where: {
            weathy_id: weathyId
        },
        attributes: ['clothes_id']
    });
    const weathyClothesIdList = new Array();
    await weathyClothes.forEach((e) => {
        weathyClothesIdList.push(e.dataValues.clothes_id);
    });

    for (const category of clothesCategories) {
        const categoryClothes = await Clothes.findAll({
            where: {
                user_id: userId,
                category_id: category.id,
                id: {
                    [Op.in]: weathyClothesIdList
                }
            },
            order: [
                ['updated_at', 'DESC'],
                ['id', 'DESC']
            ]
        });

        const categoryCloset = new Object();
        categoryCloset.categoryId = category.id;
        const categoryClothesList = new Array();
        await categoryClothes.forEach((element) => {
            const clothes = new Object();
            clothes.id = element.id;
            clothes.name = element.name;
            categoryClothesList.push(clothes);
        });
        categoryCloset.clothes = categoryClothesList;
        categoryCloset.clothesNum = categoryClothesList.length;
        responseCloset[category.name] = categoryCloset;
    }
    return responseCloset;
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

async function addClothesByUserId(userId, category, name) {
    // 이미 한 번 지워졌었던 값인지 확인하는 작업이 필요하다
    const alreadyClothes = await Clothes.findOne({
        where: { user_id: userId, category_id: category, name: name }
    });

    if (alreadyClothes === null) {
        await Clothes.create({
            user_id: userId,
            category_id: category,
            name: name,
            is_deleted: 0
        });
    } else if (alreadyClothes.is_deleted === 0) {
        throw Error(exception.ALREADY_CLOTHES);
    } else {
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

    const responseCloset = new Object();
    const clothesCategories = await ClothesCategory.findAll();

    for (const ca of clothesCategories) {
        const categoryClothes = await Clothes.findAll({
            where: {
                user_id: userId,
                category_id: ca.id,
                is_deleted: 0
            },
            order: [
                ['updated_at', 'DESC'],
                ['id', 'DESC']
            ]
        });
        const categoryCloset = new Object();
        categoryCloset.categoryId = ca.id;
        const categoryClothesList = new Array();
        await categoryClothes.forEach((element) => {
            const clothes = new Object();
            clothes.id = element.id;
            clothes.name = element.name;
            categoryClothesList.push(clothes);
        });
        if (ca.id === category) {
            categoryCloset.clothes = categoryClothesList;
        } else {
            categoryCloset.clothes = [];
        }
        categoryCloset.clothesNum = categoryCloset.clothes.length;
        responseCloset[ca.name] = categoryCloset;
    }
    return responseCloset;
}

async function deleteClothesByUserId(userId, clothesList) {
    // If there are invalid clothes in clothesList, throw error
    for (let c in clothesList) {
        let cl = await Clothes.findOne({
            where: { user_id: userId, id: clothesList[c] }
        });

        if (cl === null || cl.is_deleted === 1) {
            throw Error(exception.NO_CLOTHES);
        }
    }

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

    const responseCloset = await getClothesByUserId(userId);
    return responseCloset;
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
    await createClothesByName(userId, 1, '셔츠');
    await createClothesByName(userId, 1, '블라우스');
    await createClothesByName(userId, 1, '나시');
    await createClothesByName(userId, 2, '청바지');
    await createClothesByName(userId, 2, '슬랙스');
    await createClothesByName(userId, 2, '면바지');
    await createClothesByName(userId, 2, '트레이닝복');
    await createClothesByName(userId, 2, '스커트');
    await createClothesByName(userId, 2, '레깅스');
    await createClothesByName(userId, 3, '패딩');
    await createClothesByName(userId, 3, '코트');
    await createClothesByName(userId, 3, '재킷');
    await createClothesByName(userId, 3, '점퍼');
    await createClothesByName(userId, 3, '가디건');
    await createClothesByName(userId, 3, '경량패딩');
    await createClothesByName(userId, 4, '목도리');
    await createClothesByName(userId, 4, '장갑');
    await createClothesByName(userId, 4, '모자');
    await createClothesByName(userId, 4, '부츠');
    await createClothesByName(userId, 4, '스니커즈');
    await createClothesByName(userId, 4, '로퍼');
}

module.exports = {
    unionTwoCloset,
    getClothesNumByUserId,
    getClothesByUserId,
    getClothesByWeathyId,
    addClothesByUserId,
    deleteClothesByUserId,
    getWeathyCloset,
    createDefaultClothes
};
