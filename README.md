# 🧠 SmartSense – Python Conversational Analytics Assistant

SmartSense is a Python-based insight engine that lets you explore marketing and campaign data using natural language. It converts plain English queries into dynamic KPIs, visualizations, and summaries—on the fly.

---

## 🚀 Features

### 🔍 Natural Language Querying
- Accepts prompts like:  
  “Show me leads by region for June”  
  “Now compare it with Q1”

### 🧠 Intent Parsing & Prompt Understanding
- Extracts:
  - Metrics (sales, leads, etc.)
  - Dimensions (region, campaign, source)
  - Timeframes (last month, Q2)
  - Filters (country = India)

### 📊 Dynamic Visualizations
- Auto-generates:
  - Bar, Line, and Pie charts
  - KPI cards
- Uses libraries like `Plotly`, `Matplotlib`, or `Altair`

### 🗂 Dataset Query Engine
- Reads CSV or connects to SQL/NoSQL sources
- Easily extendable for new data schemas

### 💬 Multi-turn Context Memory
- Maintains conversation flow with tools like:
  - LangGraph
  - LangChain Memory
  - Custom RAG pipelines

---

## ✨ Optional Add-ons

- 🔺 Anomaly Detection (via `scikit-learn`, `statsmodels`)
- 🎙️ Voice Command Support (Whisper/OpenAI API)
- 📤 PDF/PNG Export with `WeasyPrint` or `pdfkit`
- 💾 Saved Query Templates

---

## 📦 Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/your-username/smartsense.git
cd smartsense
