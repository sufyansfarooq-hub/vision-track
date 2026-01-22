# Vision Board Scanner

An AI-powered vision board scanning app that extracts and categorizes goals from vision board images using OpenAI's GPT-4o Vision API.

## Features

- 📸 Upload vision board images
- 🤖 AI-powered goal extraction using GPT-4o Vision API
- 🎯 Extracts 3-10 goals with titles, descriptions, and categories
- 🎨 Beautiful blue/white gradient UI with Tailwind CSS
- 📱 Responsive design
- ⚡ Real-time loading states
- 🏷️ Color-coded category badges

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your OpenAI API key:**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```

   Then add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   Get your API key from: https://platform.openai.com/api-keys

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Click "Choose Vision Board Image" to upload an image of your vision board
2. Click "Scan Vision Board" to analyze the image
3. Wait for the AI to extract your goals (usually takes 5-15 seconds)
4. View your extracted goals displayed in beautiful cards with categories

## Categories

Goals are automatically categorized into:
- 💼 Career
- 🏃 Health
- 💕 Relationships
- 💰 Finance
- 🌟 Personal
- ✈️ Travel
- 📚 Education
- 🎨 Lifestyle

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** OpenAI GPT-4o Vision API
- **Image Handling:** Next.js Image component

## Project Structure

```
vision-track/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # OpenAI Vision API endpoint
│   ├── page.tsx                   # Main upload and display page
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── .env.local                     # Environment variables (create this)
└── next.config.ts                 # Next.js configuration
```

## How It Works

1. User uploads a vision board image through the web interface
2. Image is converted to base64 and sent to the API route
3. API route sends the image to OpenAI's GPT-4o Vision API with a detailed prompt
4. GPT-4o analyzes the image and extracts goals in JSON format
5. Goals are displayed in a responsive card grid with categories and descriptions

## License

MIT
