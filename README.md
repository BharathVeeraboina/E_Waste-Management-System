# ♻️ E-Waste Management System (E-Auth)

![Java](https://img.shields.io/badge/Java-17-red?style=for-the-badge\&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-brightgreen?style=for-the-badge\&logo=springboot)
![React](https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge\&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue?style=for-the-badge\&logo=mysql)
![Status](https://img.shields.io/badge/Status-Milestone_3_Complete-success?style=for-the-badge)

---

## 📌 Project Overview

The **E-Waste Management System (E-Auth)** is a full-stack platform that digitizes the process of electronic waste disposal and logistics.

It connects **users**, **administrators**, and **pickup agents** to ensure a smooth, secure, and trackable recycling workflow.

🎯 **Goal:**
To build a **real-world scalable system** that manages e-waste collection, verification, logistics, and field operations with secure tracking and verification.

---

## ✨ Features

### 👤 User Portal

* 🔐 JWT-based authentication
* 📝 Submit e-waste requests with full device details
* 📸 Upload up to **5 images** for verification
* 📊 Track request status
* 👤 Profile & address management

---

### 🔑 Admin Portal

* 📋 View all requests
* ✅ Approve / ❌ Reject requests with feedback
* 📅 Schedule pickups
* 🚚 Assign **Pickup Agents**
* 👥 Access user details for logistics

---

### 🚚 Pickup Agent Role

* 📍 View assigned pickup requests
* 🧭 Navigate using **Google Maps integration**
* 🔐 Verify pickup using **OTP authentication**
* 📦 Confirm successful collection
* 📊 Update pickup status
* 📧 Receive assignment notifications

---

## 💻 Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | React.js (Vite), Axios, Bootstrap 5     |
| Backend  | Java 17, Spring Boot 3, Spring Data JPA |
| Database | MySQL                                   |
| Security | JWT Authentication, Spring Security     |
| Storage  | Multipart File Upload                   |

---

## ⚙️ Setup & Installation

### Backend

```bash
cd ewaste-backend
mvn clean spring-boot:run
```

### Frontend

```bash
cd ewaste-frontend
npm install
npm run dev
```

---

## 🔐 Authentication

```
Authorization: Bearer <your_token>
```

---

## 📊 Project Status

### ✅ Completed

* JWT Authentication
* Role-Based Access Control
* E-waste request system
* Admin dashboard
* Pickup assignment system
* OTP verification
* Email notifications
* Google Maps integration

---

### 🔄 Pending

* Deployment
* Performance optimization

---

## 🏆 Achievements

* 🎓 Certified for **10+ project contributions**
* 🔥 Built real-world logistics workflow system
* 🔐 Implemented OTP-based verification system

---

## 👨‍💻 Author

**Veeraboina Bharath**

🔗 GitHub: [https://github.com/BharathVeeraboina](https://github.com/BharathVeeraboina)

---

## 📜 License

MIT License
