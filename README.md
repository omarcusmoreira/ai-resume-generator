# MeContrata.AI - AI-Powered Resume Generator

## 🎯 Project Overview

**MeContrata.AI** is an AI-powered SaaS platform that helps professionals create optimized resumes, cover letters, and LinkedIn profiles. The application leverages OpenAI's GPT models to generate tailored content based on job descriptions and user profiles, with a focus on ATS (Applicant Tracking System) optimization.

## 🚀 Live Demo

[_[MeContrata-ai]_](https://mecontrata-ai.vercel.app/)

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Shadcn/UI** - Modern UI component library
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling with validation
- **TipTap** - Rich text editor
- **React PDF** - PDF generation and manipulation

### Backend & Services

- **Firebase** - Authentication and Firestore database
- **OpenAI API** - GPT-4 integration for content generation
- **Stripe** - Payment processing and subscription management
- **Next.js API Routes** - Serverless backend functions

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **PWA Support** - Progressive Web App capabilities

## 🏗️ Architecture

The application follows a modern, scalable architecture pattern:

```
├── app/                          # Next.js App Router pages
│   ├── api/                     # API routes (Stripe, webhooks)
│   ├── resume-generate/         # Main resume generation interface
│   ├── resume-editor/           # Resume editing functionality
│   ├── job-tracker/            # Job application tracking
│   └── subscription/           # Subscription management
├── components/                  # Reusable UI components
├── stores/                     # Zustand state management
├── services/                   # External service integrations
├── types/                     # TypeScript type definitions
├── aiPrompts/                # AI prompt templates
└── utils/                    # Utility functions
```

## 🎨 Key Features

### Core Functionality

- **AI Resume Generation**: Creates tailored resumes using GPT-4
- **Job Description Matching**: Optimizes resumes for specific job postings
- **ATS Optimization**: Ensures resumes pass Applicant Tracking Systems
- **Cover Letter Generation**: AI-powered cover letter creation
- **LinkedIn Bio Generator**: Professional LinkedIn profile optimization
- **Profile Management**: Multiple professional profiles support
- **PDF Export**: High-quality PDF generation

### User Experience

- **Responsive Design**: Mobile-first responsive interface
- **Progressive Web App**: Installable PWA with offline capabilities
- **Real-time Preview**: Live preview of generated content
- **Quota Management**: Usage tracking and subscription limits
- **Authentication**: Secure Firebase authentication

### Business Features

- **Subscription Model**: Stripe-powered recurring billing
- **Usage Quotas**: Tiered feature access
- **Payment Processing**: Secure payment handling
- **Customer Management**: Integrated customer lifecycle

## 🔧 Code Quality & Best Practices

### Architecture Patterns

- **Component-Based Architecture**: Modular, reusable components
- **Single Responsibility Principle**: Each component has one clear purpose
- **Custom Hooks**: Reusable logic abstraction
- **Service Layer Pattern**: Clean separation of concerns
- **Type Safety**: Comprehensive TypeScript usage

### State Management

- **Zustand Stores**: Lightweight, scalable state management
- **Separate Concerns**: Domain-specific stores (auth, profile, quota, etc.)
- **Persistence**: Local storage integration for user preferences

### Code Organization

- **Clean Code Principles**: Readable, maintainable codebase
- **Consistent Naming**: Clear, descriptive variable and function names
- **Component Composition**: Flexible, reusable component design
- **Error Handling**: Comprehensive error boundaries and validation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Firebase project setup
- OpenAI API key
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd ai-resume-generator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure your API keys and Firebase config

# Run development server
npm run dev
```

### Environment Variables

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## 📊 Performance & Optimization

- **Next.js App Router**: Server-side rendering and static generation
- **Image Optimization**: Next.js built-in image optimization
- **Font Optimization**: Automatic font loading optimization
- **Code Splitting**: Automatic code splitting for optimal bundle sizes
- **PWA**: Service worker for offline functionality

## 🔐 Security

- **Authentication**: Firebase Authentication integration
- **API Security**: Protected API routes with authentication
- **Environment Variables**: Secure configuration management
- **Input Validation**: Comprehensive form validation
- **XSS Protection**: Sanitized user inputs

## 🧪 Testing & Quality Assurance

- **TypeScript**: Compile-time error detection
- **ESLint**: Code quality and consistency enforcement
- **Component Testing**: Modular component testing approach
- **Error Boundaries**: Graceful error handling

## 📈 Scalability Considerations

- **Serverless Architecture**: Auto-scaling API routes
- **Database Optimization**: Efficient Firestore queries
- **Caching Strategy**: Optimized data fetching
- **Component Reusability**: Scalable component architecture

## 🚀 Deployment

The application is optimized for deployment on:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Firebase Hosting**

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 👨‍💻 Developer Experience

### Code Standards

- **Consistent Formatting**: Automated code formatting
- **Clear Documentation**: Comprehensive inline documentation
- **Component Abstraction**: Never exceeding 200 lines per component
- **Modular Design**: Single responsibility components

### Development Workflow

- **Hot Reloading**: Fast development iteration
- **Type Checking**: Real-time TypeScript error detection
- **Linting**: Automated code quality checks

## 📚 Project Structure Details

### Components Philosophy

Following the project rule of never creating components with more than 200 lines, the codebase maintains:

- **High Modularity**: Complex features broken into smaller components
- **Reusability**: Shared components across different features
- **Maintainability**: Easy to understand and modify components

### Service Layer

- **OpenAI Integration**: Sophisticated prompt engineering
- **Firebase Services**: Optimized database operations
- **Stripe Integration**: Secure payment processing
- **Error Handling**: Comprehensive error management

## 🎓 Technical Skills Demonstrated

- **Full-Stack Development**: Complete application development
- **API Integration**: Multiple third-party service integrations
- **State Management**: Complex application state handling
- **UI/UX Design**: Modern, responsive user interface
- **Payment Processing**: E-commerce functionality
- **Authentication**: Secure user management
- **AI Integration**: Advanced AI prompt engineering
- **Performance Optimization**: Production-ready optimization
- **TypeScript**: Advanced type system usage
- **Modern React Patterns**: Hooks, context, and modern patterns

---

## 📞 Contact

**Developer**: Marcus Moreira  
**Project**: AI Resume Generator Platform  
**Focus**: Full-Stack Development, AI Integration, SaaS Architecture

---

_This project demonstrates proficiency in modern web development technologies, AI integration, payment processing, and scalable SaaS architecture development._
