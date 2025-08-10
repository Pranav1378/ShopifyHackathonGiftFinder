# 🚀 GiftFinder Setup Guide

## Quick Start - Create Your .env File

Create a file named `.env` in the project root with the following content:

```bash
# Copy and paste this into your .env file

# =============================================================================
# SHOPIFY CONFIGURATION (Required for production)
# =============================================================================
VITE_SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token-here

# =============================================================================
# LLM/AI CONFIGURATION (Required for AI features)
# =============================================================================
VITE_LLM_API_KEY=sk-your-openai-api-key-here
VITE_LLM_BASE_URL=https://api.openai.com/v1
VITE_LLM_MODEL=gpt-4

# =============================================================================
# DEVELOPMENT SETTINGS
# =============================================================================
# Set to true to use mock data (no API keys needed)
VITE_USE_MOCK_DATA=true

# Enable debug logging
VITE_DEBUG_MODE=true

# Enable caching
VITE_CACHE_ENABLED=true

# =============================================================================
# OPTIONAL SETTINGS
# =============================================================================
VITE_MAX_BUNDLES=6
VITE_DEFAULT_BUDGET=75
VITE_CACHE_TTL_INTENT=1800000
VITE_CACHE_TTL_CATALOG=300000
```

## 📋 Setup Instructions

### Option 1: Quick Start with Mock Data (No API Keys Needed)

1. **Create .env file** in project root:
   ```bash
   VITE_USE_MOCK_DATA=true
   VITE_DEBUG_MODE=true
   ```

2. **Start the app**:
   ```bash
   npm start
   ```

3. **Test the GiftFinder**: Click "Find Perfect Gifts" and try generating bundles!

### Option 2: Full Setup with Real APIs

#### Step 1: Get Shopify Credentials

1. **Go to your Shopify Admin**
2. **Navigate to**: Apps → Private Apps → Create Private App
3. **Enable Storefront API access**
4. **Copy the Storefront Access Token**
5. **Add to .env**:
   ```bash
   VITE_SHOPIFY_SHOP_DOMAIN=your-actual-shop.myshopify.com
   VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=storefront_access_token_here
   ```

#### Step 2: Get OpenAI API Key

1. **Go to**: https://platform.openai.com/api-keys
2. **Create a new API key**
3. **Copy the key** (starts with `sk-`)
4. **Add to .env**:
   ```bash
   VITE_LLM_API_KEY=sk-your-actual-openai-key-here
   ```

#### Step 3: Enable Real APIs

1. **Update .env**:
   ```bash
   VITE_USE_MOCK_DATA=false
   ```

2. **Restart the development server**:
   ```bash
   npm start
   ```

## 🎯 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_SHOPIFY_SHOP_DOMAIN` | Production | Your Shopify store domain | `mystore.myshopify.com` |
| `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Production | Storefront API token | `abc123...` |
| `VITE_LLM_API_KEY` | AI Features | OpenAI API key | `sk-abc123...` |
| `VITE_USE_MOCK_DATA` | Development | Use mock data instead of APIs | `true` or `false` |
| `VITE_DEBUG_MODE` | Optional | Enable console logging | `true` or `false` |

## 🔧 Troubleshooting

### Problem: "Failed to generate bundles"
- **Solution**: Make sure `VITE_USE_MOCK_DATA=true` for development
- **Or**: Check that your API keys are correct

### Problem: No products found
- **Solution**: Verify your Shopify domain and access token
- **Or**: Enable mock data for testing

### Problem: LLM errors
- **Solution**: Check your OpenAI API key and account credits
- **Or**: Use mock mode which has fallback responses

## 🎮 Testing Commands

```bash
# Start development server
npm start

# Test with browser console
# Open browser dev tools and run:
giftFinderDemo.runDemo("Cozy Birthday Gift")
giftFinderDemo.runAllDemos()
giftFinderDemo.benchmark()
```

## 📞 Need Help?

1. **Check the browser console** for error messages
2. **Verify your .env file** is in the project root
3. **Restart the dev server** after changing .env
4. **Start with mock data** to test the interface first

## 🎁 Ready to Test!

Once your .env is set up, the GiftFinder will:
- ✅ Accept recipient profiles
- ✅ Generate intelligent gift bundles
- ✅ Show pricing and rationales
- ✅ Allow adding bundles to cart
- ✅ Handle errors gracefully

Happy gift finding! 🎉
