# PWA (Progressive Web App) Setup & Testing Guide

This guide explains how to serve the Startup Setu app as a PWA and test its offline and installation capabilities.

## What's Been Added

✅ **manifest.json** — App metadata, name, icons, display mode, theme color  
✅ **service-worker.js** — Precaches assets and implements runtime caching  
✅ **icons/** — 192x192 and 512x512 SVG icons  
✅ **index.html** — Links manifest, sets theme-color, registers service worker

## Serving the PWA

### Option 1: Local Development (Easy)

The dev server already serves the app. Open your browser and navigate to:

```
http://localhost:3000
```

The service worker will automatically register. Check the browser console (F12 → Console tab) for:

```
ServiceWorker registered: http://localhost:3000/
```

### Option 2: HTTPS for PWA Install Testing (Recommended)

PWA install prompts only appear on HTTPS or localhost. To test the install experience:

#### On Windows with Node.js:

**Install `http-server` globally:**

```bash
npm install -g http-server
```

**Serve the app with HTTPS (self-signed cert):**

```bash
cd c:\Users\KUNAL\OneDrive\Desktop\startup-setu-chatbot
http-server -p 8443 -S
```

Then open:

```
https://localhost:8443
```

#### Alternative: Use ngrok for Public HTTPS URL

```bash
npm install -g ngrok
npx ngrok http 3000
```

This creates a public HTTPS URL. Open the ngrok URL in your browser or on a mobile device.

## Testing PWA Features

### 1. **Verify Service Worker Registration**

1. Open the app (`http://localhost:3000`)
2. Open DevTools: **F12 → Console**
3. Look for: `ServiceWorker registered: http://localhost:3000/`
4. If you see a warning, check that all precache URLs exist (especially `/icons/` files)

### 2. **View Service Worker in DevTools**

1. Open DevTools: **F12 → Application** (or **Lighthouse**)
2. Go to **Service Workers** section
3. You should see the service worker with status **activated and running**
4. The CACHE_NAME is: `startup-setu-v1`

### 3. **Test Offline Functionality**

1. Load the app once to populate the cache
2. Open DevTools → **Network** tab
3. Check **Offline** checkbox
4. Refresh the page — it should still load from the cache
5. Try sending a chat message — it will fail gracefully (API unavailable, but UI stays responsive)

### 4. **Install PWA on Mobile**

**On Android Chrome:**

1. Open the app on mobile (or use ngrok public URL)
2. Tap **⋮ (menu)** in the browser
3. Select **"Install app"** or **"Add to Home screen"**
4. Confirm installation
5. The app now appears as an installed app and launches fullscreen

**On iPhone Safari:**

1. Open the app in Safari
2. Tap **Share** icon (↗)
3. Scroll and tap **"Add to Home Screen"**
4. Name the shortcut and confirm
5. The app icon appears on your home screen

**On Desktop (Windows):**

1. Open the app in Edge or Chrome
2. Click the **+** icon in the address bar (or menu → "Install this site as an app")
3. Confirm — the app now runs standalone

### 5. **Inspect Cached Assets**

1. Open DevTools → **Application** → **Cache Storage**
2. Expand **startup-setu-v1** cache
3. You should see:
   - `/` (root)
   - `/index.html`
   - `/manifest.json`
   - `/icons/icon-192.svg`
   - `/icons/icon-512.svg`

### 6. **Test Runtime Caching**

1. With the app loaded, open DevTools → **Network** tab
2. Filter by **Fetch/XHR** to see API calls
3. Send a chat message — you'll see `POST /api/chat` request
4. Go offline, send another message — the request fails (expected; backend is unavailable)
5. Refresh the page — it still loads the UI from cache

## Troubleshooting

### Service Worker Not Registering

- **Check the Console** for error messages
- **Ensure `/service-worker.js` file exists** in the project root
- **Refresh the page** (hard refresh with Ctrl+Shift+R)
- **Check file permissions** — make sure the server can serve all files

### Manifest Not Loading

- **Open DevTools → Application → Manifest**
- Verify it displays correctly
- Check that `/manifest.json` file exists
- Icons must exist at `/icons/icon-192.svg` and `/icons/icon-512.svg`

### App Won't Install

- **Must use HTTPS or localhost** (PWA install not available on plain HTTP)
- **Service worker must be activated** (see Service Workers in Application tab)
- **Manifest must be valid** (check manifest display section)
- **Use ngrok** to get a public HTTPS URL for mobile testing

### Icons Not Showing

- Verify files exist: `icons/icon-192.svg` and `icons/icon-512.svg`
- Check manifest `icons` array has correct paths
- Ensure CORS headers allow icon serving (they should by default)

## Development Tips

- **Clear Service Worker Cache**: DevTools → Application → Storage → Clear Site Data (before testing offline)
- **Update Service Worker**: Change `CACHE_NAME` version (e.g., `"startup-setu-v2"`) to bust old caches
- **Disable Service Worker temporarily**: DevTools → Application → Service Workers → check "Update on reload"
- **Monitor Console**: Always keep console open while developing to catch registration errors

## Next Steps

1. **Production Deployment**: Move the app to a real server with HTTPS (e.g., Vercel, Netlify, AWS S3 + CloudFront)
2. **Customize Icons**: Replace `icons/icon-192.svg` and `icons/icon-512.svg` with your app's actual logo
3. **Enhance Offline UX**: Currently the UI loads offline but API calls fail. Consider adding a "offline" banner or local fallback responses
4. **Add Web App Shortcuts**: Update `manifest.json` to add quick-action shortcuts (e.g., "New Chat")
5. **Push Notifications**: Implement Web Push API to send notifications to installed app users

## Files Reference

| File                 | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `manifest.json`      | PWA metadata, icons, display settings          |
| `service-worker.js`  | Precache + runtime caching for offline support |
| `icons/icon-192.svg` | App icon (192x192px)                           |
| `icons/icon-512.svg` | App icon (512x512px)                           |
| `index.html`         | Links manifest, registers service worker       |

---

**Status**: ✅ PWA Ready for Testing on Localhost  
**Next**: Serve on HTTPS and test installation on mobile devices
