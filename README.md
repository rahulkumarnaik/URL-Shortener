# LinkShortener - Professional URL Shortener

A modern, responsive URL shortener built with Next.js, Firebase, and styled with Tailwind CSS. Features a beautiful dark theme, smooth animations, and full authentication system.

## 🚀 Features

- **Modern Dark Theme** - Professional glass-morphism design
- **Responsive Design** - Works perfectly on all devices
- **Smooth Animations** - Enhanced user experience with CSS animations
- **User Authentication** - Email/Password and Google OAuth
- **Real-time Updates** - Live dashboard with click tracking
- **Copy to Clipboard** - Easy sharing functionality
- **URL Validation** - Automatic protocol handling

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Firebase (Firestore, Authentication)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS with custom animations

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/url-shortener)

## 📋 Setup Instructions

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Authentication (Email/Password and Google)
5. Get your config values from Project Settings

### 2. Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration values
3. For Vercel deployment, add these in your Vercel dashboard

### 3. Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🔧 Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🎨 Design Features

- **Glass-morphism UI** with backdrop blur effects
- **Gradient backgrounds** and buttons
- **Hover animations** with scale transforms
- **Loading states** and spinners
- **Responsive tables** for mobile devices
- **Custom scrollbars** for dark theme

## 📱 Pages

- **Landing** - Automatic routing based on auth state
- **Login** - Beautiful sign-in with Google OAuth
- **Register** - Account creation
- **Dashboard** - Link management with analytics
- **[shortCode]** - Dynamic URL redirection

---

**Built with ❤️ using Next.js and Firebase**
