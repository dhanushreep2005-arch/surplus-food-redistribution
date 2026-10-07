# Surplus Food Redistribution System

A final-year project built with **Node.js, Express.js, MongoDB, Mongoose, EJS, Bootstrap 5, HTML/CSS/JavaScript only** — no React, no external AI/ML, no JWT, no other frameworks.

This is the **core working application (~50% implementation)**: full donor → NGO → volunteer donation workflow, rule-based food expiry/urgency logic, complete CRUD for donations/requests/pickups, authentication, and role-based dashboards. AI-based prediction, route optimization, and smart matching are intentionally left for a later phase — the code is structured so those can be added on top later without rewriting anything.

---

## 1. Project Structure

```
surplus-food-redistribution/
├── app.js
├── package.json
├── .env.example
├── README.md
│
├── models/            User.js, Donation.js, Request.js, Pickup.js
├── routes/             userRoutes.js, donationRoutes.js, requestRoutes.js, pickupRoutes.js
├── controllers/        userController.js, donationController.js, requestController.js, pickupController.js
├── utils/               urgency.js, middleware.js   (see note below)
│
├── views/
│   ├── home.ejs
│   ├── partials/        navbar.ejs, footer.ejs, flash.ejs, statusBadge.ejs
│   ├── auth/             login.ejs, register.ejs
│   ├── donor/            dashboard.ejs, profile.ejs
│   ├── ngo/               dashboard.ejs, profile.ejs
│   ├── volunteer/        dashboard.ejs, profile.ejs
│   ├── donations/       index.ejs, new.ejs, show.ejs, edit.ejs
│   ├── requests/         index.ejs, new.ejs, show.ejs, edit.ejs
│   └── pickups/           index.ejs, new.ejs, show.ejs, edit.ejs
│
├── public/
│   ├── css/style.css
│   ├── js/script.js
│   └── images/          (hero.jpg, donation.jpg, ngo.jpg, volunteer.jpg go here)
│
└── init/data.js
```

### About the two extra files in `utils/`

You asked me to flag any file not in your original list before adding it — here's why these two exist:

- **`utils/urgency.js`** — the "remaining time" and "urgency level" calculation (rule-based JavaScript `Date` math) is needed on the donor dashboard, NGO dashboard, donations list, and donation show page all at once. Writing it once and requiring it everywhere avoids copy-pasting the same logic into four EJS files. It's also the natural place to plug in a real AI spoilage-prediction model later.
- **`utils/middleware.js`** — the "is someone logged in / are they the right role" check is needed in almost every route. One small reusable function keeps the route files readable instead of repeating the same `if` block dozens of times.

Both are plain functions with zero new dependencies — nothing beyond what you already know.

---

## 2. Technologies Used

Node.js, Express.js, MongoDB, Mongoose, EJS, Bootstrap 5, HTML, CSS, vanilla JavaScript.

Two small, standard packages were added because the brief allowed "the simplest suitable Express-compatible approach" where required:
- **`express-session`** — for login state, since JWT was explicitly excluded. This is the standard, simplest session approach used in typical Node/Express course projects (including WanderLust-style apps).
- **`method-override`** — lets plain HTML `<form>` tags submit PUT/PATCH/DELETE requests, since browsers only natively support GET/POST in forms.
- **`bcryptjs`** — for hashing passwords before saving them (never storing plain-text passwords). This is not an authentication *architecture* like JWT — it's just the hashing function.

No AI/ML libraries, no React/Angular/Vue, no other database, no external APIs.

---

## 3. Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Copy the example environment file and fill in your own values
cp .env.example .env
# then edit .env and set MONGO_URL, PORT, SESSION_SECRET

# 3. Make sure MongoDB is running locally (or point MONGO_URL to Atlas)

# 4. Seed the database with realistic sample data
node init/data.js

