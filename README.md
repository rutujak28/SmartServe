# SmartServe - Smart Canteen Ordering PWA

SmartServe is a comprehensive Progressive Web App (PWA) designed to revolutionize the dining experience in educational institutions and cafeterias. Order food seamlessly with QR code scanning and contactless payment.

## 🚀 Key Features

- **QR Code Ordering**: Scan table codes to start ordering instantly
- **Digital Menu**: Browse categorized food with images and search
- **Smart Cart**: Real-time price calculation with easy modifications
- **Bill Splitting**: Split bills equally or custom among multiple people
- **AI Chatbot**: Get food recommendations and ordering assistance
- **Real-time Tracking**: Live order status updates from kitchen
- **Order History**: View past orders and reorder favorites
- **Wishlist**: Save favorite items for quick access
- **PWA Features**: Installable, offline-capable, fast loading

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS with custom design system
- Radix UI + shadcn/ui components
- React Router v6
- React Hook Form + Zod validation

### Backend  
- Supabase (PostgreSQL, Auth, Real-time, Storage)
- Lovable AI (Google Gemini 2.5 Flash)
- Row Level Security (RLS) policies
- Deno Edge Functions

### Integrations
- Razorpay (ready for payment integration)
- QR Code generation and scanning
- Service workers for offline support

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
smartserve/
├── public/           # Static assets (icons, manifest, service worker)
├── src/
│   ├── components/  # React components
│   ├── contexts/    # React contexts (Auth, Cart, Theme)
│   ├── hooks/       # Custom hooks
│   ├── lib/         # Utilities (validation, image optimization)
│   ├── pages/       # Page components
│   └── App.tsx      # Main app component
├── supabase/
│   ├── functions/   # Edge functions (AI chat)
│   └── migrations/  # Database migrations
└── package.json
```

## 🔒 Security Features

- **Authentication**: Secure email/password with Supabase Auth
- **RLS Policies**: Row Level Security on all database tables
- **Input Validation**: Zod schemas for all user inputs
- **Sanitization**: XSS prevention and input sanitization
- **Rate Limiting**: Client-side rate limiting utilities
- **Secure Functions**: Security definer functions to prevent RLS recursion

## 📱 PWA Capabilities

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Service worker caching for menu browsing
- **Fast Loading**: Code splitting and lazy loading
- **Optimized Images**: Progressive loading and responsive images
- **App-like Experience**: Standalone display mode

## 🎨 Design System

### Colors
- Primary: Deep Orange (#FF6B35)
- Secondary: Warm Gray (#F5F5F5)  
- Accent: Fresh Green (#4CAF50)

### Typography
- Headings: Poppins (400, 500, 600, 700)
- Body: Inter (300, 400, 500, 600)

All design tokens are defined in `src/index.css` using CSS custom properties.

## 📊 Database Schema

### Main Tables
- `profiles` - User profile information
- `user_roles` - Role assignments (customer, staff, admin)
- `categories` - Food categories
- `food_items` - Menu items with details
- `tables` - Restaurant tables
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment records
- `wishlists` - User saved items
- `reviews` - Food item reviews

## 🎯 Implementation Progress

### ✅ Completed Phases
- Phase 1-5: Complete frontend implementation
- Phase 6: Database schema with RLS policies
- Phase 7 (Partial): AI chatbot integration
- Phase 8: Security hardening, PWA optimization, documentation

### 🚧 Pending Features
- Razorpay payment integration
- Real-time order tracking with kitchen display
- Push notifications for order updates
- Email/SMS notifications

## 🔧 Configuration

### Environment Variables
The project uses Supabase. Configuration is in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### Supabase Setup
Database migrations are in `supabase/migrations/`. Apply them through the Supabase dashboard or CLI.

## 🚀 Deployment

This project is deployed using Lovable:

1. Open [Lovable Project](https://lovable.dev/projects/9a150f1f-326d-4ef8-b861-82265dd9ea10)
2. Click Share → Publish
3. Your app will be deployed instantly

For custom domain setup, go to Project > Settings > Domains.

## 📖 Documentation

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)

## 🤝 Development

### Using Lovable
Visit the [Lovable Project](https://lovable.dev/projects/9a150f1f-326d-4ef8-b861-82265dd9ea10) and start prompting.

### Using Local IDE
```bash
# Clone repository
git clone <YOUR_GIT_URL>

# Install dependencies
npm install

# Start development
npm run dev
```

### Using GitHub Codespaces
- Click "Code" → "Codespaces" → "New codespace"
- Edit directly in the browser
- Changes sync automatically

## 📄 License

This project is private and proprietary.

## 💬 Support

For support or questions, contact the development team or open an issue in the repository.

---

**Built with ❤️ using Lovable, Supabase, and React**
