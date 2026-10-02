# 🎬 PromptReel — Scene Prompt Studio

> ออกแบบพร้อมต์สร้าง **รูปภาพและวิดีโอเป็นฉากๆ ต่อเนื่อง** จากไอเดีย รูป หรือคลิป
> อัปโหลดสื่อ → AI วิเคราะห์และจินตนาการ → ได้ชุดพร้อมต์สูงสุด 10 ฉากต่อครั้ง พร้อมคัดลอกไปใช้ทันที

🔗 **Deploy:** Vercel
🤖 **AI:** รองรับหลายผู้ให้บริการ — OpenRouter (แนะนำ) / xAI Grok / Z.AI GLM
🧩 **สถาปัตยกรรม:** พอร์ตมาจาก Panya-AI (Next.js + Vercel + OpenRouter) มาทำงานบน TanStack Start + Nitro Vercel preset

---

## ✨ Features

### 🎛️ Director Console
- **เลือกผลลัพธ์:** รูปภาพ (สตอรี่บอร์ดภาพนิ่ง) หรือ วิดีโอ (คลิปต่อเนื่องทีละตอน)
- **เริ่มจาก:** ไอเดียข้อความ / รูปภาพต้นฉบับ / คลิปวิดีโอ (ระบบสกัดเฟรมต้น–กลาง–ท้ายอัตโนมัติ)
- **จำนวนฉาก 4–10 ต่อครั้ง** (ค่าเริ่มต้น 10)
- **สไตล์ภาพ 8 แบบ:** ซีนีมาติก, สารคดี, อนิเมะ, การ์ตูน 3D, แฟนตาซี, ฟิล์มย้อนยุค, ไซเบอร์พังก์, สีน้ำ
- **อัตราส่วนภาพ:** 16:9, 9:16, 1:1, 4:3

### 🎬 โหมดวิดีโอ (เวิร์กโฟลว์ต่อเนื่อง)
1. ฉากที่ 1 — ใช้คู่กับรูป/คลิปต้นฉบับ: คำสั่งไทยขึ้นต้น
   *"จากรูปภาพนี้ ช่วยสร้างวีดีโอต่อเนื่องตามจินตนาการให้หน่อยครับ."*
2. ฉากที่ 2 เป็นต้นไป — ส่งคลิปที่เพิ่งสร้าง พร้อมคำสั่ง:
   *"จากคลิปวีดีโอนี้ ช่วยสร้างวีดีโอต่อเนื่องตามจินตนาการให้หน่อยครับ."*
3. เครื่องมือสร้างวิดีโอมัก merge คลิปเดิมไว้ตอนต้น → คลิปยาวขึ้นเรื่อยๆ (เช่น 10 → 20 วินาที)
   พร้อมต์อังกฤษจะระบุ `continue seamlessly from the last frame` และเป้าหมายคลิปต่อเนื่อง ~20 วินาที

### 🖼️ โหมดรูปภาพ (สตอรี่บอร์ด)
- แต่ละฉากเป็น text-to-image prompt สมบูรณ์ในตัว สร้างแยกใบได้
- มุมกล้องหลากหลาย (wide / close-up / low angle / aerial)
- **Identity lock** — คำอธิบายตัวละคร ยานพาหนะ โลโก้ โทนสี ถูกเขียนซ้ำเป๊ะทุกฉากเพื่อให้หน้าตาเหมือนเดิม

### 📋 ผลลัพธ์ต่อฉาก
| ฟิลด์ | คำอธิบาย |
|---|---|
| `titleTh` | ชื่อฉากภาษาไทย |
| `descriptionTh` | คำอธิบายเหตุการณ์ 1–2 ประโยค |
| `promptEn` | พร้อมต์อังกฤษ 60–130 คำ พร้อมแสง มุมกล้อง เลนส์ คุณภาพ |
| `promptTh` | คำสั่งไทยพร้อมวางในแชท AI ทันที |
| `continuityNote` | ฉากนี้ต่อจากฉากก่อนอย่างไร + ควรแนบสื่ออะไร |

### 🗂️ ประวัติ
- เก็บชุดพร้อมต์ล่าสุด 40 รายการ (localStorage) พร้อม thumbnail
- ปุ่ม **"ต่ออีก 10 ฉากจากเรื่องนี้"** — ส่งบริบทเรื่องเดิมให้ AI เดินเรื่องต่อโดยไม่ย้อนเล่า

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Framework | TanStack Start (React 19 + Vite + TanStack Router) |
| Server | Nitro 3 — preset `vercel` |
| Styling | Tailwind CSS 4 + shadcn-style components |
| State | Zustand (history, persist) |
| Fonts | IBM Plex Sans Thai + Anuphan + IBM Plex Mono |
| AI | Multi-provider LLM client (OpenRouter / xAI / Z.AI) |
| Deploy | Vercel (GitHub auto-deploy จาก branch `main`) |

---

## 📁 Project Structure

```
src/
├── routes/
│   ├── index.tsx        # Director Console (หน้าสตูดิโอ)
│   └── history.tsx      # ประวัติการสร้าง
├── lib/
│   ├── llm-client.ts    # Multi-provider LLM client (พอร์ตจาก Panya-AI zai-client)
│   ├── generate.ts      # Server function: system prompt + เรียก AI + แปลงผลลัพธ์
│   ├── studio.ts        # Contracts: ScenePrompt, SceneBundle, STYLE_OPTIONS
│   ├── media.ts         # ย่อรูป / สกัดเฟรมจากคลิป (client-side canvas)
│   └── history-store.ts # Zustand persist store
├── components/
│   ├── app-shell.tsx    # Header + nav
│   └── scene-card.tsx   # การ์ดพร้อมต์รายฉาก + ปุ่มคัดลอก
public/
└── samples/             # รูปตัวอย่าง
```

---

## 🚀 Deployment (Vercel)

1. Import repo นี้ใน Vercel (framework: Other — ใช้ `vercel.json` ที่ให้มา)
2. ตั้งค่า Environment Variables อย่างน้อย 1 ตัว:

```
OPENROUTER_API_KEY=sk-or-...        # แนะนำ — ภาษาไทยเพลง มีโมเดลฟรี
# OPENROUTER_MODEL=inclusionai/ling-3.0-flash:free
# OPENROUTER_VISION_MODEL=google/gemini-2.0-flash-exp:free
# XAI_API_KEY=xai-...               # ทางเลือก: xAI Grok
# Z_AI_API_KEY=...                  # ทางเลือก: Z.AI GLM
```

3. Deploy — build จะรัน `vite build` ผ่าน Nitro preset `vercel` อัตโนมัติ

> ลำดับการเลือก provider: **OpenRouter → xAI → Z.AI** (ตัวแรกที่มี key จะถูกใช้)
> งานที่แนบรูป/เฟรมคลิปจะสลับไปใช้โมเดล vision โดยอัตโนมัติ (OpenRouter)

## 💻 Local Development

```bash
npm install
cp .env.example .env      # ใส่ OPENROUTER_API_KEY (หรือ key ของ provider อื่น)
npm run dev               # http://localhost:8080
```

---

## 📝 License

Proprietary — Siriwat08
