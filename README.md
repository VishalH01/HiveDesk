# HiveDesk - Full-Stack Note-Taking Application

A complete note-taking application with email-based OTP verification, built with React (Frontend) and Node.js/Express (Backend) with MongoDB integration.

## 🚀 Features

### Frontend
- ✅ **Sign Up Page** with name, birthday, email, and OTP verification
- ✅ **Sign In Page** with email, OTP, and "Keep me logged in" option
- ✅ **Note Dashboard** with full CRUD operations for notes
- ✅ **Category Management** with color-coded categories and edit/delete functionality
- ✅ **Drag & Drop** notes between categories with visual feedback
- ✅ **Grid Layout Toggle** - choose between 2, 3, or 4 column layouts
- ✅ **Search & Filter** notes by title, content, tags, and categories
- ✅ **Pin Notes** for important content with persistent pin icons
- ✅ **Tag System** for organizing notes
- ✅ **Responsive Design** with Tailwind CSS
- ✅ **JWT Token Management** for authentication
- ✅ **Toast Notifications** for user feedback
- ✅ **Collapsible Categories** on mobile view
- ✅ **Modern UI** with hover effects and smooth animations

### Backend
- ✅ **MongoDB Integration** with Mongoose ODM
- ✅ **Email-based OTP** verification using Nodemailer
- ✅ **JWT Authentication** with configurable expiry
- ✅ **Input Validation** using Joi
- ✅ **Security Middleware** (Helmet, Rate Limiting, CORS)
- ✅ **User, Note, and Category Models** with comprehensive validation
- ✅ **RESTful API** endpoints for notes and categories
- ✅ **Text Search** with MongoDB text indexes
- ✅ **Category Statistics** and note counting

## 📁 Project Structure

```
HiveDesk/
├── client/                 # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── component/     # React components
│   │   │   ├── SignIn.tsx
│   │   │   └── SignUp.tsx
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   └── Home.tsx
│   │   ├── services/      # API services
│   │   │   ├── apiService.ts
│   │   │   └── otpService.ts
│   │   ├── assets/        # Images and static files
│   │   │   ├── logo.png
│   │   │   └── signup-visual.png
│   │   └── ...
│   └── package.json
├── server/                 # Backend (Node.js + Express)
│   ├── controllers/       # Route controllers
│   │   ├── authController.js
│   │   ├── noteController.js
│   │   └── categoryController.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── notes.js
│   │   └── categories.js
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── Note.js
│   │   └── Category.js
│   ├── middleware/       # Middleware functions
│   │   ├── auth.js
│   │   └── validation.js
│   ├── utils/            # Utility functions
│   │   ├── emailService.js
│   │   ├── jwtService.js
│   │   └── validationMiddleware.js
│   ├── config/           # Configuration files
│   │   └── database.js
│   ├── app.js           # Main server file
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Email service (Gmail, SendGrid, etc.)

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (copy from env.example)
cp env.example .env

# Edit .env file with your configuration
```

#### Environment Variables (.env)
```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/hivedesk

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

#### Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: Google Account → Security → App Passwords
3. Use the App Password in EMAIL_PASS

### 2. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Start the Application

```bash
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend
cd client
npm run dev
```

## 🔧 API Endpoints

### Authentication Routes
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/signout` - User logout (protected)

### Notes Routes
- `GET /api/notes` - Get all notes for user (protected)
- `GET /api/notes/:id` - Get single note (protected)
- `POST /api/notes` - Create new note (protected)
- `PUT /api/notes/:id` - Update note (protected)
- `DELETE /api/notes/:id` - Delete note (protected)
- `GET /api/notes/search?q=query` - Search notes (protected)

### Categories Routes
- `GET /api/categories` - Get all categories for user (protected)
- `GET /api/categories/:id` - Get single category (protected)
- `POST /api/categories` - Create new category (protected)
- `PUT /api/categories/:id` - Update category (protected)
- `DELETE /api/categories/:id` - Delete category (protected)
- `GET /api/categories/stats` - Get category statistics (protected)

### Health Check
- `GET /health` - Server health check

## 📝 Note-Taking Features

### Note Management
- **Create Notes**: Rich text notes with title, content, and tags
- **Edit Notes**: Update note content, category, and tags
- **Delete Notes**: Remove notes with confirmation
- **Pin Notes**: Pin important notes to the top with persistent pin icons
- **Search Notes**: Search by title, content, or tags
- **Filter by Category**: View notes by specific categories
- **Drag & Drop**: Move notes between categories with visual feedback

