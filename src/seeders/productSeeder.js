import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import connectDB from '../config/db.js';

// Load env variables
dotenv.config();

// Sample product data
const sampleProducts = [
    {
        name: 'Hydrating Facial Serum',
        description: 'A powerful hydrating serum enriched with hyaluronic acid and vitamin E. Deeply moisturizes skin, reduces fine lines, and promotes a youthful glow. Suitable for all skin types.',
        shortDescription: 'Intense hydration with hyaluronic acid',
        price: 49.99,
        comparePrice: 69.99,
        stock: 150,
        sku: 'HFS-001',
        brand: 'LumiPure',
        images: [
            {
                public_id: 'lumipure/serum-1',
                url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop',
            },
        ],
        ingredients: 'Hyaluronic Acid, Vitamin E, Aloe Vera Extract, Glycerin, Aqua',
        howToUse: 'Apply 2-3 drops to clean, dry skin morning and evening. Gently massage in circular motions until fully absorbed.',
        ratings: {
            average: 4.8,
            count: 245,
        },
        isFeatured: true,
        tags: ['hydrating', 'serum', 'anti-aging', 'vegan'],
        seoTitle: 'Hydrating Facial Serum - LumiPure Natural Skincare',
        seoDescription: 'Premium hydrating serum with hyaluronic acid for radiant, youthful skin',
    },
    {
        name: 'Vitamin C Brightening Cream',
        description: 'Illuminate your complexion with our Vitamin C-enriched brightening cream. Reduces dark spots, evens skin tone, and provides antioxidant protection. Perfect for dull, tired skin.',
        shortDescription: 'Brightens and evens skin tone',
        price: 59.99,
        comparePrice: 79.99,
        stock: 120,
        sku: 'VCC-002',
        brand: 'LumiPure',
        images: [
            {
                public_id: 'lumipure/cream-1',
                url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop',
            },
        ],
        ingredients: 'Vitamin C, Niacinamide, Shea Butter, Jojoba Oil, Aqua',
        howToUse: 'Apply to face and neck after cleansing. Use morning and night for best results.',
        ratings: {
            average: 4.7,
            count: 189,
        },
        isFeatured: true,
        tags: ['brightening', 'vitamin-c', 'anti-aging', 'cruelty-free'],
    },
    {
        name: 'Gentle Cleansing Foam',
        description: 'A luxurious foaming cleanser that gently removes makeup, dirt, and impurities without stripping skin of natural oils. Infused with chamomile and green tea extracts.',
        shortDescription: 'Gentle daily cleanser for all skin types',
        price: 29.99,
        stock: 200,
        sku: 'GCF-003',
        brand: 'LumiPure',
        images: [
            {
                public_id: 'lumipure/cleanser-1',
                url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop',
            },
        ],
        ingredients: 'Chamomile Extract, Green Tea, Glycerin, Coconut Oil Derivative, Aqua',
        howToUse: 'Wet face, apply a small amount, massage gently, and rinse thoroughly with warm water.',
        ratings: {
            average: 4.9,
            count: 312,
        },
        isFeatured: false,
        tags: ['cleanser', 'gentle', 'natural', 'vegan'],
    },
    {
        name: 'Rose Water Toner',
        description: 'Refresh and balance your skin with our pure rose water toner. Minimizes pores, soothes irritation, and prepares skin for better absorption of serums and moisturizers.',
        shortDescription: 'Balancing and refreshing toner',
        price: 24.99,
        stock: 180,
        sku: 'RWT-004',
        brand: 'LumiPure',
        images: [
            {
                public_id: 'lumipure/toner-1',
                url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=800&fit=crop',
            },
        ],
        ingredients: 'Rose Water, Witch Hazel, Aloe Vera, Glycerin, Aqua',
        howToUse: 'After cleansing, apply to cotton pad and sweep across face and neck. Use morning and night.',
        ratings: {
            average: 4.6,
            count: 156,
        },
        isFeatured: false,
        tags: ['toner', 'rose-water', 'balancing', 'natural'],
    },
    {
        name: 'Night Repair Retinol Cream',
        description: 'Powerful overnight treatment with retinol and peptides. Reduces wrinkles, improves skin texture, and promotes cellular renewal while you sleep.',
        shortDescription: 'Anti-aging night cream with retinol',
        price: 69.99,
        comparePrice: 89.99,
        stock: 95,
        sku: 'NRC-005',
        brand: 'LumiPure',
        images: [
            {
                public_id: 'lumipure/night-cream-1',
                url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop',
            },
        ],
        ingredients: 'Retinol, Peptides, Hyaluronic Acid, Vitamin E, Shea Butter',
        howToUse: 'Apply to clean skin every evening. Start with 2-3 times per week and gradually increase frequency.',
        ratings: {
            average: 4.8,
            count: 203,
        },
        isFeatured: true,
        tags: ['retinol', 'anti-aging', 'night-cream', 'peptides'],
    },
    {
        name: 'Exfoliating Sugar Scrub',
        description: 'Natural sugar scrub that gently exfoliates dead skin cells, revealing smoother, brighter skin. Enriched with coconut oil and vitamin E for deep nourishment.',
        shortDescription: 'Gentle exfoliation with natural sugar',
        price: 34.99,
        stock: 140,
        sku: 'ESS-006',
        brand: 'LumiPure',
        images: [
            {
                public_id: 'lumipure/scrub-1',
                url: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=800&fit=crop',
            },
        ],
        ingredients: 'Sugar, Coconut Oil, Vitamin E, Vanilla Extract, Essential Oils',
        howToUse: 'Apply to damp skin in circular motions. Rinse thoroughly. Use 2-3 times weekly.',
        ratings: {
            average: 4.7,
            count: 178,
        },
        isFeatured: false,
        tags: ['exfoliating', 'scrub', 'natural', 'coconut'],
    },
    {
        name: 'Eye Renewal Cream',
        description: 'Specialized eye cream that reduces dark circles, puffiness, and fine lines. Caffeine and peptides provide instant brightening and long-term anti-aging benefits.',
        shortDescription: 'Reduces dark circles and puffiness',
        price: 44.99,
        stock: 110,
        sku: 'ERC-007',
        brand: 'LumiPure',
        images: [
            {
                public_id: 'lumipure/eye-cream-1',
                url: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&h=800&fit=crop',
            },
        ],
        ingredients: 'Caffeine, Peptides, Hyaluronic Acid, Vitamin K, Cucumber Extract',
        howToUse: 'Gently pat a small amount around eye area morning and night.',
        ratings: {
            average: 4.5,
            count: 134,
        },
        isFeatured: false,
        tags: ['eye-cream', 'anti-aging', 'caffeine', 'peptides'],
    },
    {
        name: 'Mineral Sunscreen SPF 50',
        description: 'Broad-spectrum mineral sunscreen with zinc oxide. Provides superior protection against UVA/UVB rays while nourishing skin with antioxidants. Non-greasy, reef-safe formula.',
        shortDescription: 'Mineral SPF 50 protection',
        price: 39.99,
        stock: 165,
        sku: 'MSS-008',
        brand: 'LumiPure',
        images: [
            {
                public_id: 'lumipure/sunscreen-1',
                url: 'https://images.unsplash.com/photo-1556228852-80c3c6fb3191?w=800&h=800&fit=crop',
            },
        ],
        ingredients: 'Zinc Oxide, Titanium Dioxide, Vitamin E, Green Tea Extract, Aloe Vera',
        howToUse: 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours or after swimming.',
        ratings: {
            average: 4.9,
            count: 267,
        },
        isFeatured: true,
        tags: ['sunscreen', 'spf-50', 'mineral', 'reef-safe'],
    },
    {
        name: 'Nourishing Face Oil',
        description: 'Luxurious blend of organic oils including rosehip, argan, and jojoba. Deeply nourishes, repairs, and gives skin a radiant glow. Perfect for dry or mature skin.',
        shortDescription: 'Multi-purpose facial oil blend',
        price: 54.99,
        stock: 88,
        sku: 'NFO-009',
        brand: 'LumiPure',
        images: [
            {
                public_id: 'lumipure/face-oil-1',
                url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop',
            },
        ],
        ingredients: 'Rosehip Oil, Argan Oil, Jojoba Oil, Vitamin E, Essential Oils',
        howToUse: 'Apply 3-4 drops to clean skin. Can be used alone or mixed with moisturizer.',
        ratings: {
            average: 4.8,
            count: 145,
        },
        isFeatured: false,
        tags: ['face-oil', 'organic', 'nourishing', 'anti-aging'],
    },
    {
        name: 'Clay Detox Mask',
        description: 'Purifying clay mask with activated charcoal that draws out impurities, unclogs pores, and absorbs excess oil. Leaves skin feeling refreshed and refined.',
        shortDescription: 'Detoxifying clay mask for clear skin',
        price: 32.99,
        stock: 125,
        sku: 'CDM-010',
        brand: 'LumiPure',
        images: [
            {
                public_id: 'lumipure/mask-1',
                url: 'https://images.unsplash.com/photo-1556228578-dd7f8b1b1c3e?w=800&h=800&fit=crop',
            },
        ],
        ingredients: 'Kaolin Clay, Activated Charcoal, Tea Tree Oil, Aloe Vera, Glycerin',
        howToUse: 'Apply even layer to clean skin, avoiding eye area. Leave for 10-15 minutes, rinse with warm water. Use 1-2 times weekly.',
        ratings: {
            average: 4.7,
            count: 198,
        },
        isFeatured: false,
        tags: ['mask', 'clay', 'detox', 'charcoal'],
    },
];

