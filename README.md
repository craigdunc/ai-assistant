# TripKit — AI-Assisted Travel Catalogue

A premium, AI-powered e-commerce storefront for travel gear.

## Features
- **AI Travel Gear Assistant**: Context-aware advisor that helps you find the right gear for your trip.
- **Dynamic Categorization**: Smart keyword-based product sorting.
- **Modern UI**: Polished, responsive design with glassmorphism and smooth animations.

## Deployment

### Option 1: Vercel (Recommended)
Vercel supports the AI Assistant automatically.
1. Push this code to a GitHub repository.
2. Import the project into [Vercel](https://vercel.com).
3. Add your `GEMINI_API_KEY` to the Environment Variables in the Vercel dashboard.

### Option 2: GitHub Pages (Static)
**Note**: The AI Assistant will not work on GitHub Pages as it requires a server-side backend.
1. The app is already configured for static export in `next.config.mjs`.
2. Run `npm run build`.
3. Push the contents of the `out/` directory to the `gh-pages` branch.

## Local Development
1. Install dependencies: `npm install`
2. Set up `.env.local` with `GEMINI_API_KEY`.
3. Run the dev server: `npm run dev`
