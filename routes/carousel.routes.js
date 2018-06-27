const express = require('express');
const controller = require('../controllers/carousel.controller');

const router = express.Router();

router.post('/', controller.addCarousel);
router.get('/', controller.getCarousel);
router.put('/:id', controller.updateCarousel);
router.delete('/:id', controller.deleteCarousel);

module.exports = router;