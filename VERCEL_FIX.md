# Critical Fix for Session Persistence on Vercel

## Problem
After login, users can access `/dashboard` but lose session when navigating to other pages or reloading.

## Root Cause
1. **Wrong Site URL**: `.env.local` had `NEXT_PUBLIC_SITE_URL=https://geofury.live` but app is deployed to `https://isp-fita.vercel.app`
2. **Cookie configuration**: Cookies weren't persisting properly across page navigation
3. **Missing session initialization**: No client-side session provider

## What I Fixed (Locally)

### 1. Updated Environment Variables
Changed in `.env.local`:
```
NEXT_PUBLIC_SITE_URL=https://isp-fita.vercel.app
```

### 2. Improved Cookie Handling
- Added proper `sameSite`, `secure`, and `path` options to all cookie operations
- Updated `proxy.ts`, `lib/supabase/server.ts`, and `lib/supabase/client.ts`

### 3. Added SupabaseProvider
- Created `components/providers/SupabaseProvider.tsx` for client-side session management
- Wrapped app in `SupabaseProvider` in `app/layout.tsx`
- Ensures session is loaded and maintained on every page

### 4. Improved Login Flow
- Simplified login handler
- Added small delay after login to ensure cookies are set
- Uses hard navigation (`window.location.href`) to ensure cookies are sent

## What You Need to Do on Vercel

### Step 1: Update Environment Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project `isp-fita`
3. Go to **Settings** → **Environment Variables**
4. Update or add the following variable:

```
NEXT_PUBLIC_SITE_URL=https://isp-fita.vercel.app
```

5. Make sure these are also set (should already exist):
```
NEXT_PUBLIC_SUPABASE_URL=https://rywdsefnoyiyqdrcpadj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5d2RzZWZub3lpeXFkcmNwYWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NTUzNjgsImV4cCI6MjEwMjAzMTM2OH0.J4nAeEgv0ok1Sov2j5XhPKExoPNSJp3YLWsM1H2TWL0
```

6. Click **Save**

### Step 2: Verify Supabase Settings

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/rywdsefnoyiyqdrcpadj
2. Go to **Authentication** → **URL Configuration**
3. Verify these settings:

**Site URL:**
```
https://isp-fita.vercel.app
```

**Redirect URLs (should include):**
```
https://isp-fita.vercel.app/*
https://isp-fita.vercel.app/api/auth/callback
```

### Step 3: Deploy to Vercel

Since we can't push to GitHub, you have two options:

#### Option A: Manual Upload (Quick)
1. Create a `.zip` file of the entire project (excluding `node_modules` and `.next`)
2. Go to Vercel Dashboard → Your Project → Deployments
3. Click "Import" or "Deploy" and upload the zip

#### Option B: Connect GitHub (Recommended)
1. Create the repository on GitHub: https://github.com/Jashim-Rana-Ebu/isp
2. Push the code:
   ```bash
   git remote remove origin
   git remote add origin https://github.com/Jashim-Rana-Ebu/isp.git
   git push -u origin main
   ```
3. Vercel will automatically detect the push and redeploy

### Step 4: Test After Deployment

1. Wait 2-3 minutes for deployment to complete
2. **Clear browser cache and cookies** for `isp-fita.vercel.app`
3. Test the following flow:
   - Visit https://isp-fita.vercel.app/login
   - Login with credentials
   - Should redirect to `/dashboard`
   - Click on "Customers" or any other menu item
   - **Should NOT be redirected to login**
   - Reload the page
   - **Should still be logged in**

## What Changed in Code

Files modified:
- `.env.local` - Updated site URL
- `lib/supabase/client.ts` - Added cookie options and debug mode
- `lib/supabase/server.ts` - Improved cookie handling with proper attributes
- `proxy.ts` - Enhanced cookie configuration for production
- `app/layout.tsx` - Added SupabaseProvider wrapper
- `app/login/page.tsx` - Simplified login flow with proper session handling
- `components/providers/SupabaseProvider.tsx` - **NEW FILE** - Client-side session manager

## Why This Should Work

1. **Correct Site URL**: Cookies will be set for the correct domain
2. **Proper Cookie Attributes**: `sameSite: 'lax'`, `secure: true`, `path: '/'` ensure cookies work across all pages
3. **Client-Side Session Management**: SupabaseProvider ensures session is loaded on every page and listens for auth changes
4. **Consistent Cookie Handling**: Both server and client use the same cookie configuration
5. **LocalStorage Backup**: Session is also stored in localStorage as a fallback

## If It Still Doesn't Work

Check browser DevTools:
1. Open DevTools → Application/Storage → Cookies
2. Look for cookies starting with `sb-` after login
3. They should have:
   - Domain: `isp-fita.vercel.app`
   - Path: `/`
   - SameSite: `Lax`
   - Secure: `Yes` (in production)

If cookies are missing or have wrong attributes, the issue is likely with Vercel environment variables not being set correctly.
