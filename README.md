# PayWallet - Digital Wallet Application

A modern, full-stack digital wallet application built with React, Node.js, Express, and MongoDB. Features secure money transfers, transaction history, and user management.

![PayWallet](https://photos.app.goo.gl/Xz9DpTU4XMFnmHDL8)

## ✨ Features

### 🔐 Authentication & Security
- Secure user registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting and security headers
- Protected routes and middleware

### 💸 Money Management
- Real-time balance tracking
- Instant money transfers
- Transaction history with search
- Transfer confirmations
- Account statements

### 👤 User Experience
- Modern, responsive UI design
- Real-time notifications
- User profile management
- Search and find users
- Transaction filtering

### 🛡️ Security Features
- Input validation with Zod
- SQL injection protection
- XSS protection
- CORS configuration
- Environment variable management

## 🚀 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Input validation
- **express-rate-limit** - Rate limiting

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **React Hot Toast** - Notifications
- **Axios** - HTTP client
- **Vite** - Build tool

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd my-paytm
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file (replace with your values)
echo "MONGODB_URI=mongodb+srv://gdeveloper101:dwKudEWLTRLzLI9G@cluster0.jiayfe9.mongodb.net/paytm
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development" > .env

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env

# Start the frontend development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### MongoDB Setup
1. Create a MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get the connection string and update the MONGODB_URI

## 📱 Usage

### 1. Sign Up
- Visit the application
- Create a new account with email and password
- Get an initial random balance (₹1,000 - ₹10,000)

### 2. Dashboard
- View your balance
- See recent transactions
- Quick access to send money

### 3. Send Money
- Search for users by name or email
- Enter amount and description
- Confirm and send

### 4. Transaction History
- View all past transactions
- Search and filter transactions
- Pagination support

### 5. Profile Management
- Update personal information
- Change password
- View account details

## 🏗️ Project Structure

```
my-paytm/
├── backend/
│   ├── routes/
│   │   ├── user.js          # User authentication & profile
│   │   ├── account.js       # Balance & transfers
│   │   └── index.js         # Route aggregation
│   ├── config.js            # Environment configuration
│   ├── db.js               # Database models & connection
│   ├── middleware.js        # Authentication middleware
│   ├── index.js            # Express server setup
│   └── package.json        # Backend dependencies
└── frontend/
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── pages/          # Page components
    │   ├── services/       # API service layer
    │   ├── store/          # State management
    │   └── App.jsx         # Main application
    ├── public/             # Static assets
    └── package.json        # Frontend dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/user/signup` - Create new account
- `POST /api/v1/user/signin` - Login
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update profile

### Account Management
- `GET /api/v1/account/balance` - Get balance
- `POST /api/v1/account/transfer` - Transfer money
- `GET /api/v1/account/statement` - Get recent transactions

### User Operations
- `GET /api/v1/user/search` - Search users
- `GET /api/v1/user/transactions` - Get transaction history

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for hot reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Vite dev server
```

### Building for Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 🧪 Testing

### Manual Testing
1. Create multiple user accounts
2. Test money transfers between accounts
3. Verify transaction history
4. Test error scenarios (insufficient balance, invalid users)

### API Testing with cURL
```bash
# Health check
curl http://localhost:3000/health

# Sign up
curl -X POST http://localhost:3000/api/v1/user/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'

# Get balance (with auth token)
curl -X GET http://localhost:3000/api/v1/account/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection
- Ensure your IP is whitelisted in MongoDB Atlas
- Check connection string format
- Verify network connectivity

#### CORS Issues
- Ensure frontend URL is in CORS configuration
- Check that both servers are running

#### Authentication Issues
- Verify JWT secret is consistent
- Check token expiration
- Ensure Bearer token format

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Ensure MongoDB Atlas is accessible
3. Update CORS origins for production

### Frontend Deployment (Vercel/Netlify)
1. Update VITE_API_URL to production backend
2. Build the project
3. Deploy static files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Tailwind CSS for styling framework
- Heroicons for beautiful icons
- React community for excellent documentation

## 📞 Support

For support, email support@paywallet.com or create an issue in the repository.

---

**Made with ❤️ by PayWallet Team**