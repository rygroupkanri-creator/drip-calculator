# 🚀 Quick Start Guide

Get your IV Drip Rate Calculator running in **5 minutes**!

## ⚡ Instant Setup

### Step 1: Install Dependencies
```bash
cd drip-calculator
npm install
```

This will install all required packages (~1-2 minutes).

### Step 2: Run Development Server
```bash
npm run dev
```

### Step 3: Open Your Browser
Navigate to: **http://localhost:3000**

✅ **You're done!** The app is now running locally.

---

## 📱 What You'll See

1. **Disclaimer Modal**: On first load, you'll see a medical disclaimer. Click "I Understand & Agree" to proceed.

2. **Calculator Interface**:
   - Enter **Total Volume** (mL)
   - Enter **Duration** (Hours and Minutes)
   - Select **Drop Factor** (20 or 60 drops/mL)

3. **Results Display**: The app will show:
   - Drops per minute (gtt/min)
   - Seconds per drop

4. **Metronome**: Click "Start Metronome" to get audio and visual beats at the calculated interval.

---

## 🎯 Example Usage

**Scenario**: Infuse 1000 mL over 8 hours with a 20 drops/mL set

1. Enter **1000** in Volume field
2. Enter **8** in Hours field
3. Select **20** drops/mL
4. See result: **42 gtt/min** (approximately 1.43 seconds per drop)
5. Click "Start Metronome" to hear/see the beat

---

## 📦 Before Deploying

### Required: Generate PWA Icons

The app needs icons in multiple sizes. Choose one method:

#### Method A: Online Tool (Easiest) ⭐
1. Visit: https://www.pwabuilder.com/imageGenerator
2. Upload the included `public/icon.svg` (or your custom 512x512 icon)
3. Download the generated icons
4. Extract all to the `public/` folder

#### Method B: Use Placeholder
The included `icon.svg` can be used temporarily, but you should generate proper PNG icons for production.

---

## 🚀 Deploy to Production

### Vercel (Recommended - Takes 2 minutes)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts** to link your project

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

Your app will be live at: `https://your-app-name.vercel.app`

**Want a custom domain?**
- Go to Vercel dashboard → Your project → Settings → Domains
- Add your domain and follow DNS instructions

---

## 🔧 Customization

### Update Branding

1. **Change Primary Color**
   - Edit `tailwind.config.ts`
   - Replace `#2563eb` with your brand color

2. **Update Footer Link**
   - Edit `src/components/Calculator.tsx`
   - Find the `<a href="#">R.Y. Group</a>` section
   - Replace `#` with your recruitment page URL

3. **Modify App Name**
   - Edit `src/app/layout.tsx`
   - Update the `title` and `description` in metadata

---

## 📱 Test PWA on Mobile

### iOS (Safari)
1. Open the deployed site in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. Open the app from your home screen

### Android (Chrome)
1. Open the deployed site in Chrome
2. Tap the **menu** (three dots)
3. Tap **"Install app"** or **"Add to Home Screen"**
4. Tap **"Install"**
5. Open the app from your home screen

---

## 🆘 Troubleshooting

### Port 3000 Already in Use
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Icons Not Showing
- Make sure you've generated all icon sizes (see "Generate PWA Icons" above)
- Check that files are in the `public/` folder
- Restart the dev server

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

---

## 📚 Full Documentation

For detailed information, see:
- **README.md** - Complete feature documentation and setup
- **DEPLOYMENT.md** - Comprehensive deployment guide for all platforms

---

## ✅ Checklist Before Going Live

- [ ] Installed dependencies (`npm install`)
- [ ] App runs locally (`npm run dev`)
- [ ] Generated all PWA icon sizes
- [ ] Updated footer with actual recruitment link
- [ ] Tested calculator with sample values
- [ ] Tested metronome audio and visual pulse
- [ ] Changed brand colors (if desired)
- [ ] Built for production (`npm run build`)
- [ ] Deployed to hosting platform
- [ ] Verified HTTPS is enabled (required for PWA)
- [ ] Tested PWA installation on mobile device

---

## 🎉 You're Ready!

Your IV Drip Rate Calculator is now ready for healthcare professionals to use.

**Questions?** Check the full README.md or DEPLOYMENT.md files.

**Need Help?** Review the troubleshooting section above.

---

**Produced by R.Y. Group** | High-Performance Healthcare Technology
