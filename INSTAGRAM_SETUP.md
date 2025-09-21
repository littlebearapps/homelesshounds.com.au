# Instagram Feed Setup Guide

## 🔧 Step 1: Create Instagram App

### Facebook Developers Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Other" → "Business"
4. Fill in app details:
   - **App Name**: "Homeless Hounds Website"
   - **Contact Email**: your-email@homelesshounds.com.au

### Add Instagram Basic Display
1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. Go to "Instagram Basic Display" → "Basic Display"

### Configure Instagram Basic Display
1. **Valid OAuth Redirect URIs**:
   ```
   https://homelesshounds.com.au/auth/instagram/callback
   https://homelesshounds-com-au.pages.dev/auth/instagram/callback
   ```

2. **Deauthorize Callback URL**:
   ```
   https://homelesshounds.com.au/auth/instagram/deauthorize
   ```

3. **Data Deletion Request URL**:
   ```
   https://homelesshounds.com.au/auth/instagram/delete
   ```

4. Save changes

## 🔑 Step 2: Get Your Credentials

### App Credentials (from Basic Display tab)
- **Instagram App ID**: `XXXXXXXXXX`
- **Instagram App Secret**: `XXXXXXXXXX`

### Generate Access Token
1. Click "Add or Remove Instagram Testers"
2. Add your Instagram account (must be Business/Creator account)
3. Accept the invitation in Instagram app
4. Go back to Basic Display tab
5. Click "Generate Token" next to your username
6. Authorize the app and copy the access token

## 🔧 Step 3: Environment Variables

Add these to your environment variables:

### Local Development (.env)
```bash
# Instagram API
INSTAGRAM_APP_ID=your_app_id_here
INSTAGRAM_ACCESS_TOKEN=your_access_token_here
```

### Cloudflare Pages (Production)
1. Go to Cloudflare Pages dashboard
2. Select your site → Settings → Environment Variables
3. Add production variables:
   - `INSTAGRAM_APP_ID`: your_app_id
   - `INSTAGRAM_ACCESS_TOKEN**: your_access_token

## 🎯 Step 4: Instagram Account Setup

### Account Requirements
- Must be Instagram Business or Creator account
- Account handle: `@homelesshounds` (update in InstagramFeed.astro if different)
- Post regularly for best results

### Content Strategy
- Post photos of animals available for adoption
- Share success stories of adopted pets
- Behind-the-scenes rescue work
- Use hashtags: #homelesshounds #adopt #rescue #melbourne

## 🔄 Step 5: Token Refresh (Important!)

Instagram access tokens expire every 60 days. You need to refresh them:

### Manual Refresh (Temporary Solution)
1. Go to Facebook Developers → Your App → Instagram Basic Display
2. Generate new token following Step 2 above
3. Update environment variables with new token

### Automatic Refresh (Recommended for Production)
Consider implementing automatic token refresh using:
- Facebook Graph API `/refresh_access_token` endpoint
- Scheduled function to refresh before expiry
- Store tokens securely in database/KV storage

## 🧪 Step 6: Testing

### Test the Integration
1. Add your Instagram credentials to `.env`
2. Restart your dev server: `npm run dev`
3. Visit any page - you should see Instagram feed in footer
4. Check browser console for any errors

### Fallback Behavior
- If no token: Shows "Follow Our Rescues" link only
- If API fails: Shows fallback content
- If no posts: Shows Instagram link

## 🚀 Step 7: Go Live

1. Update environment variables in Cloudflare Pages
2. Deploy your site
3. Test on production URL
4. Monitor for any API rate limit issues

## 🔧 Troubleshooting

### Common Issues
- **"Invalid OAuth access token"**: Token expired, regenerate
- **"Rate limit exceeded"**: Wait and try again, consider caching
- **"User not found"**: Check Instagram username in code
- **CORS errors**: Instagram API should work server-side only

### Debug Mode
Enable debug logging by checking browser console and Astro build logs.

## 📊 Current Implementation

The Instagram feed will:
- ✅ Show 8 most recent posts
- ✅ Display in a clean 4-column grid
- ✅ Include video indicators for video posts
- ✅ Show captions on hover
- ✅ Link directly to Instagram posts
- ✅ Gracefully handle API failures
- ✅ Work on all page types

---

**Need help?** Check the Instagram Basic Display API documentation: https://developers.facebook.com/docs/instagram-basic-display-api