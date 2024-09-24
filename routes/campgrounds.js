const express = require('express');
const router = express.Router();
const {
	isLoggedIn,
	isCampgroundAuthor,
	validateCampground,
} = require('../middleware');
const catchAsync = require('../utilities/catchAsync');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router
	.route('/')
	.get(catchAsync(campgrounds.index))
	.post(
		isLoggedIn,
		upload.array('images'),
		validateCampground,
		catchAsync(campgrounds.createCampground)
	);

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
	.route('/:id')
	.get(catchAsync(campgrounds.renderCampground))
	.put(
		isLoggedIn,
		isCampgroundAuthor,
		upload.array('images'),
		validateCampground,
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
