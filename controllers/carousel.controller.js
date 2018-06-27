const carouselHelper = require('../helpers/db/carousel.helper');
const responseHelper = require('../helpers/response/response.helper');

const addCarousel = (req, res) => {
    carouselHelper.addCarousel(req.body)
    .then(result => responseHelper.send(null, result, res))
    .catch(err => responseHelper.send(err, null, res));
};

const getCarousel = (req, res) => {
    carouselHelper.getCarousel()
    .then(result => responseHelper.send(null, result, res))
    .catch(err => responseHelper.send(err, null, res));
};

const updateCarousel = (req, res) => {
    carouselHelper.getCarousel(req.params.id, req.body)
    .then(result => responseHelper.send(null, result, res))
    .catch(err => responseHelper.send(err, null, res));
};

const deleteCarousel = function (req, res) {
    carouselHelper.deleteCarousel(req.params.id, function (err, carousel) {
        responseHelper.send(err, carousel, res);
    });
};

module.exports = {
    addCarousel,
    getCarousel,
    updateCarousel,
    deleteCarousel
}