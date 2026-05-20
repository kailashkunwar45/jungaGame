# 🏛️ Ranas of Nepal: Hanuman Dhoka Living District Sandbox

A premium, highly-immersive open-world vertical slice and interactive companion app set during the rise of **Jung Bahadur Rana** in 19th-century Nepal. Inspired by high-fidelity gameplay loops like *Ghost of Tsushima*, *Assassin's Creed*, and *GTA*, this project blends advanced Unreal Engine 5 C++ subsystems with a glassmorphic HTML5 client-side dashboard sandbox.

---

## 🎮 Interactive Web Companion & Sandbox
The companion app serves as an interactive demonstration of the open-world mechanics, running completely serverless and client-side (built on HSL color systems, Web Audio API, and persistent storage):

* **Secure Faction Gateway**: Immersive login and registration overlay allowing courtiers to authenticate their noble lineage.
* **Persistent Lineage Stats**: Automatically saves and loads your gold, health, equipped armaments, active quest stage, and unlocked achievements directly using browser storage (`localStorage` and `sessionStorage`).
* **Intruder Alert System**: Entering an incorrect password signals the palace guards, raising the wanted level by **15 points** and triggering combat warnings.
* **Interactive Palace Map**: Explore *Taleju Bazaar*, *Kot Courtyard*, *Palace Interiors*, and the *Safehouse* with real-time random encounter checks.
* **Authentic Nepalese Kauda**: A physical cowrie shell gambling board allowing you to place stakes on traditional face-up shell bets.
* **Temple Sparring Arena**: Spar with Royal Guard captains or rival nobles, compiling real-time strike and parry log traces.
* **Procedural Soundboard Synthesizers**:
  * *Himalayan Torrent*: Low-pass filtered procedural rain with periodic rolling thunder.
  * *Sarangi Whispers*: Micro-tonal string raga slides playing minor scales.
  * *Himalayan Breath*: Mellow Bansuri flute solos with vibratos.
  * *Rana War Drums*: 110 BPM low-pass kick drum and woodblock Madal rhythms.

---

## 🏛️ Unreal Engine 5 C++ Core Systems
The repository contains modular C++ classes designed for easy integration into an active UE5 project:
* **`AProtagonistCharacter`**: Controls weapon switches (Gurkha Khukuris, cavalry Talwars, heavy sacrificial Koras, flintlock Muskets), stamina scaling, blocking states, and active input bindings.
* **`AHorseVehicle`**: A physics-driven rideable mount controller managing galloping, equine stamina, and skeletal attachment snapping.
* **`ANpcCitizenCharacter`**: A dynamic citizen AI class shifting state machines among four specific routines (*Work*, *Gossip*, *Patrol*, *Rest*) based on the Time of Day clock.
* **`APoliticalThreatSystem`**: Monitors player threat points (0-100) and shifts world parameters (double patrol counts, lock gates, checkpoints, treason hunt status) across five distinct tiers.
* **`UQuestMissionManager`**: World Subsystem managing quest milestones, dialogue, waypoint coordinates, and reward distribution.

---

## 🌐 Instant Free Deployment
Because the companion app is static, you can deploy it to **Render**, **Netlify**, or **Vercel** with zero backend database dependencies.

### Deploy to Render:
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Static Site**.
3. Connect this GitHub repository.
4. Leave **Build Command** blank, and set **Publish Directory** to `.` (or `ShowcaseApp` depending on your directory structure).
5. Click **Create Static Site** to go live!