### Category System
- **Color-coded Categories**: Each category has a unique color
- **Default Categories**: New users get 5 default categories
- **Custom Categories**: Create unlimited custom categories
- **Category Management**: Edit and delete categories with hover buttons
- **Category Statistics**: View note counts per category
- **Category Drop Zones**: Visual areas for dropping notes

### Organization Features
- **Tags**: Add multiple tags to notes for better organization
- **Pinned Notes**: Important notes stay at the top with visible pin icons
- **Date Tracking**: Automatic creation and update timestamps
- **Responsive Grid**: Notes display in responsive card layouts
- **Grid Layout Toggle**: Choose between 2, 3, or 4 column layouts
- **Collapsible Categories**: Mobile-friendly category management

### User Interface Enhancements
- **Modern Design**: Clean, professional interface with smooth animations
- **Hover Effects**: Interactive elements with hover states
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Mobile Responsive**: Optimized for all screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🔐 Authentication Flow

### Sign Up Process
1. User fills out form (name, birthday, email)
2. System sends OTP to email
3. User enters OTP for verification
4. On successful verification, account is created with default categories
5. User is redirected to Dashboard

### Sign In Process
1. User enters email
2. System sends OTP to email
3. User enters OTP for verification
4. On successful verification, JWT token is generated
5. User is redirected to Dashboard

### Token Management
- JWT tokens are stored in localStorage
- "Keep me logged in" extends token expiry to 30 days
- Tokens are automatically validated on protected routes
- Invalid tokens trigger automatic logout

## 🛡️ Security Features

- **Input Validation**: Server-side validation using Joi
- **Rate Limiting**: Prevents abuse with express-rate-limit
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers for Express
- **JWT Security**: Secure token generation and validation
- **Email Verification**: OTP-based email verification
- **User Isolation**: Users can only access their own notes and categories

## 📱 User Interface

- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success and error feedback using react-hot-toast
- **Modal Dialogs**: Clean forms for creating/editing notes and categories
- **Search & Filter**: Real-time search and category filtering
- **Card Layout**: Beautiful note cards with hover effects
- **Drag & Drop**: Intuitive note organization
- **Grid Layout Toggle**: Customizable note display
- **Collapsible Categories**: Mobile-optimized category management

## 🧪 Testing the System

1. **Start both servers** (backend on port 5000, frontend on port 5173)
2. **Visit** `http://localhost:5173`
3. **Test Sign Up**:
   - Fill form with valid data
   - Check email for OTP (or check server console)
   - Complete registration
4. **Test Sign In**:
   - Use registered email
   - Enter OTP from email
   - Check "Keep me logged in" option
5. **Test Note-Taking Features**:
   - Create new categories
   - Create notes with different categories
   - Pin important notes
   - Search and filter notes
   - Edit and delete notes
   - Test drag & drop functionality
   - Try different grid layouts (2, 3, 4 columns)
   - Test category management (edit/delete)

## 🔧 Customization

### Email Templates
Edit `server/utils/emailService.js` to customize email templates.

### Validation Rules
Modify `server/middleware/validation.js` for custom validation.

### UI Styling
Update Tailwind classes in React components for custom styling.

### Default Categories
Edit the `createDefaultCategories` function in `server/controllers/authController.js` to change default categories for new users.

### Toast Notifications
Customize toast messages in `client/src/pages/Home.tsx` and other components.

## 🚨 Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check email credentials in .env
   - Verify app password for Gmail
   - Check firewall/antivirus settings

2. **MongoDB connection failed**:
   - Ensure MongoDB is running
   - Check MONGO_URI in .env
   - Verify network connectivity

3. **CORS errors**:
   - Check CORS_ORIGIN in .env
   - Ensure frontend URL matches

4. **JWT errors**:
   - Verify JWT_SECRET in .env
   - Check token expiry settings

5. **Drag & Drop not working**:
   - Ensure JavaScript is enabled
   - Check browser compatibility
   - Verify API endpoints are accessible

### Debug Mode
Set `NODE_ENV=development` in .env for detailed error messages.

## 📄 License

This project is for educational purposes. Feel free to use and modify as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 👨‍💻 Developer

**Vishal Haramkar** - Full Stack Developer

---

**Happy Coding! 🎉** 