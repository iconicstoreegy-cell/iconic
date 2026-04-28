# AL-SHAER | الشاعر — Premium E-Commerce Platform

Full-stack MERN e-commerce platform for a premium clothing brand.

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

---

## Environment Variables

### Backend `.env`

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_...) |
| `PAYMOB_API_KEY` | Paymob API key |
| `PAYMOB_INTEGRATION_ID` | Paymob integration ID |
| `PAYMOB_IFRAME_ID` | Paymob iframe ID |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp number (whatsapp:+14155238886) |
| `WHATSAPP_TO` | Your WhatsApp number (whatsapp:+201234567890) |
| `CLIENT_URL` | Frontend URL for CORS |

### Frontend `.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_test_...) |

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (protected)
- `PUT /api/auth/profile` — Update profile (protected)

### Products
- `GET /api/products` — Get all products (filters: search, category, minPrice, maxPrice, size, color, featured, newCollection, page, limit)
- `GET /api/products/:id` — Get product by ID
- `GET /api/products/slug/:slug` — Get product by slug
- `GET /api/products/:id/related` — Get related products
- `POST /api/products` — Create product (admin)
- `PUT /api/products/:id` — Update product (admin)
- `DELETE /api/products/:id` — Delete product (admin)
- `POST /api/products/:id/reviews` — Add review (protected)

### Orders
- `POST /api/orders` — Create order
- `GET /api/orders/myorders` — Get my orders (protected)
- `GET /api/orders/stats` — Dashboard stats (admin)
- `GET /api/orders` — Get all orders (admin)
- `GET /api/orders/:id` — Get order by ID (protected)
- `PUT /api/orders/:id/status` — Update order status (admin)

### Users (Admin)
- `GET /api/users` — Get all users
- `GET /api/users/:id` — Get user + order history
- `PUT /api/users/:id` — Update user role
- `DELETE /api/users/:id` — Delete user

### Upload
- `POST /api/upload/image` — Upload single image (admin)
- `POST /api/upload/images` — Upload multiple images (admin)

### Payment
- `POST /api/payment/stripe/create-intent` — Create Stripe payment intent
- `POST /api/payment/stripe/confirm` — Confirm Stripe payment
- `POST /api/payment/paymob/initiate` — Initiate Paymob payment
- `POST /api/payment/paymob/callback` — Paymob webhook

---

## Payment Gateway Setup

### Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Get your test keys from Dashboard → Developers → API Keys
3. Add `STRIPE_SECRET_KEY` to backend `.env`
4. Add `VITE_STRIPE_PUBLISHABLE_KEY` to frontend `.env`

### Paymob
1. Create account at [accept.paymob.com](https://accept.paymob.com)
2. Get API Key from Settings
3. Create an integration and get Integration ID
4. Create an iframe and get Iframe ID
5. Add all three to backend `.env`

### WhatsApp (Twilio)
1. Create account at [twilio.com](https://twilio.com)
2. Enable WhatsApp Sandbox in Messaging → Try it out → Send a WhatsApp message
3. Get Account SID and Auth Token from Console Dashboard
4. Add to backend `.env`

---

## Deployment

### Backend → Render / Railway
1. Push backend to GitHub
2. Create new Web Service on Render
3. Set environment variables
4. Deploy

### Frontend → Vercel
1. Push frontend to GitHub
2. Import project on Vercel
3. Set `VITE_API_URL` to your backend URL
4. Deploy

### Database → MongoDB Atlas
1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user
3. Whitelist IP (0.0.0.0/0 for production)
4. Copy connection string to `MONGO_URI`

---

## Features

- Bilingual (Arabic + English) with RTL support
- JWT authentication with admin/user roles
- Product variants (size + color + stock)
- Stripe + Paymob + Cash on Delivery
- WhatsApp order notifications via Twilio
- Cloudinary image uploads
- Admin dashboard with charts
- Framer Motion animations
- React Query caching
- Skeleton loaders
- Fully responsive
