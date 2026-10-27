# Obrive - Practical AI & LLM Systems for Enterprises

Official website for Obrive LLM Services — engineering practical Large Language Model applications, RAG & enterprise knowledge systems, agentic workflows, and document intelligence.

---

## 🚀 Tech Stack

- **Framework**: Vite + Vanilla JavaScript (ES Modules)
- **Styling**: Modern CSS with Obrive design system (responsive, bespoke typography, microgrammaBold)
- **3D Graphics**: Three.js WebGL interactive particle sphere & network simulation
- **Animations**: GSAP (GreenSock) + AOS (Animate on Scroll)
- **Lead Capture**: Google Sheets API integration via SheetDB webhook

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yash-obrive/llm.git
cd llm
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 4. Build for production
```bash
npm run build
```
Production assets are generated in the `dist/` directory.

---

## 📊 Google Sheets Integration

Form submissions automatically append to your Google Sheet:
1. Configure your SheetDB or Google Apps Script URL in `.env`:
   ```env
   VITE_GOOGLE_SHEET_URL="https://sheetdb.io/api/v1/YOUR_KEY"
   ```
2. See [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) for full configuration details.

---

## 📄 License

© 2026 Obrive Industries Private Limited. All rights reserved.
