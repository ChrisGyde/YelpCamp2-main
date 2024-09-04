const express = require('express');
const router = express.Router();

const Campground = require('../models/campgrounds');
const { campgroundSchema } = require('../schemas.js');

const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');

//<middleware>

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

//</middleware>

router.get(
	'/',
	catchAsync(async (req, res, next) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

router.get('/new', (req, res) => {
	res.render('campgrounds/new');
});

router.post(
	'/',
	validateCampground,
	catchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		await campground.save();
		req.flash('success', 'New campground created!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.get(
	'/:id',
	catchAsync(async (req, res, next) => {
		const campground = await Campground.findById(req.params.id).populate(
			'reviews'
		);
		if (!campground) {
			throw new ExpressError('Campground not found', 404);
		}
		res.render('campgrounds/details', { campground });
	})
);

router.get(
	'/:id/edit',
	catchAsync(async (req, res, next) => {
		const campground = await Campground.findById(req.params.id);
		if (!campground) {
			throw new ExpressError('Campground not found', 404);
		}
		res.render('campgrounds/edit', { campground });
	})
);

router.put(
	'/:id',
	validateCampground,
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		req.flash('success', 'Campground updated!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.delete(
	'/:id',
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash('success', 'Campground deleted!');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
