# Smart Inventory Forecasting MVP

An AI-powered inventory management system that helps small and medium retailers optimize their stock levels and reduce stockouts.

## Features

- 🔐 **User Authentication** - Secure signup, login, and password reset flows
- 📱 **Responsive Design** - Mobile-first approach with touch-optimized interfaces
- 🛡️ **Protected Routes** - Middleware-based route protection
- 🎨 **Modern UI** - Built with Tailwind CSS and responsive components

## Tech Stack

- **Frontend**: Next.js 14 with React, TypeScript
- **Styling**: Tailwind CSS with mobile-first responsive design
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-inventory-forecasting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your Supabase credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Next.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase Setup

To get your Supabase credentials:

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy your Project URL and anon/public key
4. Update your `.env.local` file with these values

### Deployment

The application is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel's dashboard
4. Deploy!

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard
│   ├── globals.css        # Global styles with responsive utilities
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Home page with auth redirect
├── components/
│   └── layout/            # Responsive layout components
├── contexts/
│   └── AuthContext.tsx    # Authentication context provider
├── lib/
│   ├── env.ts            # Environment validation
│   └── supabase/         # Supabase client configuration
└── middleware.ts          # Route protection middleware
```

## Authentication Flow

- **Signup**: Create account with email verification
- **Login**: Email/password authentication with redirect support
- **Password Reset**: Email-based password recovery
- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **Session Management**: Persistent sessions across device switches

## Responsive Design

The application uses a mobile-first approach with:

- **Touch-friendly interfaces** (44px minimum touch targets)
- **Safe area support** for mobile devices
- **Responsive breakpoints** (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- **Mobile-optimized forms** (prevents zoom on iOS)
- **Flexible grid layouts** that adapt to screen size

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

The application validates environment variables and provides helpful warnings when Supabase is not configured. This allows for development and testing without requiring immediate Supabase setup.

## Next Steps

This foundation supports the following upcoming features:
- POS system integrations (Square, Clover, CSV)
- Data cleanup and validation
- AI-powered demand forecasting
- Purchase order generation
- Dashboard with actionable recommendations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here]