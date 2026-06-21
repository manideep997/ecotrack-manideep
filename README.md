<div align="center">

### 🏆 Google for Developers x Hack2Skill: PromptWars (Virtual) 🏆
*An Official "Build with AI" Competition Submission by Manideep*

```text
  ___          _____             _    
 | __|__ ___  |_   _| _ __ _ __| |__ 
 | _|/ _/ _ \   | || '_/ _` / _| / /
 |___\__\___/   |_||_| \__,_\__|_\_\
```

**Because the Earth doesn't have a backup.**

<br/>

[![PromptWars](https://img.shields.io/badge/Competition-PromptWars_Virtual-4285F4?style=for-the-badge&logo=google)](#)
[![Status](https://img.shields.io/badge/Status-Beta_Active-10b981?style=for-the-badge)](#)
[![Theme](https://img.shields.io/badge/UI_Design-Glassmorphism-0ea5e9?style=for-the-badge)](#)
[![AI](https://img.shields.io/badge/Intelligence-Gemini_Core-f59e0b?style=for-the-badge)](#)

</div>

<br/>

> *EcoTrack is not a spreadsheet. It is a live, breathing interface built to combat climate fatigue. Through advanced data visualization and AI-driven insights, it transforms environmental accountability from a chore into a seamless digital experience.*

<br/>

### ✦ The Architecture
Instead of standard dashboards, EcoTrack is built on a **Deep Glassmorphism** framework. The interface floats above the background, featuring dynamic toxic-subcategory analysis, cumulative trajectory tracking, and real-time emission recalculations based on your global city context.

### ✦ The Intelligence
Integrated directly into the core loop is the **Eco-Assistant**. It doesn't just record your data; it analyzes your daily carbon spikes and offers hyper-contextualized, AI-powered reduction strategies on the fly. 

### ✦ The Security Layer
Say goodbye to generic, boring email logins. EcoTrack uses **Real-Time SMS Authentication** for a premium onboarding experience, falling back to an elegant Mock-OTP layer for larger testing teams. User sessions are cryptographically isolated ensuring absolute data privacy.

<br/>

## 🛠 Operation Manual

*Engineers and testers, follow the boot sequence below to initialize the platform locally.*

<details>
<summary><b>[ Click to expand Boot Sequence ]</b></summary>
<br/>

**1. Clone the environment**
```bash
git clone https://github.com/manideep997/carbon-platform.git
cd carbon-platform
```

**2. Install core dependencies**
```bash
npm install
```

**3. Configure the uplink**
Copy `.env.example` to `.env.local` and inject your Vercel Postgres credentials.
```bash
cp .env.example .env.local
```

**4. Synchronize the database**
```bash
npx prisma db push
```

**5. Ignite the server**
```bash
npm run dev
```

*Finally, visit [https://carbon-platform-manideeps-projects-03a20b11.vercel.app](https://carbon-platform-manideeps-projects-03a20b11.vercel.app) to access the live interface.*

</details>

<br/>

<div align="center">
  <code>System.out.println("Built for a sustainable tomorrow.");</code>
</div>
