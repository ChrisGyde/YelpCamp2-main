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
	/* .post(
		isLoggedIn,
		validateCampground,
		catchAsync(campgrounds.createCampground)
	); */
	.post(upload.array('image'), (req, res) => {
		console.log(req.body, req.files);
		res.send('it worked');
	});

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
