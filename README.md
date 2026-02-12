# Attendify - Intelligent Attendance Analyzer

Attendify is a robust, role-based attendance management and analysis system built with the MERN stack. It streamlines the process of tracking attendance, providing real-time insights and secure access for Admins, Teachers, and Students.

## 🚀 Features

-   **Role-Based Access Control (RBAC):** Distinct dashboards and functionalities for Admins, Teachers, and Students.
-   **Secure Authentication:** JWT-based authentication with secure password hashing.
-   **Real-time Attendance Tracking:** Efficient marking and retrieval of attendance data.
-   **Analytics Dashboard:** Visual insights into attendance trends (using Recharts).
-   **Modern UI:** Built with React, Tailwind CSS, and Lucide React for a responsive and premium experience.

## 🛠️ Tech Stack

-   **Frontend:** React (Vite), Tailwind CSS, React Router DOM, Recharts, Lucide React
-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB (Mongoose)
-   **Authentication:** JSON Web Tokens (JWT), bcryptjs

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/sobikam22/Attendify.git
    cd Attendify
    ```

2.  **Setup Backend**
    ```bash
    cd server
    npm install
    # Create a .env file with your credentials (PORT, MONGO_URI, JWT_SECRET)
    npm start
    ```

3.  **Setup Frontend**
    ```bash
    cd ../client
    npm install
    npm run dev
    ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
