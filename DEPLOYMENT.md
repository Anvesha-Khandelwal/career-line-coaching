# Deployment Guide - Career Line Coaching Website

This guide will help you deploy the Career Line Coaching website to production.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Git
- A hosting provider (Heroku, Vercel, Netlify, AWS, etc.)

## Environment Setup

### 1. Backend Environment Variables

Create a `.env` file in the `backend` directory (copy from `.env.example`):

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your production values:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_secret_key_here
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### 2. MongoDB Setup

#### Option A: MongoDB Atlas (Recommended for Production)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Add your server IP to the whitelist
5. Create a database user
6. Update `MONGODB_URI` in `.env`

#### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/careerline` as `MONGODB_URI`

## Deployment Options

### Option 1: Deploy Backend to Heroku

1. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

2. **Create Heroku App**:
   ```bash
   cd backend
   heroku create career-line-backend
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

5. **Update Frontend Config**:
   Update `frontend/config.js` to use your Heroku URL:
   ```javascript
   const API_BASE_URL = 'https://career-line-backend.herokuapp.com/api';
   ```

### Option 2: Deploy Backend to Railway/Render

1. **Railway**:
   - Connect your GitHub repository
   - Add MongoDB service
   - Set environment variables
   - Deploy

2. **Render**:
   - Create a new Web Service
   - Connect your repository
   - Set build command: `cd backend && npm install`
   - Set start command: `cd backend && npm start`
   - Add environment variables

### Option 3: Deploy Frontend to Netlify/Vercel

1. **Netlify**:
   ```bash
   cd frontend
   npm install -g netlify-cli
   netlify deploy --prod
   ```

2. **Vercel**:
   ```bash
   cd frontend
   npm install -g vercel
   vercel --prod
   ```

3. **Update API URL**:
   After deploying frontend, update `config.js` to point to your backend URL.

## Production Checklist

- [ ] MongoDB connection string configured
- [ ] JWT_SECRET changed from default
- [ ] CORS_ORIGIN set to your frontend domain
- [ ] NODE_ENV set to production
- [ ] Frontend API URL updated to production backend
- [ ] SSL/HTTPS enabled
- [ ] Environment variables secured (not in git)
- [ ] Database backups configured
- [ ] Error logging configured
- [ ] Performance monitoring set up

## Testing After Deployment

1. **Test Backend**:
   ```bash
   curl https://your-backend-url.com/health
   ```

2. **Test Registration**:
   - Visit your frontend URL
   - Try registering a new user
   - Check MongoDB to verify data is saved

3. **Test Login**:
   - Login with registered credentials
   - Verify JWT token is generated

4. **Test Student Management**:
   - Add a student
   - Update student information
   - Record a payment

## Troubleshooting

### Database Connection Issues

- Verify MongoDB URI is correct
- Check IP whitelist (for Atlas)
- Verify database credentials
- Check network connectivity

### CORS Errors

- Update CORS_ORIGIN in backend `.env`
- Ensure frontend URL matches CORS_ORIGIN
- Check browser console for specific errors

### Environment Variables Not Loading

- Verify `.env` file exists in backend directory
- Check variable names match exactly
- Restart server after changing `.env`

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use strong JWT_SECRET** - Generate random string
3. **Enable HTTPS** - Use SSL certificates
4. **Set CORS_ORIGIN** - Don't use `*` in production
5. **Regular Updates** - Keep dependencies updated
6. **Database Backups** - Set up automated backups
7. **Rate Limiting** - Consider adding rate limiting
8. **Input Validation** - Already implemented, but review

## Support

For issues or questions:
- Check the logs: `heroku logs --tail` (for Heroku)
- Review error messages in browser console
- Check MongoDB connection status
- Verify all environment variables are set

## Post-Deployment

After successful deployment:

1. Test all features thoroughly
2. Monitor error logs
3. Set up monitoring/alerting
4. Configure backups
5. Document any custom configurations
6. Share deployment URL with team
