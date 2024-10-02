const Campground = require('../models/campgrounds');
const mongoose = require('mongoose');

const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res, next) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
	const geoData = await maptilerClient.geocoding.forward(
		req.body.campground.location,
		{ limit: 1 }
	);

	const campground = new Campground(req.body.campground);

	campground.geometry = geoData.features[0].geometry;

	campground.images = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	campground.author = req.user._id;
	await campground.save();
	console.log(campground);
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
	const images = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	campground.images.push(...images);
	await campground.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
	}
	req.flash('success', 'Campground updated!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Campground deleted!');
	res.redirect('/campgrounds');
};
