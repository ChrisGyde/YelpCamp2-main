const express = require('express');
const router = express.Router();
const {
	isLoggedIn,
	isCampgroundAuthor,
	validateCampground,
} = require('../middleware');
const catchAsync = require('../utilities/catchAsync');
const campgrounds = require('../controllers/campgrounds');

router
	.route('/')
	.get(catchAsync(campgrounds.index))
	.post(
		isLoggedIn,
		validateCampground,
		catchAsync(campgrounds.createCampground)
	);

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
	.route('/:id')
	.get(catchAsync(campgrounds.renderCampground))
	.put(
		isLoggedIn,
		validateCampground,
		isCampgroundAuthor,
		catchAsync(campgrounds.editCampground)
	)
	.delete(
		isLoggedIn,
		isCampgroundAuthor,
		catchAsync(campgrounds.deleteCampground)
	);

router.get(
	'/:id/edit',
	isLoggedIn,
	isCampgroundAuthor,
	catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
