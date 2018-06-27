const models = require('../../models');
const _ = require('lodash');

const _bindModel = (data) => {
    const {
        image,
        order,
        linkUrl,
        title,
        description,
        contentType,
        startDate,
        endDate
    } = data;
    const model = {
        image,
        order,
        linkUrl,
        title,
        description,
        contentType,
        startDate,
        endDate
    };
    return model;
};

const addCarousel = async(carousel) => {
    const _carousel = _bindModel(carousel);
    const newCarousel = await models.carousel.create(_carousel);
    return newCarousel;
};

const getCarousel = async() => {
    const today = new Date();
    const carousel = await models.carousel.findAll({
        where: {
            startDate: {
                $lte: today
            },
            endDate: {
                $gte: today
            }
        },
        order: [
            ['order', 'ASC']
          ]
    });
    return carousel;
}

const updateCarousel = async(id, data) => {
    const _carousel = _bindModel(data);
    const carousel = await getCarousel(id);
    const updatedCarousel = await carousel.updateAttributes(_carousel);
    return updatedCarousel;
};

const deleteCarousel = async(id) => {
    const carousel = await getCarousel(id);
    const deletedCarousel = carousel.destroy();
    return deletedCarousel;
};

module.exports = {
    addCarousel,
    getCarousel,
    updateCarousel,
    deleteCarousel
};