# 5. Start the app
npm start
```

Then open **http://localhost:3000** in your browser.

### `.env` variables

```
MONGO_URL=mongodb://127.0.0.1:27017/surplusfood
PORT=3000
SESSION_SECRET=changeThisToAnyRandomSecretString
```

Never commit your real `.env` file — only `.env.example` (with placeholder values) is included in the project.

### Seeded login accounts (all use password: `password123`)

| Role | Email |
|---|---|
| Donor | ramesh.gowda@example.com |
| NGO | contact@akshayaseva.org |
| Volunteer | arjun.nair@example.com |

The seed script (`init/data.js`) creates 3 donors, 3 NGOs, 4 volunteers, 15 donations across every status (pending/accepted/picked_up/delivered/expired), several requests, and several pickup records — all linked with real Mongoose ObjectId references, not fake IDs.

---

## 4. Demo Flow (for your project evaluation)

1. **Login as a donor** (ramesh.gowda@example.com) → go to Donor Dashboard → click "Donate Food" → fill the form → submit.
   - The new donation is saved to MongoDB with `status: "pending"`.
2. **Logout, login as an NGO** (contact@akshayaseva.org) → NGO Dashboard → the donation appears under "Available Donations" with its urgency badge.
   - Click **Accept Food** → status updates to `"accepted"` in MongoDB, and the NGO field is set.
3. **Logout, login as a volunteer** (arjun.nair@example.com) → Volunteer Dashboard → the donation now appears under "Available Pickups".
   - Click **Mark Picked Up** → status becomes `"picked_up"`, volunteer field is set.
   - Click **Mark Delivered** → status becomes `"delivered"`.
4. **Log back in as the original donor** → their dashboard now shows **"✓ DELIVERED"** for that donation.
5. **Log back in as the NGO** → their dashboard shows **"✓ FOOD RECEIVED"**.
6. **Log back in as the volunteer** → their dashboard shows it under "Completed Deliveries" as **"✓ DELIVERY COMPLETED"**.

All three dashboards are reading the *same* MongoDB document's `status` field — there's no separate/duplicate status tracking per role, exactly as required.

You can also demonstrate the **expiry/urgency system**: open any donation's detail page and you'll see "⏱ Expires in: X hours Y minutes" and an urgency badge (LOW/MEDIUM/HIGH/EXPIRED) calculated live with plain JavaScript `Date` math — no AI involved yet.

---

## 5. IMAGE PLACEMENT GUIDE

I deliberately did **not** hardcode any external image URLs — you can drop your own photos in. Save your images with these exact filenames:

| Image | Save to | Used in |
|---|---|---|
| Homepage hero background | `public/images/hero.jpg` | Full-screen hero on the homepage. Referenced in `public/css/style.css` under `.hero-section { background-image: url("/images/hero.jpg"); }` |
| Donation photo | `public/images/donation.jpg` | Homepage image strip. Referenced directly in `views/home.ejs` as `<img src="/images/donation.jpg" ...>` |
| NGO photo | `public/images/ngo.jpg` | Homepage image strip. Referenced in `views/home.ejs` as `<img src="/images/ngo.jpg" ...>` |
| Volunteer photo | `public/images/volunteer.jpg` | Homepage image strip. Referenced in `views/home.ejs` as `<img src="/images/volunteer.jpg" ...>` |

Until you add these files, the hero section falls back to a solid navy background color (set in `style.css`) so the page never looks broken — as soon as you drop a `hero.jpg` (etc.) into `public/images/`, it will show up automatically with no code changes needed.

If you want to swap the hero image path or add more images later, the only place to edit is:
- `public/css/style.css` → the `.hero-section` rule, for the hero background
- `views/home.ejs` → the `<img src="...">` tags in the "IMAGE STRIP" section, for the three homepage photos

---

## 6. Notes on What's Deliberately Left for Later (AI Phase)

As instructed, no AI/ML is implemented yet. The code is structured so these can be added without restructuring:
- `utils/urgency.js` → today: rule-based expiry/urgency math. Later: replace with an AI spoilage-prediction call.
- The `Donation` collection (with `location`, `preparedAt`, `expiryAt`, timestamps) → later: training data for demand prediction.
- The `donor` / `ngo` / `volunteer` location fields on `User` and `Donation` → later: input for smart matching / route optimization.

---

## 7. A Note on Testing

Every JavaScript file (`app.js`, all models, controllers, routes, utils, and the seed script) was checked with `node --check` and passes with no syntax errors. Every EJS template was compiled with the `ejs` package and passes with no syntax errors. `npm install` succeeds cleanly with the `package.json` provided. A live end-to-end run against a real MongoDB instance was not possible in the environment this was built in (no MongoDB server available), so please run through the seed script and demo flow above as your first step after installing — if anything doesn't behave as described, it's most likely worth double-checking your `.env` values first.
