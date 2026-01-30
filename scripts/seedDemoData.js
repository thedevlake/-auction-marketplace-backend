const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Auction = require('../models/Auction');

const seedDemoData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a demo seller
    let seller = await User.findOne({ email: 'seller@demo.com' });
    if (!seller) {
      seller = await User.create({
        name: 'Demo Seller',
        email: 'seller@demo.com',
        password: 'demo123456',
        role: 'seller'
      });
      console.log('Created demo seller');
    }

    // Clear existing demo auctions
    await Auction.deleteMany({ seller: seller._id });
    console.log('Cleared existing demo auctions');

    // Create demo auctions
    const demoAuctions = [
      {
        seller: seller._id,
        itemName: 'Vintage MacBook Pro 16"',
        description: 'Beautiful vintage MacBook Pro in excellent condition. Perfect for collectors or daily use.',
        category: 'Tech',
        tags: ['New', 'Trending'],
        startingPrice: 1200,
        currentBid: 1250,
        bidIncrement: 50,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'live',
        numberOfBids: 5,
        images: [
          'https://picsum.photos/800/600?random=1',
          'https://picsum.photos/800/600?random=2'
        ]
      },
      {
        seller: seller._id,
        itemName: 'Designer Leather Jacket',
        description: 'Premium designer leather jacket, never worn. Limited edition piece.',
        category: 'Fashion',
        tags: ['New', 'High Demand'],
        startingPrice: 450,
        currentBid: 520,
        bidIncrement: 25,
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'live',
        numberOfBids: 8,
        images: [
          'https://picsum.photos/800/600?random=3'
        ]
      },
      {
        seller: seller._id,
        itemName: 'Rare Collectible Watch',
        description: 'Vintage collectible watch in mint condition. Comes with original box and papers.',
        category: 'Collectibles',
        tags: ['Trending', 'Ending Soon'],
        startingPrice: 2500,
        currentBid: 3200,
        bidIncrement: 100,
        endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        status: 'live',
        numberOfBids: 12,
        images: [
          'https://picsum.photos/800/600?random=4'
        ]
      },
      {
        seller: seller._id,
        itemName: 'Professional Camera Kit',
        description: 'Complete professional photography kit with multiple lenses and accessories.',
        category: 'Tech',
        tags: ['New'],
        startingPrice: 1800,
        currentBid: 1800,
        bidIncrement: 75,
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'live',
        numberOfBids: 0,
        images: [
          'https://picsum.photos/800/600?random=5'
        ]
      },
      {
        seller: seller._id,
        itemName: 'Luxury Handbag Collection',
        description: 'Set of 3 designer handbags in perfect condition. Authentic and rare.',
        category: 'Fashion',
        tags: ['Trending', 'High Demand'],
        startingPrice: 800,
        currentBid: 950,
        bidIncrement: 50,
        endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        status: 'live',
        numberOfBids: 6,
        images: [
          'https://picsum.photos/800/600?random=6'
        ]
      },
      {
        seller: seller._id,
        itemName: 'Vintage Vinyl Records',
        description: 'Collection of rare vintage vinyl records from the 70s and 80s.',
        category: 'Collectibles',
        tags: ['No Reserve'],
        startingPrice: 300,
        currentBid: 350,
        bidIncrement: 20,
        endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        status: 'live',
        numberOfBids: 3,
        images: [
          'https://picsum.photos/800/600?random=7'
        ]
      },
      {
        seller: seller._id,
        itemName: 'Smart Home System',
        description: 'Complete smart home automation system with all accessories included.',
        category: 'Tech',
        tags: ['New', 'Trending'],
        startingPrice: 600,
        currentBid: 600,
        bidIncrement: 30,
        endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'live',
        numberOfBids: 0,
        images: [
          'https://picsum.photos/800/600?random=8'
        ]
      },
      {
        seller: seller._id,
        itemName: 'Artisan Coffee Set',
        description: 'Premium artisan coffee brewing set with handcrafted accessories.',
        category: 'Daily',
        tags: ['New'],
        startingPrice: 150,
        currentBid: 180,
        bidIncrement: 15,
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'live',
        numberOfBids: 4,
        images: [
          'https://picsum.photos/800/600?random=9'
        ]
      }
    ];

    const createdAuctions = await Auction.insertMany(demoAuctions);
    console.log(`Created ${createdAuctions.length} demo auctions`);

    console.log('\n✅ Demo data seeded successfully!');
    console.log('You can now see auctions with images on the homepage.');
    console.log('\nDemo seller credentials:');
    console.log('Email: seller@demo.com');
    console.log('Password: demo123456');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  }
};

seedDemoData();
