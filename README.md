# 🌿 GreenLens: Scan Smarter, Shop Greener

**GreenLens** is a web app that lets users **upload a product photo** or **enter its name**, then uses **AI to rate its sustainability** — from energy use to ethical impact.

By analyzing a product’s full environmental and ethical footprint — from **energy consumption** to **ecosystem impact** — GreenLens empowers users to **shop smarter and live greener**.  
Through **data transparency**, **gamified learning**, and **accessible design**, we turn sustainability awareness into meaningful daily action.

---

## 🌎 Mission

**To make sustainability accessible** by empowering people to instantly understand the environmental impact of every product they analyze.

---

## 💚 Values

- **Transparency, Awareness, and Action** — Everyone deserves clear insight into how their choices affect the planet.  
- **AI-Driven Insight** — Sustainability scores are grounded in data and explained through ethical, transparent AI reasoning.  
- **Empowerment Through Design** — Simple, engaging interfaces turn awareness into real change.

---

## 🎯 Purpose

To transform shopping into a sustainable act — one upload at a time.  
GreenLens helps consumers make **informed, eco-friendly decisions effortlessly**.

---

## 🔍 How It Works — The “GREEN” Framework

| Letter | Meaning | Description |
|---------|----------|-------------|
| **G – Green Energy** | AI shows estimated **energy used in production** and **emissions from transportation**. |
| **R – Reduce Waste** | Suggests ways to **reuse, recycle, or upcycle** the product. |
| **E – Ethical AI** | AI provides **transparent explanations** for its sustainability reasoning. |
| **E – Environment & Ecosystems** | Highlights impact on **wildlife, water, or forests** (e.g., “Palm oil → deforestation risk”). |
| **N – Novelty** | Generates an **AI-powered “GreenScore” (1–100)** with **color-coded feedback** for eco-friendly habits. |

---

## 🧩 Core Features

- 🖼️ **AI Scanner** – Upload or scan a product photo to evaluate its sustainability score.  
- 🔍 **Search by Name** – Enter a product’s name to get instant sustainability insights.  
- 🧠 **AI Analysis** – Explains its reasoning for every rating, making sustainability transparent.  
- 📊 **GreenScore Meter** – Interactive scoring system (1–100) that encourages greener shopping.  
- 🔐 **User Authentication** – Secure login and registration connected to our backend.  
- 🎨 **Responsive UI** – Clean, modern interface inspired by [Bootstrap Product Theme](https://getbootstrap.com/docs/5.3/examples/product/).

---

## 💻 Tech Stack

### **Frontend:**
- [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- [Bootstrap 5.3](https://getbootstrap.com/) for structure and responsiveness
- Custom CSS for cohesive branding
- Real-time **form validation** using React hooks

### **Backend:**
- Hosted on **Render**
- REST API for authentication and sustainability data
- JSON-based communication between front end and back end

### **Database:**
- Hosted on Render
- Stores user credentials and scanned product data

---

## 🧠 Project Tasks & Workflow

### **Wireframing**
- Designed the layout for all major pages (Home, Scanner, Login, Register).
- Focused on a clean, user-centered experience with clear navigation.

### **Branding**
- Created the **GreenLens logo** and cohesive **color palette**:
  - Primary Green: `#1E9E1A`
  - Accent Green: `#cde7b0`
- Developed the tagline: *“Scan Smarter, Shop Greener.”*

### **Homepage**
- Communicates mission, values, and purpose.
- Educates users with sustainability facts and the “GREEN” framework.

### **API Connection**
- Connected frontend to backend hosted on Render.
- Handles secure `POST` and `GET` requests for authentication and scanning.

### **Authentication (Sign In / Register)**
- Built responsive forms for login and registration.
- Added client-side validation and custom error messaging.
- Only **username + password** supported for login.

### **Scanner Page**
- Designed for intuitive use — upload a photo or type product name.
- Displays GreenScore and detailed sustainability insights.

### **Database Integration**
- Stores user and scan data securely.
- Enables persistent tracking of user activity (future update).

### **Form Validation**
- Inline red error messages appear only when inputs are invalid.
- Enhances accessibility and user feedback.

---

## 🌐 Deployment

**Frontend & Backend hosted on:** [Render](https://render.com)

To run locally:
```bash
# Clone the repository
git clone https://github.com/yourusername/greenlens.git

# Navigate to the project
cd greenlens

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## 🖼️ Branding Overview

| Element | Description |
|----------|--------------|
| **Logo** | GreenLens SVG logo visible in navbar and footer |
| **Primary Color** | `#1E9E1A` – Deep eco green |
| **Accent Color** | `#cde7b0` – Soft, sustainable green |
| **Typography** | Clean sans-serif fonts for accessibility |

---

## 👩‍💻 Team

Developed by:
- **Amy**
- **Teh**
- **Edgardo**
- **Nia**

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
