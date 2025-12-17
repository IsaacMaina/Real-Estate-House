# Luxury Kenya Real Estate Platform

A sophisticated real estate platform focusing on luxury properties in Kenya with advanced animations and responsive design.

## Features

### Property Management System
- Showcase luxury properties across Kenya
- Detailed property listings with full-screen imagery
- Interactive property cards with hover animations
- Advanced filtering capabilities
- Responsive design for all devices

### User Roles System

#### 1. Public Users (Visitors)
- View property listings and details
- Search and filter properties by location, price, type, etc.
- View property images and descriptions
- Contact agents through forms
- Access public website content (about, services, contact)
- Subscribe to newsletters
- Save/favorite properties (using localStorage/caching)
- View market insights and property guides
- Access property comparison tools
- Browse all publicly listed properties

#### 2. Registered Users
- ALL Public User capabilities plus:
- Create accounts and manage profiles
- Save/favorite properties to their account
- Personalized property recommendations
- Property comparison tools
- Request property viewing appointments
- Track viewing appointment statuses
- Save property searches/filters
- Set up property alerts for new listings matching criteria
- Contact agents directly
- Submit property inquiries
- Access premium property listings
- Request property valuations
- Add property reviews/ratings
- Download property brochures/pdfs
- Share properties on social media
- Receive personalized notifications
- Access to exclusive member events
- Priority customer support

#### 3. Admin Users
- ALL Public and Registered User capabilities plus:
- Full access to admin panel
- Property management (add/edit/delete properties)
- User management (view, edit, disable users)
- Content management (pages, services, about, etc.)
- Lead management (view, assign, track inquiries)
- Appointment management system
- Analytics dashboard (views, leads, conversions)
- Blog/news management
- Property verification and approval system
- Pricing management
- Feature property promotion
- Report generation and analytics
- System configuration
- Manage featured properties
- Review moderation
- Image gallery management
- Marketing campaign management
- Financial tracking and billing systems

## Technical Implementation

### Technologies Used
- Next.js 14 with App Router
- React Server Components
- TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Icons for UI elements
- Local storage for client-side data persistence

### Key Components
- PropertyGrid: Displays property listings
- PropertyCard: Individual property showcase
- PropertyFilters: Advanced filtering system
- Navigation: Responsive navigation with mobile menu
- FloatingWhatsApp: Direct contact functionality
- PropertyDetailPage: Comprehensive property details

### Animation Features
- Hover effects on property cards
- Smooth transitions between states
- Loading animations
- Scroll-triggered animations
- Micro-interactions

### Kenyan Context
- Property listings in major Kenyan cities (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, etc.)
- Kenyan currency (KSh) and measurements (square meters)
- Local phone number format (+254)
- Kenyan real estate terminology and property types
- Locale-specific metadata (en-KE)

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open http://localhost:3000 in your browser

## Contributing

We welcome contributions to enhance the platform with additional features and improvements.

## License

This project is licensed under the MIT License.