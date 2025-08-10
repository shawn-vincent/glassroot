#!/bin/bash

# Glassroot Deployment Script
# Usage: ./bin/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Deploying Glassroot to ${ENVIRONMENT}...${NC}"

# Check if logged into Cloudflare
echo -e "${YELLOW}Checking Cloudflare authentication...${NC}"
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo -e "${RED}❌ Not logged into Cloudflare. Please run: npx wrangler login${NC}"
    exit 1
fi

# Run type checking
echo -e "${YELLOW}Running type check...${NC}"
npm run typecheck

# Run linting
echo -e "${YELLOW}Running lint check...${NC}"
npm run lint

# Build projects
echo -e "${YELLOW}Building projects...${NC}"
npm run build

# Deploy API
echo -e "${YELLOW}Deploying API to ${ENVIRONMENT}...${NC}"
cd api
if [ "$ENVIRONMENT" = "production" ]; then
    npm run deploy:production
else
    npm run deploy:staging
fi
cd ..

# Get API URL
if [ "$ENVIRONMENT" = "production" ]; then
    API_URL="https://glassroot-api.svincent.workers.dev"
else
    API_URL="https://glassroot-api-staging.svincent.workers.dev"
fi

# Deploy Client with correct API URL
echo -e "${YELLOW}Deploying client to ${ENVIRONMENT}...${NC}"
cd client
VITE_API_URL=$API_URL npm run build
if [ "$ENVIRONMENT" = "production" ]; then
    npx wrangler pages deploy dist --project-name=glassroot --branch=main
else
    npx wrangler pages deploy dist --project-name=glassroot --branch=staging
fi
cd ..

echo -e "${GREEN}✅ Deployment to ${ENVIRONMENT} complete!${NC}"
echo -e "${GREEN}API: ${API_URL}${NC}"
echo -e "${GREEN}Client: https://glassroot.pages.dev${NC}"

# Test the deployment
echo -e "${YELLOW}Testing API health...${NC}"
if curl -f "${API_URL}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}⚠️  API health check failed${NC}"
fi