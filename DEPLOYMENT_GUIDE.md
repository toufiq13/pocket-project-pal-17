# 🚀 LuxInnovate Interiors - Deployment Guide

## Overview
This guide covers deployment, testing, and maintenance for the LuxInnovate Interiors platform.

---

## 📋 Pre-Deployment Checklist

### ✅ Backend (Supabase)
- [ ] Database migrations applied
- [ ] Row Level Security (RLS) policies tested
- [ ] Database indexes created for performance
- [ ] Edge functions deployed and tested
- [ ] API keys and secrets configured
- [ ] Backup strategy in place

### ✅ Frontend
- [ ] Environment variables configured
- [ ] Build process runs without errors
- [ ] Images optimized (lazy loading enabled)
- [ ] SEO metadata configured
- [ ] Analytics integrated

### ✅ AI Integration
- [ ] Lovable AI Gateway credentials configured
- [ ] AI chatbot tested with various queries
- [ ] ML recommendation engine validated
- [ ] Rate limiting tested

---

## 🌐 Deployment Options

### Frontend Deployment (Recommended: Vercel)

#### Option 1: Vercel (Recommended)
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel
```

**Environment Variables (Vercel):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

**Advantages:**
- Automatic deployments from Git
- Edge network for fast loading
- Free SSL certificates
- Preview deployments for PRs

#### Option 2: Netlify
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Deploy
netlify deploy --prod
```

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`

### Backend Deployment (Supabase)

Your Supabase backend is already deployed! Edge functions are automatically deployed when you push changes.

**Important URLs:**
- Project URL: `https://nyvgmkkzqmlweodetqvi.supabase.co`
- Database: Managed by Supabase
- Edge Functions: Auto-deployed

---

## 🧪 Testing & QA

### Unit Testing (Backend)

```bash
# Test edge functions locally
supabase functions serve

# Test with curl
curl -X POST http://localhost:54321/functions/v1/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me modern sofas"}'
```

### Frontend Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### AI Chatbot Testing

Test cases to validate:
1. **Product Queries**: "Show me modern sofas under ₹50,000"
2. **Design Suggestions**: "Suggest furniture for a minimal office"
3. **Order Support**: "Where is my order?"
4. **Recommendations**: "What goes well with this sofa?"

### Performance Testing

```bash
# Lighthouse audit
npx lighthouse https://your-domain.com --view

# Check bundle size
npm run build
npx vite-bundle-visualizer
```

**Target Metrics:**
- Lighthouse Performance: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Largest Contentful Paint: <2.5s

---

## 🔧 Performance Optimization

### Already Implemented
✅ Lazy loading for images (`loading="lazy"`)
✅ Database indexes for fast queries
✅ API response caching in edge functions
✅ Optimized queries with proper joins

### Additional Recommendations

#### 1. Image Optimization
```bash
# Install image optimization tools
npm install sharp

# Optimize images
npx sharp-cli -i src/assets -o src/assets/optimized
```

#### 2. Code Splitting
Already enabled via Vite! Each route is automatically code-split.

#### 3. CDN for Static Assets
- Use Vercel's CDN (automatic)
- Or configure Cloudflare for additional caching

#### 4. Database Query Optimization
```sql
-- Already added indexes for:
-- products, orders, reviews, user_interactions, cart, wishlist

-- Monitor slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

## 🌍 Custom Domain Setup

### Connect Your Domain (e.g., luxinnovate.com)

#### On Vercel:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `luxinnovate.com`)
3. Update DNS records at your registrar:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (up to 48 hours)

#### On Netlify:
1. Go to Domain Settings → Add custom domain
2. Update DNS records:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

---

## 📊 Monitoring & Analytics

### Supabase Monitoring
- Dashboard: https://supabase.com/dashboard/project/nyvgmkkzqmlweodetqvi
- Logs: Monitor edge function logs
- Database: Check query performance

### Application Monitoring
```javascript
// Add to your app (already configured with Supabase)
import { supabase } from "@/integrations/supabase/client";

// Track user interactions
await supabase.from("user_interactions").insert({
  user_id: userId,
  product_id: productId,
  interaction_type: "view",
});
```

### Analytics Integration
Consider adding:
- Google Analytics 4
- Mixpanel for user behavior
- Sentry for error tracking

---

## 🔒 Security Best Practices

### Already Implemented
✅ Row Level Security (RLS) on all tables
✅ JWT-based authentication
✅ API keys stored in environment variables
✅ HTTPS enabled by default

### Additional Security
```bash
# Enable password strength requirements
# Done via Supabase Dashboard → Authentication → Settings

# Monitor security issues
npm audit

# Keep dependencies updated
npm update
```

---

## 🚨 Maintenance

### Regular Tasks

#### Weekly
- [ ] Review error logs in Supabase
- [ ] Check edge function performance
- [ ] Monitor database size and usage

#### Monthly
- [ ] Update npm dependencies
- [ ] Review and optimize database indexes
- [ ] Analyze user feedback and feature requests

#### Quarterly
- [ ] Full security audit
- [ ] Performance optimization review
- [ ] AI model accuracy evaluation

### Backup Strategy
Supabase provides automatic backups, but you can also:
```bash
# Export database
pg_dump -h db.nyvgmkkzqmlweodetqvi.supabase.co \
        -U postgres \
        -d postgres > backup.sql

# Import database
psql -h db.nyvgmkkzqmlweodetqvi.supabase.co \
     -U postgres \
     -d postgres < backup.sql
```

---

## 🆘 Troubleshooting

### Common Issues

#### Issue: "Failed to fetch" errors
**Solution**: Check CORS headers in edge functions
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

#### Issue: RLS policy blocks queries
**Solution**: Review policies in Supabase Dashboard
```sql
-- Check active policies
SELECT * FROM pg_policies WHERE tablename = 'products';
```

#### Issue: Slow page loads
**Solution**: 
1. Check Network tab in browser DevTools
2. Optimize images (lazy loading already enabled)
3. Review database query performance

---

## 📞 Support

### Resources
- **Lovable Docs**: https://docs.lovable.dev
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Project GitHub**: [Your repository URL]

### Getting Help
1. Check logs in Supabase Dashboard
2. Review browser console for errors
3. Test edge functions independently
4. Contact support if needed

---

## ✨ Next Steps

After deployment:
1. Set up monitoring and alerts
2. Collect user feedback
3. Iterate on AI recommendations
4. Add more ML features based on usage data
5. Consider A/B testing for UI improvements

---

**Congratulations!** 🎉 Your LuxInnovate Interiors platform is ready for production!