// Sample categories
const sampleCategories = [
    {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Complete skincare solutions for healthy, radiant skin',
        isActive: true,
    },
    {
        name: 'Cleansers',
        slug: 'cleansers',
        description: 'Gentle cleansers for all skin types',
        parent: null, // Will be set to Skincare after creation
        isActive: true,
    },
    {
        name: 'Serums',
        slug: 'serums',
        description: 'Concentrated treatments for specific skin concerns',
        isActive: true,
    },
    {
        name: 'Moisturizers',
        slug: 'moisturizers',
        description: 'Hydrating creams and lotions',
        isActive: true,
    },
    {
        name: 'Masks',
        slug: 'masks',
        description: 'Face masks for deep treatment',
        isActive: true,
    },
    {
        name: 'Sun Protection',
        slug: 'sun-protection',
        description: 'Sunscreens and UV protection',
        isActive: true,
    },
];

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Connect to database
        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Product.deleteMany({});
        await Category.deleteMany({});
        console.log('✅ Existing data cleared\n');

        // Insert categories
        console.log('📁 Creating categories...');
        const createdCategories = await Category.insertMany(sampleCategories);
        console.log(`✅ Created ${createdCategories.length} categories\n`);

        // Get Skincare category ID for products
        const skincareCategory = createdCategories.find(cat => cat.slug === 'skincare');

        // Add category to products
        const productsWithCategory = sampleProducts.map(product => ({
            ...product,
            category: skincareCategory._id,
        }));

        // Insert products
        console.log('📦 Creating products...');
        const createdProducts = await Product.insertMany(productsWithCategory);
        console.log(`✅ Created ${createdProducts.length} products\n`);

        // Display summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 DATABASE SEEDING COMPLETE!\n');
        console.log('📊 Summary:');
        console.log(`   • Categories: ${createdCategories.length}`);
        console.log(`   • Products: ${createdProducts.length}`);
        console.log(`   • Featured Products: ${createdProducts.filter(p => p.isFeatured).length}`);
        console.log('\n📝 Sample Products:');
        createdProducts.slice(0, 5).forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
        });
        console.log('   ...\n');
        console.log('✅ You can now start your application!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeder
seedDatabase();
