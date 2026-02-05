<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Name Bender - AI Domain Generator

Generate brilliant domain names with Google Gemini AI and check availability instantly.

🚀 **Live Demo:** [https://pagustafsson.github.io/NameBender/](https://pagustafsson.github.io/NameBender/)

## Features
- **AI-Powered Suggestions**: Uses Google's Gemini Flash model to brainstorm creative names.
- **Availability Check**: Checks if domains are available (approximate).
- **Secure Deployment**: Runs entirely in the browser with restricted API keys.

## Run Locally

**Prerequisites:**  Node.js

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pagustafsson/NameBender.git
   cd NameBender
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up API Key:**
   - Create a `.env.local` file in the root directory.
   - Add your key: `GEMINI_API_KEY=your_key_here`

4. **Run the app:**
   ```bash
   npm run dev
   ```

## API Key Security for Public Deployment

If you fork this repo or deploy it publicly, **do not commit your `.env.local` file**.
Instead:
1. Go to [Google AI Studio credentials](https://aistudio.google.com/app/apikey).
2. Edit your API Key settings.
3. Under **API restrictions**, select **Websites** and add your domain (e.g., `https://your-username.github.io/*`).
4. This ensures your key cannot be used by others even if it is visible in the frontend code.
