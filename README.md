# Kindred Flow

A modern remittance platform enabling category-based money transfers with real-time payment tracking and M-Pesa integration.

## The Problem

Traditional remittance services lack transparency and control. Senders have no visibility into how their money is spent, and recipients face delays in accessing funds. The process is often opaque, with limited tracking and no way to ensure funds are used for their intended purposes.

## The Solution

Kindred Flow solves these challenges by introducing:

- **Category-Based Escrow**: Senders allocate funds to specific categories (e.g., food, rent, education, healthcare)
- **Real-Time Transparency**: Both parties can track spending and balances in real-time
- **Controlled Disbursement**: Recipients request payments against specific categories with daily limits
- **Instant Settlement**: M-Pesa integration enables fast on-ramp (funding) and off-ramp (disbursement)
- **Blockchain Backend**: Secure, transparent transactions powered by blockchain technology

## User Flow

### Sender Flow
1. **Authentication**: Sign in using Privy authentication
2. **Create Remittance**: 
   - Enter recipient phone number and name
   - Allocate amounts to categories (food, rent, education, healthcare, utilities, transport, other)
   - Set daily spending limits per category
   - Review and confirm total amount
3. **Fund Escrow**: Complete M-Pesa STK push payment to fund the escrow
4. **Monitor**: Track recipient's spending in real-time via dashboard
5. **View History**: Access complete transaction history and remittance details

### Recipient Flow
1. **Authentication**: Log in with phone number via OTP verification
2. **View Dashboard**: See available balances per category and daily spending limits
3. **Request Payment**: 
   - Select category (e.g., food, rent)
   - Enter amount within available balance and daily limit
   - Add optional note/description
   - Submit payment request
4. **Track Status**: Monitor payment progress through multiple stages:
   - Pending approval
   - On-chain processing
   - Off-ramp initiated
   - M-Pesa confirmation received
5. **Receive Funds**: Get instant M-Pesa payment notification
6. **View History**: Access all past payment requests and transactions

### Payment Lifecycle
```
Create Request → Blockchain Processing → Off-Ramp Initiated → M-Pesa Sent → Completed
```

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn-ui, Radix UI, Tailwind CSS
- **Authentication**: Privy (Web3 authentication)
- **State Management**: TanStack React Query
- **API Integration**: Supabase, KayaSend API
- **Payment Gateway**: M-Pesa (Kenya)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Form Handling**: React Hook Form, Zod validation

## Getting Started

### Prerequisites
- Node.js (v18 or higher) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm or yarn package manager

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd kindred-flow

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_API_BASE_URL=your_api_base_url
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development environment
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
│   ├── sender/     # Sender-related pages
│   └── recipient/  # Recipient-related pages
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and helpers
├── services/       # API service layer
├── types/          # TypeScript type definitions
└── integrations/   # Third-party integrations
```

## Deployment

This project can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repository and deploy automatically
- **Netlify**: Import project from Git and deploy
- **GitHub Pages**: Use GitHub Actions for automated deployment

## License

This project is private and proprietary.
