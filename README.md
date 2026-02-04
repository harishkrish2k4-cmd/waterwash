<<<<<<< HEAD
# AutoCare Pro - Vehicle Service Website

A modern, professional vehicle service website with Firebase authentication, Firestore database, and membership management system.

## 🚀 Features

- **Landing Page**: Professional hero section, services overview, testimonials, and contact information
- **User Authentication**: Firebase email/password authentication with secure registration and login
- **Membership Plans**: Three-tier membership system (Monthly, Half-Yearly, Yearly)
- **Admin Dashboard**: Complete user management system with statistics and analytics
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Beautiful animations, hover effects, and professional styling

## 📁 Project Structure

```
Water/
├── index.html                 # Landing page
├── register.html              # User registration
├── login.html                 # User login
├── memberships.html           # Membership plans
├── admin/
│   ├── login.html            # Admin login
│   └── dashboard.html        # Admin dashboard
├── css/
│   └── styles.css            # Main stylesheet
├── js/
│   ├── firebase-config.js    # Firebase configuration
│   ├── auth.js               # User authentication
│   ├── memberships.js        # Membership management
│   ├── admin-auth.js         # Admin authentication
│   ├── admin-dashboard.js    # Admin dashboard logic
│   └── main.js               # General utilities
├── assets/
│   └── images/               # Images and assets
└── README.md                 # This file
```

## 🔧 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "autocare-pro")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Click "Save"

### Step 3: Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in production mode**
3. Select your preferred location
4. Click "Enable"

### Step 4: Set Up Security Rules

In Firestore Database → **Rules**, replace the default rules with the following. These rules allow anyone to read services and plans, but only authorized admins can edit them.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for services and membership plans
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    match /membershipPlans/{planId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // User rules - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins can read/update all users
      allow read, update: if request.auth != null && 
                            exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Admin rules
    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
      allow write: if false; // Admins must be created manually
    }
  }
}
```

Click "Publish"

### Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### Step 6: Update Configuration File

Open `js/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 7: Create Admin User

1. Go to **Authentication** → **Users** → **Add user**
2. Enter admin email and password
3. Copy the **User UID**
4. Go to **Firestore Database** → **Start collection**
5. Collection ID: `admins`
6. Document ID: Paste the User UID
7. Add fields:
   - `email` (string): admin email
   - `fullName` (string): admin name
   - `role` (string): "admin"
   - `createdAt` (timestamp): current time
8. Click "Save"

## 🌐 Local Development

### Option 1: Using Python

```bash
# Navigate to project directory
cd Water

# Start server (Python 3)
python -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000
```

Visit: `http://localhost:8000`

### Option 2: Using Node.js

```bash
# Install http-server globally
npm install -g http-server

# Navigate to project directory
cd Water

# Start server
http-server -p 8000
```

Visit: `http://localhost:8000`

### Option 3: Using VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## 📝 Customization Guide

### Update Business Information

1. **Business Name & Tagline**: Edit in `index.html` (navbar and hero section)
2. **Contact Information**: Update in `index.html` contact section and footer
3. **Social Media Links**: Edit footer links in all HTML files
4. **Membership Pricing**: Update in `memberships.html` and `js/memberships.js`

### Change Colors

Edit CSS variables in `css/styles.css`:

```css
:root {
  --primary-dark: #1a2332;    /* Main dark color */
  --primary-blue: #2563eb;    /* Primary blue */
  --accent-blue: #3b82f6;     /* Accent blue */
  /* ... other colors */
}
```

### Add/Remove Servicesll'

Edit the services section in `index.html` (around line 200)

### Modify Membership Plans

Edit `js/memberships.js` to change plan features and pricing

## 🎨 Design Features

- **Color Scheme**: Dark blue (#1a2332), Blue (#2563eb), White
- **Typography**: Inter (body), Poppins (headings)
- **Icons**: Font Awesome 6.4.0
- **Animations**: Smooth fade-ins, hover effects, transitions
- **Responsive**: Mobile-first design with breakpoints at 768px and 480px

## 🔐 Admin Dashboard Features

- **User Statistics**: Total users, active members, membership breakdown
- **User Management**: View all registered users
- **Search & Filter**: Search by name/email, filter by membership/status
- **Edit Users**: Update membership plans and account status
- **Export Data**: Download user data as CSV

### Admin Access

URL: `/admin/login.html`

Default credentials: Use the admin account you created in Firebase

## 🚀 Deployment

### Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# Select your Firebase project
# Set public directory to: .
# Configure as single-page app: No
# Set up automatic builds: No

# Deploy
firebase deploy
```

### Netlify

1. Create account on [Netlify](https://www.netlify.com/)
2. Drag and drop the `Water` folder
3. Site will be live instantly

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 📱 Pages Overview

### Public Pages

- **index.html**: Landing page with all business information
- **register.html**: New user registration
- **login.html**: User login
- **memberships.html**: Membership plans and subscription

### Admin Pages

- **admin/login.html**: Admin authentication
- **admin/dashboard.html**: User management dashboard

## 🔒 Security Notes

1. **Firebase Security Rules**: Properly configured to protect user data
2. **Admin Verification**: Admin routes check for admin privileges
3. **Input Validation**: All forms have client-side validation
4. **Password Requirements**: Minimum 6 characters (configurable)
5. **Protected Routes**: Unauthorized users are redirected

## 🐛 Troubleshooting

### Firebase Connection Issues

- Verify `firebase-config.js` has correct credentials
- Check browser console for errors
- Ensure Firebase project is active

### Authentication Not Working

- Verify Email/Password is enabled in Firebase Console
- Check security rules are published
- Clear browser cache and cookies

### Admin Access Denied

- Verify admin document exists in Firestore `admins` collection
- Check User UID matches document ID
- Ensure user is authenticated

## 📞 Support

For issues or questions:
- Email: info@autocarepro.com
- Phone: +1 (555) 123-4567

## 📄 License

This project is created for AutoCare Pro. All rights reserved.

## 🎯 Future Enhancements

- Payment gateway integration
- Email notifications
- SMS alerts
- Mobile app
- Appointment booking system
- Service history tracking
- Customer reviews and ratings

---

**Built with ❤️ for AutoCare Pro**
#   W a t e r w a s h 
 
 
=======
# waterwash
>>>>>>> 737c8d10ef2e9f28beaf57f5c37d8e1bb933cfac
