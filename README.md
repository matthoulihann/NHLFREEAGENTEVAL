# NHL Free Agent Evaluation

A web application for analyzing and comparing projected contracts for NHL free agents.

## Features

- View a list of NHL free agents with projected contract values
- Detailed player pages with stats and performance metrics
- Compare multiple players side-by-side
- Visualize player performance with interactive charts
- Evaluate contract value based on performance metrics

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MySQL (hosted on Railway)
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL database

### Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`
DATABASE_URL=mysql://username:password@host:port/database
ADMIN_API_KEY=your-secure-api-key
\`\`\`

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses two main tables:

1. `projected_contracts` - Contains projected contract information for free agents
2. `stats` - Contains player statistics and performance metrics

## API Routes

- `/api/test-db` - Test database connection
- `/api/admin/debug` - Debug information (requires API key)

## Deployment

The application is deployed on Vercel. To deploy your own instance:

1. Fork this repository
2. Connect to Vercel
3. Set up the required environment variables
4. Deploy

## License

MIT
