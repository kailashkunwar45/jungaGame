# 🏛️ Ranas of Nepal: Hanuman Dhoka Sandbox

A premium open-world vertical slice companion app set during the rise of **Jung Bahadur Rana** in 19th-century Nepal. Blends modular Unreal Engine 5 C++ subsystems with a glassmorphic HTML5 client-side dashboard sandbox.

---

## 🎮 Web Companion Sandbox
Runs serverless and client-side using native HSL color systems, Web Audio API, and local storage:

* **Secure Faction Gateway**: Faction selection and parchment-style gatehouse login.
* **Persistent Lineage Stats**: Auto-saves gold, health, weaponry, quest stage, and achievements to `localStorage`.
* **Intruder Alert System**: Entering an incorrect passcode increases the wanted threat level by **15 points**.
* **Interactive District Map**: Explore Taleju Bazaar, Kot Courtyard, Palace, and Safehouse with random encounters.
* **Authentic Kauda**: Physics-based cowrie shell gambling board with traditional bets.
* **Dueling Arena**: Spar against guard captains using real-time strike and parry console logs.
* **Procedural Synthesizers**: Real-time Web Audio synths representing monsoon torrents, classical D-minor Sarangi ragas, Bansuri flutes, and Madal war drums.

---

## 🏛️ Unreal Engine 5 C++ Systems
Located under `Source/HistoricalRana/` for modular UE5 integration:
* **`AProtagonistCharacter`**: Controls weapon swings, blocking, sprinting, and inventory slots.
* **`AHorseVehicle`**: A physics-driven rideable mount controller with galloping stamina.
* **`ANpcCitizenCharacter`**: Scheduled AI routines (*Work*, *Gossip*, *Patrol*, *Rest*) linked to the Time of Day clock.
* **`APoliticalThreatSystem`**: Escalates wanted stars, closes palace gates, and spawns checkposts.
* **`UQuestMissionManager`**: World Subsystem managing the 5 quest stages of the Kot Massacre story.

---

## 🚀 Deployment (Zero-Config)
Since the app has **zero `.env` dependencies**, you can host it for free on **Render**, **Netlify**, or **Vercel** in seconds:

1. Create a **Static Site** on Render.
2. Link your GitHub repository (`kailashkunwar45/jungaGame`).
3. Leave **Build Command** blank.
4. Set **Publish Directory** to `.` and deploy!
