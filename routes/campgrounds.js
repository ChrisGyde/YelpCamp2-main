const express = require('express');
const router = express.Router();
const {
	isLoggedIn,
	isCampgroundAuthor,
	validateCampground,
} = require('../middleware');
const catchAsync = require('../utilities/catchAsync');
const campgrounds = require('../controllers/campgrounds');

router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.post(
	'/',
	isLoggedIn,
	validateCampground,
	catchAsync(campgrounds.createCampground)
);

router.get('/:id', catchAsync(campgrounds.renderCampground));

router.get(
	'/:id/edit',
	isLoggedIn,
	isCampgroundAuthor,
	catchAsync(campgrounds.renderEditForm)
);

router.put(
	'/:id',
	isLoggedIn,
	validateCampground,
	isCampgroundAuthor,
	catchAsync(campgrounds.editCampground)
);

router.delete(
	'/:id',
	isLoggedIn,
	isCampgroundAuthor,
	catchAsync(campgrounds.deleteCampground)
);

module.exports = router;
