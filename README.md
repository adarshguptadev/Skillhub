# SkillHub – Student Learning Web Platform
SkillHub helps students follow a structured learning path instead of random YouTube hopping.


This is a **student-focused web platform** designed to provide **personalized learning resources** based on student type and interests.  
Students can login and access their **daily quiz, roadmap, YouTube tutorials, and explore lessons** for efficient learning without wasting time.  

The platform also includes an **admin panel** to manage all content and users.
---
## 🌐 Live Demo
Live: [skillhub.adarshguptadev.in/home](https://skillhub.adarshguptadev.in/home)
---

## 🚀 Features
### Student Features:
- Student login and forgot password functionality
- Personalized Home page based on student type:
  - Web Development
  - AI/ML
  - Data Science
  - DSA
  - Programming
- Daily quizzes
- Roadmaps (study plans)
- Free YouTube tutorial links per subject
- Explore lessons (articles or documentation links)
- Open external links for learning resources

### Admin Features:
- A maximum of **2 admin accounts** are allowed.
- Admin registration is **restricted and not public**.
- Admin accounts are created manually by the system owner.
- Admin login
- CRUD (Create, Read, Update, Delete) for:
  - Roadmaps
  - Quizzes
  - YouTube tutorials
  - Explore lessons (articles/docs)
- View all registered users

---

## 🛠️ Tech Stack
- Frontend: React, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB
- Deployment: Vercel (frontend), Render (backend)
- Email Functionality : Forgot Password and Welcome emails are handled using Resend API

---

## 📦 Installation
Clone the repository

```bash
git clone https://github.com/Adarshgupta0/Skillhub.git
cd Skillhub
```
---
## Backend Setup
```bash
cd backend
npm install
```
## 🔐 Create .env file in backend folder
Create a file named .env inside the backend directory and add the following environment variables:
```
# Database Configuration
DB_CONNECT=mongodb://127.0.0.1:27017/skillhub

# Frontend URL
FRONTEND_URL=your_frontend_url

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Cloudinary Configuration
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
CLOUD_NAME=your_cloudinary_cloud_name

# Resend API Configuration (Email Service)
SENDER_EMAIL=your_sender_email
RESEND_API_KEY=your_api_key
```
---
## Frontend Setup
```bash
cd frontend
npm install
```
## 🔐 Create .env file in frontend folder
Create a file named .env inside the frontend directory and add:
```
VITE_BACKEND_URL=your_backend_url
```
---
## Start Frontend Server
```
npm run dev
```
## Start Backend Server
```
npm start
```
