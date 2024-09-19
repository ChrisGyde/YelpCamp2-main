const Campground = require('../models/campgrounds');
const mongoose = require('mongoose');

module.exports.index = async (req, res, next) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
	const campground = new Campground(req.body.campground);
	campground.author = req.user._id;
	await campground.save();
	req.flash('success', 'New campground created!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.renderCampground = async (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		req.flash('error', 'Invalid campground ID');
		return res.redirect('/campgrounds');
	}
	const campground = await Campground.findById(req.params.id)
		.populate({ path: 'reviews', populate: { path: 'author' } })
		.populate('author');
	console.log(campground);
	if (!campground) {
		req.flash('error', 'Cannot find that campground');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/details', { campground });
};

module.exports.renderEditForm = async (req, res, next) => {
	const campground = await Campground.findById(req.params.id);
	if (!campground) {
		req.flash('error', 'Cannot find that campground');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/edit', { campground });
};

module.exports.editCampground = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(id, {
		...req.body.campground,
	});
	req.flash('success', 'Campground updated!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Campground deleted!');
	res.redirect('/campgrounds');
};
