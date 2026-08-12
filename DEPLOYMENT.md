# Ultimate ISP - Deployment Guide

## ⚠️ Important: This Next.js app CANNOT be deployed to traditional cPanel hosting

Your application requires Node.js runtime and cannot run on traditional cPanel hosting that only supports PHP/static files.

## Recommended Deployment: Vercel (Free)

Vercel is made by the Next.js team and offers the best experience.

### Step 1: Prepare Your Repository

1. Install Git if you haven't already
2. Initialize git repository (if not done):
```bash
git init
git add .
git commit -m "Initial commit"
```

3. Create a GitHub account at https://github.com
4. Create a new repository on GitHub
5. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up with your GitHub account
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Add Environment Variables

In Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project dashboard.

### Step 4: Deploy

Click "Deploy" and Vercel will:
- Install dependencies
- Build your application
- Deploy to a global CDN
- Provide you with a URL (e.g., `your-app.vercel.app`)

### Step 5: Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `geofury.live`)
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificate

## Alternative: Deploy to VPS with Node.js

If you have a VPS or cloud server with cPanel and Node.js support:

### Prerequisites
- VPS with Node.js 18+ installed
- PM2 process manager
- Nginx or Apache as reverse proxy

### Deployment Steps

1. **Upload files to server**:
```bash
# Connect via SSH
ssh user@your-server.com

# Navigate to your directory
cd /home/yourusername/uisp-app

# Upload your files (use SCP, SFTP, or Git clone)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

2. **Install dependencies**:
```bash
npm install --production
```

3. **Build the application**:
```bash
npm run build
```

4. **Create .env.local file**:
```bash
nano .env.local
```
Add your environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Install PM2**:
```bash
npm install -g pm2
```

6. **Start the application**:
```bash
pm2 start npm --name "uisp-app" -- start
pm2 save
pm2 startup
```

7. **Configure Nginx reverse proxy**:
```nginx
server {
    listen 80;
    server_name geofury.live;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **Enable SSL with Certbot**:
```bash
sudo certbot --nginx -d geofury.live
```

## Static Export (Not Recommended)

You can export to static files, but you'll lose:
- Server-side rendering
- API routes
- Authentication middleware
- Dynamic features
- Supabase server-side auth

If you still want to try:

1. Update `next.config.ts`:
```typescript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};
```

2. Build:
```bash
npm run build
```

3. Upload the `out` folder to cPanel

**Warning**: Your authentication and dynamic features will NOT work with static export!

## Recommended Solution Summary

✅ **Best Option**: Deploy to Vercel
- Free tier available
- Automatic deployments from GitHub
- Built-in SSL
- Global CDN
- Zero configuration
- Made for Next.js

🔧 **Alternative**: VPS with Node.js + PM2 + Nginx
- More control
- Requires server management knowledge
- Monthly cost for VPS

❌ **Not Recommended**: cPanel static hosting
- Will break most features
- No authentication
- No API routes
- No server-side rendering

## Need Help?

If you need assistance with deployment, let me know which option you'd like to pursue!
