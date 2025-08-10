# Deployment Setup Guide

## GitHub Secrets Required

You need to add the following secrets to your GitHub repository:

### 1. Get Your Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Custom token" template with these permissions:
   - **Account**: Cloudflare Workers Scripts:Edit
   - **Account**: Cloudflare Pages:Edit
   - **Account**: D1:Edit
   - **Account**: Vectorize:Edit
   - **Account**: Workers AI:Edit
   - **Zone**: Zone:Read (if using custom domain)

4. Copy the token

### 2. Add GitHub Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token from step 1
- `CLOUDFLARE_ACCOUNT_ID`: `e2bc0dc62c571c7ec354cd49a1e5c768` (your account ID)
- `STAGING_API_URL`: `https://glassroot-api-staging.<your-subdomain>.workers.dev`
- `PROD_API_URL`: `https://glassroot-api.<your-subdomain>.workers.dev`
- `VITE_API_URL`: Same as PROD_API_URL for production builds

## Deployment Workflows

### Automatic Deployments

- **Push to `main`**: Deploys to production
- **Push to `develop`**: Deploys to staging
- **Pull Request**: Runs tests only (no deployment)
- **Git Tag `v*`**: Triggers mobile app build

### Manual Deployment

You can trigger manual deployment from GitHub Actions tab:
1. Go to Actions → Deploy Glassroot
2. Click "Run workflow"
3. Select branch and environment

## Environments

### Staging
- API: `https://glassroot-api-staging.<subdomain>.workers.dev`
- Client: `https://develop.glassroot.pages.dev`
- Uses staging D1 database and Vectorize index

### Production
- API: `https://glassroot-api.<subdomain>.workers.dev`
- Client: `https://glassroot.pages.dev` or custom domain
- Uses production D1 database and Vectorize index

## First-Time Setup

Before deployments will work, you need to:

1. Create Cloudflare resources:
```bash
# Create D1 database
npx wrangler d1 create glassroot

# Create Vectorize index
npx wrangler vectorize create glassroot-vectors --dimensions=768 --metric=cosine

# Create Pages project
npx wrangler pages project create glassroot
```

2. Update `wrangler.toml` with the D1 database ID

3. Initialize database schema:
```bash
npx wrangler d1 execute glassroot --file=./api/schema.sql
```

4. Set up GitHub secrets as described above

5. Push to trigger first deployment:
```bash
git add .
git commit -m "feat: add GitHub Actions deployment"
git push
```

## Monitoring Deployments

- Check GitHub Actions tab for deployment status
- View logs in Cloudflare Dashboard → Workers & Pages
- API health check: `curl https://your-api-url/api/health`

## Rollback

To rollback a deployment:
1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your project
3. Go to Deployments tab
4. Click "Rollback" on a previous deployment