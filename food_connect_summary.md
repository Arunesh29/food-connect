# 🍽️ Food Connect — Application Summary

> **Status**: ✅ Fully Built & Running at `http://localhost:5173/`

## Screenshots

````carousel
![Home Page — Hero Section](C:\Users\arune\.gemini\antigravity\brain\223d9007-422d-42e2-a1f6-1765fa899ff0\home_page_hero_1775617061182.png)
<!-- slide -->
![Home Page — Role Cards & Stats](C:\Users\arune\.gemini\antigravity\brain\223d9007-422d-42e2-a1f6-1765fa899ff0\home_page_roles_stats_1775617173053.png)
<!-- slide -->
![Login — Role Selection](C:\Users\arune\.gemini\antigravity\brain\223d9007-422d-42e2-a1f6-1765fa899ff0\role_selection_demo_user_1775617211102.png)
<!-- slide -->
![Receiver — Find Food Page](C:\Users\arune\.gemini\antigravity\brain\223d9007-422d-42e2-a1f6-1765fa899ff0\receiver_page_listings_1775617230223.png)
<!-- slide -->
![Admin Dashboard](C:\Users\arune\.gemini\antigravity\brain\223d9007-422d-42e2-a1f6-1765fa899ff0\admin_dashboard_real_1775617281383.png)
````

## Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | Component-based SPA |
| Styling | Vanilla CSS (1200+ lines) | Premium design system |
| Icons | Lucide React | Consistent iconography |
| Routing | React Router v7 | SPA navigation |
| State | React Context | User, toasts, notifications |
| Database | Firebase Firestore (configurable) | Real-time data sync |
| Storage | Firebase Storage (configurable) | Image uploads |
| Data Mode | Local fallback (default) | Works without Firebase |

## File Structure

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Router + layout
├── index.css                   # Full design system
├── firebase.js                 # Firebase config
├── context/
│   └── AppContext.jsx          # User, toasts, notifications
├── services/
│   └── foodService.js          # CRUD, real-time hooks, Firebase + local
├── components/
│   ├── Navbar.jsx              # Sticky nav + notifications
│   ├── FoodCard.jsx            # Food listing card
│   ├── Modal.jsx               # Reusable modal
│   ├── SkeletonCard.jsx        # Loading skeletons
│   ├── ToastContainer.jsx      # Toast notifications
│   └── RatingSection.jsx       # Delivery rating system
└── pages/
    ├── HomePage.jsx            # Hero + roles + stats
    ├── LoginPage.jsx           # Two-step auth
    ├── DonorPage.jsx           # Food posting form + listings
    ├── ReceiverPage.jsx        # Search, filter, request food
    ├── VolunteerPage.jsx       # Accept & deliver + tracking
    └── AdminPage.jsx           # Analytics dashboard
```

## Features Implemented

| Feature | Status |
|---------|--------|
| Home page with hero, role cards, stats | ✅ |
| Lightweight role-based auth | ✅ |
| Donor: post food with image, category, expiry | ✅ |
| Receiver: search, filter, request food | ✅ |
| Volunteer: accept delivery, mark delivered | ✅ |
| Simulated live tracking (map + timeline) | ✅ |
| Rating system (volunteer + food quality) | ✅ |
| Admin dashboard with analytics | ✅ |
| In-app notifications | ✅ |
| Toast notifications | ✅ |
| Auto-expire system | ✅ |
| Location-based filtering | ✅ |
| Multi-request handling | ✅ |
| Skeleton loaders | ✅ |
| Empty states | ✅ |
| Hover animations & transitions | ✅ |
| Responsive design | ✅ |
| Demo data for testing | ✅ |

## Firebase Setup

> [!IMPORTANT]
> The app currently runs with **local data mode** (no Firebase required). To connect Firebase:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore and Storage
3. Update credentials in [firebase.js](file:///c:/Users/arune/OneDrive/Desktop/html%20learn/yuvu/day%2014/src/firebase.js)
4. Set `USE_LOCAL = false` in [foodService.js](file:///c:/Users/arune/OneDrive/Desktop/html%20learn/yuvu/day%2014/src/services/foodService.js)

## Commands

```bash
# Development
npm run dev        # → http://localhost:5173

# Production build
npm run build      # → dist/
npm run preview    # Preview production build
```
