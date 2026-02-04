# REDBUS Price Comparison

A lightweight React dashboard for comparing competitor bus prices using the REDBUS Seatseller API.

## Quick start

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and add your REDBUS credentials plus the Seatseller API base URL:

```bash
VITE_REDBUS_API_BASE_URL=http://api.seatseller.travel
VITE_REDBUS_CONSUMER_KEY=your-key
VITE_REDBUS_CONSUMER_SECRET=your-secret
```

The UI defaults to sample data so you can explore the layout without hitting the API. Disable **Use sample data** to call the live endpoint and update the endpoint path if your Seatseller API uses a different route.

> **Security note:** avoid committing credentials to source control. For production, proxy requests through a backend so secrets are never exposed to browsers.
