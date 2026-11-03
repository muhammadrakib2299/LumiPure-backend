# LumiPure Backend API

Backend API for LumiPure Beauty E-commerce Platform built with Node.js, Express, and MongoDB.

Frontend (Next.js storefront and admin panel): [LumiPure-frontend](https://github.com/muhammadrakib2299/LumiPure-frontend)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configurations:
- MongoDB connection string
- JWT secret key
- Cloudinary credentials (optional)
- Email configuration (optional)

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/update-profile` - Update profile (Protected)
- `PUT /api/auth/change-password` - Change password (Protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/images` - Upload product images (Admin)

## 📁 Project Structure

```
LumiPure-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middlewares
│   ├── utils/           # Utility functions
│   └── server.js        # App entry point
├── uploads/             # Temporary file uploads
├── .env                 # Environment variables
├── .gitignore
└── package.json
```

## 🔐 Environment Variables

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

## 📝 Next Steps

1. Set up MongoDB database
2. Configure environment variables
3. Run `npm install`
4. Start development server with `npm run dev`
5. Test API endpoints using Postman or Thunder Client

## 🛠️ Technologies

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Multer** - File uploads
