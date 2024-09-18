const mongoose = require('mongoose');
const axios = require('axios');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campgrounds');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

async function seedImg() {
	try {
		const resp = await axios.get('https://api.unsplash.com/photos/random', {
			params: {
				client_id: 'IHijM7eTAeTS6rDJNUwyHSjFhrLfJfvIw029UwAQ4no',
				collections: 483251,
			},
		});
		return resp.data.urls.small;
	} catch (err) {
		console.error(err);
	}
}

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;

		const camp = new Campground({
			author: '66e8aaaa54dfe4eba892fa5f',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			image: await seedImg(),
			price,
			description:
				'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Debitis, nihil tempora vel aspernatur quod aliquam illum! Iste impedit odio esse neque veniam molestiae eligendi commodi minus, beatae accusantium, doloribus quo!',
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
