# User Roles System Guide

## Overview
This real estate application has three distinct user roles with varying levels of access and capabilities:
1. **Public Users (Visitors)**
2. **Registered Users**
3. **Admin Users**

### 1. Public Users (Visitors)
Public users can access the website without logging in. Their capabilities include:
- Browse property listings and details
- Search and filter properties by location, price, type, etc.
- View property images, descriptions, and features
- Contact agents through forms
- Access public website content (about, services, contact)
- Subscribe to newsletters
- Save/favorite properties (using localStorage - temporary, lost on browser clearing)
- View market insights and property guides
- Browse all publicly listed properties

### 2. Registered Users
Registered users have accounts and can log in to access enhanced features. Their capabilities include:
- ALL Public User capabilities plus:
- Create accounts and manage profiles
- Save/favorite properties (persisted in database)
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

### 3. Admin Users
Admin users have full administrative access to manage the platform. Their capabilities include:
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
- Report generation
- System configuration
- Manage featured properties
- Review moderation
- Image gallery management
- Marketing campaign management
- Financial tracking and billing systems

## Implementation Notes

### Authentication Flow
- Public users can browse without authentication
- Registration form collects user details and creates account
- Login form validates credentials and creates session
- Admin access requires special admin credentials

### Data Persistence
- Public user favorites stored in localStorage (browser-based)
- Registered user favorites stored in database
- All property data stored in database
- User preferences and saved searches stored in database

### Security
- Role-based access controls
- Protected routes and components
- Secure admin panel access
- Input validation and sanitization

This structure ensures appropriate access levels for each user type while providing an excellent experience for property seekers and administrators alike.