## 🌐 Frontend (React + Vite)

The frontend is built using **React 19** with **Vite** for fast development and **Tailwind CSS** for styling.  
It communicates with the backend via **Axios** and provides a smooth authentication experience.

---

## 📦 Frontend Dependencies

### Core
- **react** – UI library
- **react-dom** – React DOM renderer
- **react-router-dom** – Client-side routing
- **axios** – HTTP requests
- **react-toastify** – Notifications

### Styling
- **tailwindcss** – Utility-first CSS framework
- **@tailwindcss/vite** – Tailwind integration with Vite

### Dev Tools
- **vite** – Development server & bundler
- **eslint** – Code linting
- **@vitejs/plugin-react** – React support for Vite

---





## ⚙️ Frontend Environment Variables

Create a `.env` file inside the **Auth-frontend** directory and add the following variables:

```env
VITE_BACKREND_URL ="http://localhost:8000/api/v1/users"
```