# 🚀 Saimohan's Portfolio

A modern, responsive portfolio website with a dark-themed UI, animated interactions, a working contact form backed by **Supabase**, and a dedicated admin dashboard to manage messages — all deployable on **Vercel** with zero configuration.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Responsive UI with animations |
| **Backend** | Node.js, Express.js | REST API server |
| **Database** | Supabase (PostgreSQL) | Cloud-hosted message storage |
| **Deployment** | Vercel | Serverless hosting with API rewrites |
| **Fonts** | Google Fonts (Inter) | Clean, modern typography |

### Frontend Details
- **CSS Custom Properties** — Centralized theming with CSS variables (`--primary`, `--bg-dark`, etc.)
- **Flexbox & CSS Grid** — Fully responsive layouts without any CSS framework
- **CSS Animations & Transitions** — Smooth hover effects, fade-ins, and skill bar fills
- **Intersection Observer API** — Triggers animations (skill bars, stat counters, fade-ins) on scroll
- **Backdrop Filter** — Frosted-glass navbar effect

### Backend Details
- **Express.js** server with CORS, JSON body parsing, and static file serving
- **Vercel Serverless Functions** — Separate API handlers in `/api/contact.js` and `/api/messages.js` for serverless deployment
- **Supabase REST API** — Direct HTTP calls to Supabase's PostgREST endpoints (no SDK dependency)
- **API Key Authentication** — Admin routes are protected with an `x-api-key` header

---

## ✨ Features

### 🎨 Portfolio Website (`index.html`)
- **Hero Section** — Animated code-window visual with a greeting and CTA buttons
- **About Section** — Bio with animated stat counters (projects, experience, clients)
- **Skills Section** — Skill cards with animated progress bars that fill on scroll
- **Projects Section** — Filterable project gallery (All / Web Apps / Design / Mobile) with hover overlays
- **Contact Form** — Fully functional form that submits messages to the Supabase database via the API
- **Responsive Navbar** — Sticky navigation with scroll-based highlighting and a hamburger menu for mobile
- **Back to Top Button** — Appears on scroll for quick navigation
- **Dark Theme** — Elegant dark UI with gradient accents and glow effects

### 🔧 Admin Dashboard (`admin.html`)
- **Message Management** — View all contact form submissions in a clean card layout
- **Live Stats** — Total message count and today's message count
- **Delete Messages** — Remove individual messages with a single click
- **API Key Protection** — Dashboard is secured with an API key
- **XSS Protection** — All displayed content is HTML-escaped

### ⚡ Performance & UX
- **No external JS/CSS frameworks** — Pure vanilla implementation for fast load times
- **Smooth scroll** with `scroll-behavior: smooth` and `scroll-padding-top`
- **Lazy animations** via Intersection Observer (only animate when visible)
- **Mobile-first responsive design** with hamburger navigation

---

## 📁 Project Structure

```
portfolio/
├── index.html          # Main portfolio page
├── admin.html          # Admin dashboard for messages
├── styles.css          # All styles (947 lines of custom CSS)
├── script.js           # Frontend interactions & form handler
├── server.js           # Express.js server (local development)
├── package.json        # Node.js dependencies
├── vercel.json         # Vercel deployment config & API rewrites
├── portfolio.db        # Local SQLite DB (legacy/unused)
├── .gitignore          # Git ignore rules
├── api/
│   ├── contact.js      # Serverless function — POST /api/contact
│   └── messages.js     # Serverless function — GET/DELETE /api/messages
└── README.md           # You are here!
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A [Supabase](https://supabase.com/) project with a `messages` table

### Supabase Table Schema

Create a `messages` table in your Supabase project:

```sql
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Installation

```bash
# Clone the repository
git clone https://github.com/Saimohan80747/portfolio.git
cd portfolio

# Install dependencies
npm install

# Start the server
npm start
```

The server will start at **http://localhost:3000**.

### Environment Variables (Optional)

Set these to override the defaults:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/contact` | None | Submit a contact message |
| `GET` | `/api/messages` | `x-api-key` | Get all messages (admin) |
| `DELETE` | `/api/messages?delete={id}` | `x-api-key` | Delete a message by ID |

### Example — Submit a message

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","subject":"Hello","message":"Great portfolio!"}'
```

---

## 🌐 Deployment

This project is configured for **one-click Vercel deployment**:

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Set environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) in Vercel dashboard
4. Deploy — Vercel will automatically use the serverless functions in `/api/`

The `vercel.json` handles routing/rewrites so the API endpoints work seamlessly.

---

## 📸 Screenshots

> _Add screenshots of your portfolio here!_
>
> Tip: Take screenshots of the Hero section, Skills section, Projects grid, Contact form, and the Admin dashboard, then place them in a `/screenshots` folder and reference them here.

---

## 🙏 Author's Note

Hey there! I'm **Saimohan**, a passionate full-stack developer who loves building things from scratch. This portfolio is a reflection of my journey — from writing my first line of HTML to deploying full-stack applications with cloud databases and serverless functions.

Every pixel, every animation, and every API route in this project was crafted with care. No UI frameworks, no shortcuts — just pure HTML, CSS, and JavaScript. I believe in understanding the fundamentals before reaching for abstractions, and this project is proof of that philosophy.

If you've made it this far, thank you for checking out my work! Feel free to reach out through the contact form — it actually works 😄

**Keep building. Keep learning. Keep shipping.** 🚀

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Saimohan80747">Saimohan</a>
</p>
