# 💧 IV Drip Rate Calculator

A high-performance Progressive Web App (PWA) designed for healthcare professionals to calculate IV drip rates with precision metronome assistance.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38bdf8?style=flat&logo=tailwind-css)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=flat)

## 🎯 Features

### Core Functionality
- **Precise Drip Rate Calculation**: Calculate drops per minute (gtt/min) and seconds per drop using the formula:
  ```
  (Total Volume [mL] × Drop Factor [drops/mL]) / Total Time [minutes]
  ```
- **Drop Factor Toggle**: Quick switch between 20 and 60 drops/mL factors
- **Flexible Duration Input**: Separate hours and minutes inputs for precise timing

### Advanced Features
- **🎵 High-Precision Drip Metronome**
  - Visual and audio pulse synchronized to calculated drop interval
  - Uses Web Audio API for sub-millisecond timing accuracy
  - RequestAnimationFrame-based scheduler for consistent beat intervals
  - Toggle sound on/off while maintaining visual pulse
  - Real-time BPM display

- **⚠️ Medical Disclaimer Modal**
  - Mandatory acknowledgment on first use
  - Stored in localStorage to prevent repeated displays
  - Clear professional responsibility messaging

- **📱 Progressive Web App (PWA)**
  - Installable on iOS and Android devices
  - Offline support with service worker
  - Native app-like experience
  - Add to home screen functionality

- **🎨 Professional UI/UX**
  - Medical-themed design with trustworthy blue color scheme
  - Large, touch-friendly input fields optimized for mobile use
  - Responsive design (mobile-first approach)
  - Smooth animations and transitions
  - Accessible and WCAG compliant

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

1. **Clone or extract the project**
   ```bash
   cd drip-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables (optional)**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Generate PWA icons** (see [Icon Generation](#icon-generation) section)

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The app should load with the disclaimer modal

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🎨 Icon Generation

The app requires PWA icons in multiple sizes. Choose one of these methods:

### Method 1: Online Tool (Easiest)
1. Visit [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
2. Upload a 512×512px icon (PNG or SVG)
3. Download the generated icon set
4. Extract all icons to `/public` directory

### Method 2: Using Sharp (For Developers)
1. Install Sharp: `npm install sharp --save-dev`
2. Place your source icon (512×512px) as `/public/icon-source.png`
3. Create a script to generate all sizes:
   ```javascript
   // scripts/generate-icons-sharp.js
   const sharp = require('sharp');
   const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

   sizes.forEach(size => {
     sharp('public/icon-source.png')
       .resize(size, size)
       .toFile(`public/icon-${size}.png`);
   });
   ```
4. Run: `node scripts/generate-icons-sharp.js`

### Method 3: Manual Design
Export your icon design at these sizes:
- 72×72, 96×96, 128×128, 144×144, 152×152
- 192×192, 384×384, 512×512

Save them as: `icon-{size}.png` in `/public`

## 📦 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow prompts** to link your project

### Other Platforms

#### Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Install Netlify Next.js plugin

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t drip-calculator .
docker run -p 3000:3000 drip-calculator
```

## 🧪 Testing the PWA

### On Desktop (Chrome/Edge)
1. Open DevTools (F12)
2. Go to Application tab → Manifest
3. Check "Service Workers" are registered
4. Click "Add to Home Screen" in address bar

### On iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app installs as a standalone app

### On Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Install app" or "Add to Home Screen"
4. The app installs as a PWA

## 📐 Calculation Formula

The drip rate calculation follows standard medical protocols:

**Formula:**
```
Drops per minute = (Volume [mL] × Drop Factor) / Time [minutes]
```

**Example:**
- Volume: 1000 mL
- Duration: 8 hours (480 minutes)
- Drop Factor: 20 drops/mL

**Calculation:**
```
(1000 × 20) / 480 = 41.67 drops/minute ≈ 42 gtt/min
Seconds per drop = 60 / 42 ≈ 1.43 seconds
```

## 🎵 Metronome Technical Details

### Timing Precision
- **Scheduler**: `requestAnimationFrame` with look-ahead scheduling
- **Audio**: Web Audio API with precise oscillator timing
- **Accuracy**: Sub-millisecond precision (<5ms deviation)
- **Visual Sync**: CSS animations triggered in sync with audio

### Audio Configuration
- Frequency: 800 Hz (crisp, medical-device-like tone)
- Duration: 100ms per beep
- Attack: 10ms
- Decay: 90ms
- Volume: 30% (adjustable via system volume)

## 🏗️ Project Structure

```
drip-calculator/
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── icon-*.png           # PWA icons (multiple sizes)
│   └── robots.txt           # SEO robots file
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with metadata
│   │   ├── page.tsx         # Home page
│   │   ├── offline/         # Offline fallback page
│   │   └── globals.css      # Global styles
│   └── components/
│       ├── Calculator.tsx    # Main calculator component
│       ├── Metronome.tsx     # Drip metronome component
│       └── DisclaimerModal.tsx # Disclaimer modal
├── scripts/
│   └── generate-icons.js    # Icon generation helper
├── next.config.js           # Next.js + PWA config
├── tailwind.config.ts       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

## 🎨 Customization

### Branding
Update these files to customize branding:

1. **Colors** (`tailwind.config.ts`):
   ```typescript
   colors: {
     primary: {
       DEFAULT: '#2563eb', // Change to your brand color
       // ... other shades
     }
   }
   ```

2. **Footer** (`src/components/Calculator.tsx`):
   ```tsx
   <a href="https://your-recruitment-page.com">
     R.Y. Group
   </a>
   ```

3. **Metadata** (`src/app/layout.tsx`):
   ```typescript
   export const metadata: Metadata = {
     title: 'Your App Name',
     description: 'Your description',
     // ...
   }
   ```

### Features
- **Drop Factors**: Modify `dropFactor` state in `Calculator.tsx`
- **Metronome Sound**: Adjust oscillator frequency in `Metronome.tsx`
- **Disclaimer Text**: Edit content in `DisclaimerModal.tsx`

## 🔒 Safety & Compliance

### Medical Disclaimer
This application includes a mandatory disclaimer that:
- Appears on first use
- Requires explicit user acknowledgment
- States that final verification must be done by qualified professionals
- Clarifies that the tool is for support, not replacement of clinical judgment

### Data Privacy
- **No data collection**: The app stores only disclaimer acceptance status locally
- **No tracking**: No analytics or user tracking by default
- **Offline-first**: Works without internet connection after initial load
- **No backend**: All calculations happen client-side

## 🐛 Troubleshooting

### PWA Not Installing
- Ensure all icons are present in `/public`
- Check `manifest.json` is accessible at `/manifest.json`
- Verify HTTPS in production (required for PWA)
- Check browser console for service worker errors

### Metronome Timing Issues
- Ensure browser tab is active (browsers throttle inactive tabs)
- Check system audio is not muted
- Try enabling/disabling sound in the metronome
- Verify browser supports Web Audio API

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules`: `rm -rf node_modules`
- Reinstall: `npm install`
- Rebuild: `npm run build`

## 📄 License

Copyright © 2024 R.Y. Group. All rights reserved.

---

## 🤝 Support

For issues, questions, or contributions:
- **Technical Issues**: Check the troubleshooting section
- **Feature Requests**: Consider forking and extending the project
- **Medical Questions**: Consult with qualified healthcare professionals

---

**Produced by R.Y. Group** | [We're hiring!](#)

*Note: This is a support tool. Final verification must always be done visually by qualified healthcare professionals.*
