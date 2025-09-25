# OAuth Setup Guide for Wanimate AI

This guide will help you set up Google and GitHub OAuth authentication for your Wanimate AI application.

## Prerequisites

- Supabase project setup and running
- Domain or localhost setup for development

## 1. Supabase Configuration

### Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** > **Providers**

## 2. Google OAuth Setup

### Step 1: Create Google Cloud Console Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**

### Step 2: Configure OAuth Consent Screen
1. Click **OAuth consent screen**
2. Choose **External** (for public applications)
3. Fill in required fields:
   - App name: `Wanimate AI`
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `email` and `profile`
5. Save and continue

### Step 3: Create OAuth 2.0 Credentials
1. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
2. Choose **Web application**
3. Set name: `Wanimate AI Web Client`
4. Add authorized origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
6. Save and copy the **Client ID** and **Client Secret**

### Step 4: Configure in Supabase
1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Find **Google** and click **Enable**
3. Enter:
   - **Client ID**: From Google Console
   - **Client Secret**: From Google Console
4. Set **Redirect URL**: `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Save configuration

## 3. GitHub OAuth Setup

### Step 1: Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in application details:
   - **Application name**: `Wanimate AI`
   - **Homepage URL**: `http://localhost:3000` or your domain
   - **Application description**: `AI-powered character animation platform`
   - **Authorization callback URL**: `https://your-supabase-project.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Generate a new **Client Secret** and copy it

### Step 2: Configure in Supabase
1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Find **GitHub** and click **Enable**
3. Enter:
   - **Client ID**: From GitHub OAuth App
   - **Client Secret**: From GitHub OAuth App
4. Set **Redirect URL**: `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Save configuration

## 4. Environment Variables

Your environment variables are managed automatically by Supabase. No additional environment variables needed for OAuth.

## 5. Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/sign-in` or `/sign-up`
3. Click "Sign in with Google" or "Sign in with GitHub"
4. Complete the OAuth flow
5. You should be redirected back to your application

## 6. Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**
   - Ensure redirect URIs in OAuth providers match Supabase callback URL
   - Format: `https://your-project-ref.supabase.co/auth/v1/callback`

2. **Domain Not Authorized**
   - Add your domain to authorized origins in Google Console
   - Update callback URL in GitHub OAuth App

3. **OAuth Provider Not Enabled**
   - Ensure providers are enabled in Supabase Dashboard
   - Check that Client ID and Secret are correctly entered

### Production Deployment

When deploying to production:
1. Update authorized origins/callback URLs in OAuth providers
2. Use your production domain instead of localhost
3. Ensure HTTPS is enabled for production domains

## Security Notes

- Keep Client Secrets secure and never expose them in client-side code
- Use HTTPS for production deployments
- Regularly rotate OAuth credentials
- Monitor OAuth usage in provider dashboards