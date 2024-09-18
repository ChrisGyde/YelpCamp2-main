const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Campground = require('../models/campgrounds');
const { campgroundSchema } = require('../schemas');
const { isLoggedIn } = require('../middleware');

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

router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

router.post(
	'/',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		campground.author = req.user._id;
		await campground.save();
		req.flash('success', 'New campground created!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.get(
	'/:id',
	catchAsync(async (req, res, next) => {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			req.flash('error', 'Invalid campground ID');
			return res.redirect('/campgrounds');
		}
		const campground = await Campground.findById(req.params.id)
			.populate('reviews')
			.populate('author');
		console.log(campground);
		if (!campground) {
			req.flash('error', 'Cannot find that campground');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/details', { campground });
	})
);

router.get(
	'/:id/edit',
	isLoggedIn,
	catchAsync(async (req, res, next) => {
		const campground = await Campground.findById(req.params.id);
		if (!campground) {
			req.flash('error', 'Cannot find that campground');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/edit', { campground });
	})
);

router.put(
	'/:id',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const campground = await Campground.findById(id);

		if (!campground.author.equals(req.user._id)) {
			req.flash('error', 'you do not have permission to do that');
			return res.redirect(`/campgrounds/${id}`);
		}

		const camp = await Campground.findByIdAndUpdate(id, {
			...req.body.campground,
		});
		req.flash('success', 'Campground updated!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.delete(
	'/:id',
	isLoggedIn,
	catchAsync(async (req, res, next) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash('success', 'Campground deleted!');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
