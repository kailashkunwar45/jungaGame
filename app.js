// RANAS OF NEPAL - CINEMATIC COMPANION DASHBOARD & SANDBOX ENGINE
// Formatted to cleanly mirror Unreal Engine 5 C++ subsystems locally.

// ----------------------------------------------------
// 1. SYSTEM INITIALIZATIONS & CORE STATES
// ----------------------------------------------------
let playerStats = {
    health: 100,
    stamina: 100,
    equipped: "unarmed",
    mount: "dismounted",
    balance: 500,
    activeDistrict: "bazaar",
    threatLevel: 15, // Political Threat Level (0-100)
    unlockedAchievements: []
};

const factions = {
    royal: { name: "Royal Court", trust: 60, fear: 10, respect: 40 },
    bhardar: { name: "Bhardars (Nobles)", trust: 30, fear: 20, respect: 50 },
    military: { name: "Royal Nepalese Army", trust: 50, fear: 0, respect: 70 }
};

let currentHour = 12; // Time of day (6, 12, 18, 23)
let activeWeather = "clear";
let activeMissionStage = 1;

// ----------------------------------------------------
// 2. NPC LIVE SCHEDULE MATRIX (Dynamic AI Citizens)
// ----------------------------------------------------
const npcs = [
    {
        id: "gagan",
        name: "PM Gagan Singh",
        role: "Prime Minister",
        schedules: {
            6: { district: "palace", activity: "Morning Royal Audience", x: 210, y: -160 },
            12: { district: "palace", activity: "State Council Chambers", x: 220, y: -180 },
            18: { district: "court", activity: "Reviewing Palace Guards", x: 15, y: -20 },
            23: { district: "palace", activity: "Secret Quarters Sleep", x: 245, y: -195 }
        }
    },
    {
        id: "queen",
        name: "Queen Rajya Lakshmi",
        role: "Reigning Queen",
        schedules: {
            6: { district: "palace", activity: "Temple Prayer Chambers", x: 230, y: -170 },
            12: { district: "palace", activity: "Private noble assemblies", x: 220, y: -180 },
            18: { district: "palace", activity: "Political Intrigue Council", x: 210, y: -190 },
            23: { district: "palace", activity: "Royal Quarters Sleep", x: 250, y: -210 }
        }
    },
    {
        id: "jung",
        name: "Jung Bahadur Rana",
        role: "Guard Captain",
        schedules: {
            6: { district: "court", activity: "Drilling Elite Regiments", x: 20, y: -45 },
            12: { district: "court", activity: "Patrolling Kot Courtyard", x: 15, y: -30 },
            18: { district: "bazaar", activity: "Bazaar Security Sweeps", x: -90, y: 410 },
            23: { district: "court", activity: "Midnight Gate Lock checks", x: 5, y: -15 }
        }
    },
    {
        id: "kaji_pande",
        name: "Kaji Prithvi Pande",
        role: "Rival Noble Leader",
        schedules: {
            6: { district: "palace", activity: "Whispering in Cabins", x: 195, y: -150 },
            12: { district: "bazaar", activity: "Leveraging Merchant Guilds", x: -110, y: 440 },
            18: { district: "palace", activity: "Anti-Rana Secret Coalition", x: 200, y: -175 },
            23: { district: "safehouse", activity: "Hiding in Safehouse Outpost", x: -410, y: -370 }
        }
    },
    {
        id: "priest",
        name: "Taleju Priest",
        role: "High Temple Priest",
        schedules: {
            6: { district: "bazaar", activity: "Dawn Taleju Aarti Prayers", x: -120, y: 450 },
            12: { district: "bazaar", activity: "Translating Sacred Scrolls", x: -130, y: 460 },
            18: { district: "bazaar", activity: "Distributing Holy Prasad", x: -125, y: 455 },
            23: { district: "bazaar", activity: "Temple Sanctuary Meditation", x: -120, y: 450 }
        }
    },
    {
        id: "merchant",
        name: "Bahadur Shrestha",
        role: "Spice & Khukuri Trader",
        schedules: {
            6: { district: "bazaar", activity: "Arranging Spices & Blades", x: -100, y: 420 },
            12: { district: "bazaar", activity: "Trading Brass & Musket Powder", x: -95, y: 430 },
            18: { district: "bazaar", activity: "Counting Gold Coin Revenue", x: -105, y: 425 },
            23: { district: "safehouse", activity: "Drinking at Bazaar Tavern", x: -400, y: -360 }
        }
    }
];

// ----------------------------------------------------
// 3. PLAYABLE INFILTRATION MISSION (5 Dynamic Stages)
// ----------------------------------------------------
const missionStages = {
    1: {
        title: "STAGE 1: MOUNT THE EQUINE STEED 🐎",
        quote: `"A general seizes gates, but a master diplomat seizes the city from horseback."`,
        narrative: `Kathmandu, 1845. Conspiracies surrounding PM Gagan Singh are escalating. To uncover the plans of the rival Pande nobles, you must infiltrate the sealed Palace compound. First, mount your noble equine steed at the Safehouse outposts. This triggers physics mounting in the UE5 wrapper.`,
        objective: "Mount the horse vehicle",
        choices: [
            {
                text: "🐎 Mount the Marwari Stallion",
                desc: "Trigger high-fidelity equine mounting physics. Stamina speeds will scale.",
                action: () => {
                    playerStats.mount = "mounted";
                    logCombat("[VEHICLE]: AHorseVehicle :: Player mounted stallion.", "player-action");
                    playSynthBeats(180, 0.2, "triangle"); // Horse whinny/clop click
                    unlockAchievement("mount");
                    advanceStage(2);
                }
            },
            {
                text: "👣 Stay on Foot & Inspect Armory",
                desc: "Walk towards the Palace district. Note: You need a mount to traverse patrols quickly!",
                action: () => {
                    logCombat("[WORLD]: Stables Master stops you. 'Noble Captain, the guards are searching the roads. Gallop the horse instead!'");
                }
            }
        ]
    },
    2: {
        title: "STAGE 2: TRAVEL TO TALEJU BAZAAR 🗺️",
        quote: `"Ride hard, but keep your steel hidden. The palace spies are everywhere."`,
        narrative: `Mounted on your stallion, you must ride towards Taleju Bazaar. However, the military has raised the alert. Standard gates are closed, and royal checkposts are patrolling. A direct ride might compromise your stealth.`,
        objective: "Navigate stallion to Taleju Bazaar district",
        choices: [
            {
                text: "⚡ Gallop through main road checkpoints (Stamina Drain)",
                desc: "Charges forward at 12m/s. Drains horse stamina. Wanted Threat scales +20.",
                action: () => {
                    playerStats.stamina = Math.max(10, playerStats.stamina - 30);
                    adjustThreatLevel(20);
                    logCombat("[PHYSICS]: AHorseVehicle :: Galloping fast. Checkpoint guards shouted alerts!", "clash");
                    travelToDistrict("bazaar");
                    advanceStage(3);
                }
            },
            {
                text: "👤 Sneak through the Northern Forest Paths",
                desc: "Avoid checks silently. Keeps wanted threat stable, but takes longer.",
                action: () => {
                    logCombat("[STEALTH]: Navigated forest paths. Avoided military checkpoint. Slipped into Bazaar.", "player-action");
                    travelToDistrict("bazaar");
                    advanceStage(3);
                }
            }
        ]
    },
    3: {
        title: "STAGE 3: INFILTRATE PALACE CORRIDORS 🏛️",
        quote: `"A locked palace gatehouse is simply a riddle waiting to be answered in gold or blood."`,
        narrative: `You have arrived at the Hanuman Dhoka gatehouse, but the main palace interior is locked under military quarantine. Royal guards are standing watch at the heavy wooden gates. You must find a bypass into the royal corridors.`,
        objective: "Gain entrance into Palace Interiors",
        choices: [
            {
                text: "🪙 Bribe the Gate Guard (100 Gold Coins)",
                desc: "Use gold to buy entry. Increases Bhardar standing. Reduces Threat by 10.",
                action: () => {
                    if (playerStats.balance >= 100) {
                        playerStats.balance -= 100;
                        adjustFaction("bhardar", 15, -10, 10);
                        adjustThreatLevel(-10);
                        logCombat("[DIPLOMACY]: Bribed Gate Guard with 100 Gold Coins. Gates unlocked.", "player-action");
                        travelToDistrict("palace");
                        advanceStage(4);
                    } else {
                        logCombat("[WORLD]: Insufficient gold! Stable master suggests scaling the wooden pillars.", "clash");
                    }
                }
            },
            {
                text: "🧗 Scale the carved wooden pillars (Stealth Climb)",
                desc: "Perform a dexterity sweep climb up the brickwork. Drains 40 player stamina.",
                action: () => {
                    playerStats.stamina = Math.max(0, playerStats.stamina - 40);
                    logCombat("[PHYSICS]: Protagonist climbed palace pillars. Bypassed balcony locks.", "player-action");
                    playSynthBeats(350, 0.15, "sawtooth"); // Clamber sound
                    unlockAchievement("spy");
                    travelToDistrict("palace");
                    advanceStage(4);
                }
            }
        ]
    },
    4: {
        title: "STAGE 4: KOT COURTYARD MELEE ⚔️",
        quote: `"Tonight, the stones of the Kot will drink, and only one master will walk out."`,
        narrative: `SEPTEMBER 14, 1846. Prime Minister Gagan Singh has been assassinated. The Queen, mad with grief, has summoned all 400 nobles into the Kot Courtyard. A scream echoes—a sword draws in the dark! Melee clashes break out. Rival Kaji Prithvi Pande lunges directly at you! Defeat him!`,
        objective: "Survive and defeat Rival Kaji Prithvi Pande",
        choices: [
            {
                text: "⚔️ Strike with Gurkha Khukuri (Historic Path)",
                desc: "Deliver rapid close sweeps to break his guard posture and consolidate Army power.",
                action: () => {
                    adjustFaction("military", 30, 20, 20);
                    adjustFaction("bhardar", -40, 50, -25);
                    logCombat("[HISTORIC EVENT]: You slashed Prithvi Pande's defenses! Regiments take the Kot courtyard.", "clash");
                    playSynthBeats(100, 0.4, "sine"); // Explosive clash
                    unlockAchievement("infiltration");
                    advanceStage(5);
                }
            },
            {
                text: "🛡️ Deflect & Hold him hostage (Regency Path)",
                desc: "Parry his blows, force him into submission to broker a joint administrative treaty.",
                action: () => {
                    adjustFaction("royal", 25, 10, 15);
                    adjustFaction("bhardar", 10, 15, 10);
                    logCombat("[ALTERNATE HISTORY]: You parried the blow and seized Pande. Forced Queen Rajya Lakshmi to sign treaty.", "player-action");
                    playSynthBeats(600, 0.1, "sine"); // Metallic ring
                    unlockAchievement("infiltration");
                    advanceStage(5);
                }
            }
        ]
    },
    5: {
        title: "STAGE 5: Maharaja's Iron Legacy 📜",
        quote: `"A crown is heavy, but the scepter of law maintains the kingdom's peace."`,
        narrative: `1854. You stand as Maharaja Jung Bahadur Rana, the undisputed sovereign ruler of Nepal. Your dynasty is secured, but you must govern. The public demands universal justice, while nobles whisper of rebellion. How will you seal your legacy?`,
        objective: "Codify legal laws or execute dissenter purges",
        choices: [
            {
                text: "📜 Codify the Muluki Ain (Universal Legal Code)",
                desc: "Modernize legal systems, secure borders, and govern via laws. [Sovereign Diplomat Ending]",
                action: () => {
                    logCombat("[LEGACY]: sealed Muluki Ain Universal Legal Code. The kingdom enters golden era of peace!", "player-action");
                    finishStory("benevolent");
                }
            },
            {
                text: "💂 Purge the Western Conspirators and Command Fear",
                desc: "Deploy elite army regiments to suppress regional nobles and rule by absolute fear. [Iron Dictator Ending]",
                action: () => {
                    logCombat("[LEGACY]: Executed Western conspirators. Command absolute control over palace districts.", "clash");
                    finishStory("iron");
                }
            }
        ]
    }
};

// ----------------------------------------------------
// 4. ENVIRONMENT & MAP TRAVERSAL
// ----------------------------------------------------
function setTimeOfDay(hour) {
    currentHour = hour;
    const todDisplay = document.getElementById("tod-display");
    const tintLayer = document.getElementById("tod-tint-layer");
    
    // De-activate all tod buttons
    document.querySelectorAll(".tod-buttons button").forEach(btn => btn.classList.remove("active"));
    
    let hourText = "";
    let tintColor = "rgba(0, 0, 0, 0)";
    
    if (hour === 6) {
        hourText = "06:00 (DAWN)";
        tintColor = "rgba(235, 110, 30, 0.16)";
        document.querySelectorAll(".tod-buttons button")[0].classList.add("active");
    } else if (hour === 12) {
        hourText = "12:00 (MIDDAY)";
        tintColor = "rgba(0, 0, 0, 0)";
        document.querySelectorAll(".tod-buttons button")[1].classList.add("active");
    } else if (hour === 18) {
        hourText = "18:00 (DUSK)";
        tintColor = "rgba(215, 130, 20, 0.22)";
        document.querySelectorAll(".tod-buttons button")[2].classList.add("active");
    } else {
        hourText = "23:00 (NIGHT)";
        tintColor = "rgba(10, 15, 45, 0.48)";
        document.querySelectorAll(".tod-buttons button")[3].classList.add("active");
    }
    
    if (todDisplay) todDisplay.innerText = hourText;
    if (tintLayer) tintLayer.style.backgroundColor = tintColor;
    
    logCombat(`[WORLD]: Time of day shifted to ${hourText}. AI Citizens recalculating routines...`, "system");
    
    // Redraw living world schedules
    renderNPCs();
    updateUI();
}

function setWeather(weatherType) {
    activeWeather = weatherType;
    const monsoonLayer = document.getElementById("weather-monsoon-layer");
    const fogLayer = document.getElementById("weather-fog-layer");
    
    document.querySelectorAll(".weather-buttons button").forEach(btn => btn.classList.remove("active"));
    
    if (weatherType === "clear") {
        if (monsoonLayer) monsoonLayer.style.opacity = "0";
        if (fogLayer) fogLayer.style.opacity = "0";
        document.querySelectorAll(".weather-buttons button")[0].classList.add("active");
        logCombat("[WORLD]: Weather cleared. Taleju temple roofs shine bright in Kathmandu sunshine.", "system");
    } else if (weatherType === "monsoon") {
        if (monsoonLayer) monsoonLayer.style.opacity = "0.85";
        if (fogLayer) fogLayer.style.opacity = "0";
        document.querySelectorAll(".weather-buttons button")[1].classList.add("active");
        logCombat("[WORLD]: Heavy Himalayan Monsoon torrent begins. Brick streets are slick. Muddy conditions.", "system");
        
        // Dynamic NPC reactions
        logCombat("[AI-SCHEDULER]: Standard citizens seek cover. Guards pull hoods up.");
    } else if (weatherType === "fog") {
        if (monsoonLayer) monsoonLayer.style.opacity = "0";
        if (fogLayer) fogLayer.style.opacity = "0.78";
        document.querySelectorAll(".weather-buttons button")[2].classList.add("active");
        logCombat("[WORLD]: Dense cold mountain fog rolls down the valley. Visibility is low. Stealth checks boosted.", "system");
    }
    
    updateUI();
}

const districtData = {
    bazaar: {
        title: "TALEJU BAZAAR",
        desc: "The bustling commerce heart of Kathmandu. Spice traders call out and bells chime under the Taleju Temple pagoda. Nobles gather near royal gate checkposts.",
        x: -120, y: 450
    },
    court: {
        title: "KOT COURTYARD",
        desc: "The legendary stone courtyard flanked by army armories and old palace brickwork. Spotlights flicker on blood-stained brick arches. Regiments stand drilling.",
        x: 15, y: -30
    },
    palace: {
        title: "PALACE INTERIORS",
        desc: "Labyrinthine corridor halls of Hanuman Dhoka palace. Lit by brass torches, heavy wooden lattice windows filter sunlight. Couriers gossip about Gagan Singh.",
        x: 220, y: -180
    },
    safehouse: {
        title: "SOVEREIGN SAFEHOUSE",
        desc: "A secured private base near the temple compound. Equipped with weapons vaults, diplomatic logs, and a horse stable.",
        x: -420, y: -380
    }
};

const randomEncounters = [
    {
        name: "💰 Merchant Faction Gossip",
        trigger: () => {
            adjustFaction("bhardar", 10, -5, 5);
            logCombat("[ENCOUNTER]: Overheard Bhardar nobles gossiping about army logistics. Gained +10 Noble Trust.");
        }
    },
    {
        name: "💂 Checkpoint Interrogation",
        trigger: () => {
            adjustThreatLevel(15);
            logCombat("[ENCOUNTER]: Royal guards halted you. 'Halt Captain! State your business.' Your threat rating scaled (+15).", "clash");
        }
    },
    {
        name: "🐚 Temple Kauda Invitation",
        trigger: () => {
            playerStats.balance += 50;
            logCombat("[ENCOUNTER]: A friendly Bhardar captain invited you to a Kauda game. You won +50 Gold Coins!", "player-action");
        }
    },
    {
        name: "⚔️ Rogue Pande Duel Ambush",
        trigger: () => {
            playerStats.health = Math.max(40, playerStats.health - 20);
            logCombat("[ENCOUNTER]: A masked assassin leaped from a balcony! Swept with a Khukuri, you deflected but took -20 Health.", "clash");
            playSynthBeats(100, 0.35, "sine");
        }
    }
];

function travelToDistrict(districtId) {
    playerStats.activeDistrict = districtId;
    const data = districtData[districtId];
    
    // Toggle active map district
    document.querySelectorAll(".map-district").forEach(div => div.classList.remove("active"));
    const mapCard = document.getElementById(`district-${districtId}`);
    if (mapCard) mapCard.classList.add("active");
    
    // Update active HUD details
    document.getElementById("active-district-title").innerText = `EXPLORING: ${data.title}`;
    document.getElementById("active-district-desc").innerText = data.desc;
    
    logCombat(`[TRAVERSAL]: Navigated to ${data.title} [Coords: X: ${data.x}, Y: ${data.y}]`, "player-action");
    
    // Play light clop sounds if mounted
    if (playerStats.mount === "mounted") {
        playSynthBeats(100, 0.08, "triangle");
        setTimeout(() => playSynthBeats(120, 0.08, "triangle"), 150);
    } else {
        playSynthBeats(250, 0.05, "sine");
    }
    
    // Trigger random encounters (25% chance)
    if (Math.random() < 0.6) {
        const enc = randomEncounters[Math.floor(Math.random() * randomEncounters.length)];
        setTimeout(() => {
            logCombat(`[WORLD-EVENT]: ${enc.name}`);
            enc.trigger();
            updateUI();
        }, 800);
    }
    
    // Infiltration Stage triggers
    if (activeMissionStage === 2 && districtId === "bazaar") {
        logCombat("[MISSION-SIGNAL]: Slipped into Taleju Bazaar successfully. Ready for infiltration.");
    } else if (activeMissionStage === 4 && districtId === "court") {
        logCombat("[MISSION-SIGNAL]: Stepped onto the wet stones of the Kot Courtyard. Steel echoes!");
    }
    
    renderNPCs();
    updateUI();
}

// ----------------------------------------------------
// 5. COMBAT DECK & WEAPONS ARMORY
// ----------------------------------------------------
const weapons = {
    unarmed: { name: "Unarmed", dmg: 5, reach: "Fists", desc: "No weapons drawn." },
    khukuri: { name: "Gurkha Khukuri", dmg: 28, reach: "1.2m", desc: "Iconic curved blade. Rapid and close combat sweeps." },
    talwar: { name: "Nepalese Talwar", dmg: 45, reach: "1.8m", desc: "Cavalry sword. Broad sweeps, heavy defensive blocks." },
    kora: { name: "Sacrificial Kora", dmg: 68, reach: "1.6m", desc: "Curved execution blade. Brutal power triggers." },
    musket: { name: "Flintlock Rifle", dmg: 95, reach: "30.0m", desc: "British flintlock. Thunderous ranged damage sweeps." }
};

function selectWeapon(wId) {
    playerStats.equipped = wId;
    
    document.querySelectorAll(".weapon-card").forEach(card => card.classList.remove("active"));
    const selectedCard = document.getElementById(`weapon-${wId}`);
    if (selectedCard) selectedCard.classList.add("active");
    
    logCombat(`[ARMORY]: Drew ${weapons[wId].name}. ${weapons[wId].desc}`, "player-action");
    
    if (wId === "musket") {
        playSynthBeats(180, 0.05, "sine"); // click
    } else if (wId !== "unarmed") {
        playSynthBeats(420, 0.04, "triangle"); // Blade shink
    }
    
    updateUI();
}

// ----------------------------------------------------
// 6. TEMPLE DUELING ARENA (Turn-based / System-driven)
// ----------------------------------------------------
let duelState = {
    opponent: "guard",
    opponentHealth: 100,
    opponentMaxHealth: 100,
    opponentPosture: 100,
    opponentMaxPosture: 100,
    playerPosture: 100
};

function selectDuelOpponent(oppId) {
    document.querySelectorAll(".opponent-row").forEach(div => div.classList.remove("active"));
    const oppDiv = document.getElementById(`opp-${oppId}`);
    if (oppDiv) oppDiv.classList.add("active");
    
    duelState.opponent = oppId;
    if (oppId === "guard") {
        duelState.opponentHealth = 100;
        duelState.opponentMaxHealth = 100;
        duelState.opponentPosture = 100;
        duelState.opponentMaxPosture = 100;
        logCombat("[COMBAT]: Opponent switched to Royal Gate Guard. Prepare stance.");
    } else {
        duelState.opponentHealth = 160;
        duelState.opponentMaxHealth = 160;
        duelState.opponentPosture = 130;
        duelState.opponentMaxPosture = 130;
        logCombat("[COMBAT]: Opponent switched to Rival Kaji Prithvi Pande. High Threat!");
    }
    
    updateDuelUI();
}

function updateDuelUI() {
    let hud = document.getElementById("duel-status-hud");
    if (!hud) {
        hud = document.createElement("div");
        hud.id = "duel-status-hud";
        hud.style.marginTop = "12px";
        hud.style.padding = "10px";
        hud.style.background = "rgba(0, 0, 0, 0.4)";
        hud.style.borderRadius = "6px";
        hud.style.border = "1px solid var(--glass-border)";
        hud.style.fontSize = "11px";
        hud.style.lineHeight = "1.5";
        
        const controls = document.querySelector(".arena-controls");
        if (controls) {
            controls.parentNode.insertBefore(hud, controls);
        }
    }
    
    const oppName = duelState.opponent === "guard" ? "Royal Gate Guard" : "Kaji Prithvi Pande";
    hud.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
            <span class="gold-text">🛡️ Player Posture: <strong>${Math.round(duelState.playerPosture)}%</strong></span>
            <span style="color:var(--red-bright);">💂 Opponent: <strong>${oppName}</strong></span>
        </div>
        <div style="margin-top:6px; display:flex; justify-content:space-between; font-size:10px;">
            <span>Opp Health: ${duelState.opponentHealth}/${duelState.opponentMaxHealth}</span>
            <span>Opp Posture: ${duelState.opponentPosture}/${duelState.opponentMaxPosture}</span>
        </div>
    `;
}

function performDuelAction(action) {
    if (playerStats.stamina < 20) {
        logCombat("[COMBAT]: Low stamina! Rest to recover posture.", "clash");
        return;
    }
    
    playerStats.stamina = Math.max(0, playerStats.stamina - 20);
    const activeWep = weapons[playerStats.equipped];
    
    if (action === "attack") {
        logCombat(`[PHYSICS SWEEP]: AProtagonistCharacter :: ExecuteAttack() with ${activeWep.name}`, "player-action");
        
        // Raycast overlap checks
        setTimeout(() => {
            logCombat("[COMPILER]: ABidirectionalDuelSystem :: SphereTraceSingleForObjects() success.");
            
            // Hit chance
            let hitChance = playerStats.equipped === "unarmed" ? 0.6 : 0.82;
            if (Math.random() < hitChance) {
                let damage = activeWep.dmg;
                let postureDamage = Math.round(damage * 0.7);
                
                duelState.opponentHealth = Math.max(0, duelState.opponentHealth - damage);
                duelState.opponentPosture = Math.max(0, duelState.opponentPosture - postureDamage);
                
                logCombat(`[DAMAGE]: Applied ${damage} absolute physical points to opponent. Posture reduced (-${postureDamage}).`, "clash");
                
                if (playerStats.equipped === "musket") {
                    playSynthBeats(70, 0.45, "sawtooth"); // Boom
                } else {
                    playSynthBeats(130, 0.15, "triangle"); // Slashing
                }
                
                // Defeat checks
                if (duelState.opponentHealth <= 0) {
                    logCombat(`🏆 [COMBAT-VICTORY]: You defeated ${duelState.opponent === "guard" ? "Royal Guard" : "Kaji Prithvi Pande"} in direct sword sweep sparring!`, "player-action");
                    playerStats.balance += 150;
                    adjustFaction("military", 15, 0, 15);
                    
                    if (duelState.opponent === "pande") {
                        unlockAchievement("infiltration");
                        if (activeMissionStage === 4) {
                            advanceStage(5);
                        }
                    }
                    
                    // Reset
                    selectDuelOpponent(duelState.opponent);
                }
            } else {
                logCombat("[PHYSICS]: Target parried your attack. Sword sparks flew!");
                playSynthBeats(650, 0.08, "sine");
            }
            updateDuelUI();
            updateUI();
        }, 120);
        
    } else if (action === "parry") {
        logCombat("[COMBAT]: Captain raises guard. AProtagonistCharacter :: PerformParry() visual window open.", "player-action");
        playSynthBeats(500, 0.05, "sine");
        
        setTimeout(() => {
            // Deflect posture
            duelState.opponentPosture = Math.max(0, duelState.opponentPosture - 40);
            logCombat("[PARRY SUCCESS]: Deflected incoming strike. Opponent posture damaged (-40)!");
            updateDuelUI();
        }, 100);
    }
}

// ----------------------------------------------------
// 7. NEPALESE KAUDA COWRIE SHELLS GAMBLING
// ----------------------------------------------------
function initKaudaBoard() {
    const grid = document.getElementById("cowrie-grid");
    if (!grid) return;
    
    grid.innerHTML = "";
    for (let i = 0; i < 16; i++) {
        const shell = document.createElement("div");
        shell.className = "cowrie-shell face-up";
        shell.innerText = "🐚";
        grid.appendChild(shell);
    }
}

function playKaudaGame() {
    const betType = document.getElementById("kauda-bet-type").value;
    const betAmount = parseInt(document.getElementById("kauda-bet-amount").value);
    
    if (isNaN(betAmount) || betAmount < 10) {
        logCombat("[WORLD]: Stables Master shrugs. 'Minimum Kauda bet is 10 gold coins!'");
        return;
    }
    
    if (playerStats.balance < betAmount) {
        logCombat("[WORLD]: Insufficient gold balance to bet that amount!", "clash");
        return;
    }
    
    // Deduct bet
    playerStats.balance -= betAmount;
    
    // Generate 16 shells states
    const shellStates = [];
    let faceUpCount = 0;
    
    for (let i = 0; i < 16; i++) {
        const faceUp = Math.random() > 0.5;
        shellStates.push(faceUp);
        if (faceUp) faceUpCount++;
    }
    
    // Render
    const grid = document.getElementById("cowrie-grid");
    grid.innerHTML = "";
    shellStates.forEach((isFaceUp, index) => {
        const shell = document.createElement("div");
        shell.className = `cowrie-shell ${isFaceUp ? 'face-up' : 'face-down'}`;
        shell.innerText = "🐚";
        // Inline styles to give nice sequential tumbling speeds
        shell.style.animation = "flicker-light 0.4s ease alternate";
        grid.appendChild(shell);
    });
    
    logCombat(`[GAMBLING]: Threw 16 cowries. ${faceUpCount} shells landed Face-Up, ${16 - faceUpCount} Face-Down.`, "player-action");
    
    // Play dice/shell rattling sound
    playSynthBeats(300, 0.05, "triangle");
    setTimeout(() => playSynthBeats(240, 0.05, "triangle"), 80);
    setTimeout(() => playSynthBeats(350, 0.05, "triangle"), 150);
    
    // Check Win conditions
    let didWin = false;
    let multiplier = 2;
    
    if (betType === "even" && faceUpCount % 2 === 0) {
        didWin = true;
    } else if (betType === "odd" && faceUpCount % 2 !== 0) {
        didWin = true;
    } else if (betType === "exact8" && faceUpCount === 8) {
        didWin = true;
        multiplier = 5;
    } else if (betType === "exact12" && faceUpCount === 12) {
        didWin = true;
        multiplier = 10;
    }
    
    if (didWin) {
        const winnings = betAmount * multiplier;
        playerStats.balance += winnings;
        logCombat(`🎉 [VICTORY]: Bet was correct! Earned ${winnings} Gold Coins (Multiplier: ${multiplier}x).`, "player-action");
        
        // Payout sounds
        playSynthBeats(800, 0.1, "sine");
        setTimeout(() => playSynthBeats(1000, 0.15, "sine"), 100);
        
        if (winnings >= 200 || playerStats.balance >= 1000) {
            unlockAchievement("gambler");
        }
    } else {
        logCombat("[LOSS]: Bet lost. The house takes the pile.");
        
        // Stables Master bailout if broke
        if (playerStats.balance <= 0) {
            playerStats.balance = 100;
            logCombat("[DIPLOMACY]: Stable master hands you 100 Gold coins. 'A Rana captain shouldn't stand penniless in taleju bazaar.'");
        }
    }
    
    updateUI();
}

// ----------------------------------------------------
// 8. CORE UI MAPPING & FACTION REPUTATION Wanted System
// ----------------------------------------------------
function updateUI() {
    // 1. Player Status HUD
    document.getElementById("health-val").innerText = `${playerStats.health} / 100`;
    document.getElementById("stamina-val").innerText = `${playerStats.stamina} / 100`;
    document.getElementById("equipped-val").innerText = playerStats.equipped.toUpperCase();
    
    const mountEl = document.getElementById("mount-val");
    if (mountEl) {
        if (playerStats.mount === "mounted") {
            mountEl.innerText = "MOUNTED (Marwari Stallion)";
            mountEl.className = "gold-text";
        } else {
            mountEl.innerText = "DISMOUNTED";
            mountEl.className = "text-muted";
        }
    }
    
    const balanceEl = document.getElementById("kauda-balance");
    if (balanceEl) balanceEl.innerText = `${playerStats.balance} Gold Coins`;
    
    // Progress bar fills
    const healthBar = document.querySelector(".health-bar");
    if (healthBar) healthBar.style.width = `${playerStats.health}%`;
    const staminaBar = document.querySelector(".stamina-bar");
    if (staminaBar) staminaBar.style.width = `${playerStats.stamina}%`;
    
    // 2. Factions panel updates
    for (const [factionId, data] of Object.entries(factions)) {
        const trustVal = document.getElementById(`${factionId}-trust`);
        const fearVal = document.getElementById(`${factionId}-fear`);
        const respectVal = document.getElementById(`${factionId}-respect`);
        const barFill = document.getElementById(`${factionId}-bar`);
        
        if (trustVal) trustVal.innerText = `${data.trust}%`;
        if (fearVal) fearVal.innerText = `${data.fear}%`;
        if (respectVal) respectVal.innerText = `${data.respect}%`;
        
        if (barFill) {
            const overall = Math.round((data.trust + data.respect - (data.fear * 0.2)));
            barFill.style.width = `${Math.max(5, Math.min(100, overall))}%`;
            
            // Faction alignment colors
            if (overall < 35) {
                barFill.style.background = "linear-gradient(90deg, #8C1C1C, #E33E3E)";
            } else if (overall > 68) {
                barFill.style.background = "linear-gradient(90deg, #2A8C4A, #5CB85C)";
            } else {
                barFill.style.background = "linear-gradient(90deg, var(--gold-dark), var(--gold-primary))";
            }
        }
    }
    
    // 3. Political Threat Level Updates (Wanted rating stars)
    updatePoliticalThreatSystem();
    
    // 4. Update Story Infiltration layout
    renderStoryMission();
    
    // 5. AUTO-SAVE STATE TRIGGER (Saves profile on any state changes!)
    saveProfile();
}

function adjustFaction(factionId, trust, fear, respect) {
    if (factions[factionId]) {
        factions[factionId].trust = Math.max(0, Math.min(100, factions[factionId].trust + trust));
        factions[factionId].fear = Math.max(0, Math.min(100, factions[factionId].fear + fear));
        factions[factionId].respect = Math.max(0, Math.min(100, factions[factionId].respect + respect));
    }
    updateUI();
}

function adjustThreatLevel(amount) {
    playerStats.threatLevel = Math.max(0, Math.min(100, playerStats.threatLevel + amount));
    updatePoliticalThreatSystem();
}

function updatePoliticalThreatSystem() {
    const starsHud = document.getElementById("threat-stars-hud");
    const alertHud = document.getElementById("threat-alert-hud");
    
    if (!starsHud || !alertHud) return;
    
    let stars = "⭐";
    let alertText = "ALL CLEAR";
    
    if (playerStats.threatLevel <= 20) {
        stars = "⭐";
        alertText = "ALL CLEAR";
        alertHud.classList.remove("active");
        alertHud.style.color = "#2A8C4A";
    } else if (playerStats.threatLevel <= 40) {
        stars = "⭐⭐";
        alertText = "SUSPICIOUS ACTIVITY";
        alertHud.classList.remove("active");
        alertHud.style.color = "#C5A85A";
    } else if (playerStats.threatLevel <= 60) {
        stars = "⭐⭐⭐";
        alertText = "GUARD SEARCH SQUADS ACTIVE";
        alertHud.classList.add("active");
        alertHud.style.color = "#E83F3F";
    } else if (playerStats.threatLevel <= 80) {
        stars = "⭐⭐⭐⭐";
        alertText = "PALACE GATEHOUSE LOCKS ARMED";
        alertHud.classList.add("active");
        alertHud.style.color = "#821414";
    } else {
        stars = "⭐⭐⭐⭐⭐";
        alertText = "TREASON HUNT: COURT UNDER LOCKDOWN!";
        alertHud.classList.add("active");
        alertHud.style.color = "#E83F3F";
    }
    
    starsHud.innerText = stars;
    alertHud.innerText = alertText;
}

function renderNPCs() {
    const container = document.getElementById("npc-registry-wrapper");
    if (!container) return;
    
    container.innerHTML = "";
    npcs.forEach(npc => {
        const schedule = npc.schedules[currentHour] || npc.schedules[12];
        const isFleeing = playerStats.threatLevel >= 65 && playerStats.activeDistrict === schedule.district;
        
        let statusTag = "🟢 ROUTINE ACTIVE";
        let cardClass = "";
        
        if (isFleeing) {
            statusTag = "🚨 SEEKING COVER (CLASH)";
            cardClass = "fleeing";
        }
        
        const card = document.createElement("div");
        card.className = `npc-status-card ${cardClass}`;
        card.innerHTML = `
            <div class="npc-header-row">
                <span>💂 ${npc.name}</span>
                <span class="gold-text" style="font-size: 8px;">${statusTag}</span>
            </div>
            <div class="npc-detail-row">
                <span>Role: <strong>${npc.role}</strong></span>
                <span>District: <strong>${schedule.district.toUpperCase()}</strong></span>
            </div>
            <div class="npc-detail-row" style="margin-top:2px;">
                <span>Task: <em>${schedule.activity}</em></span>
                <span>Coords: [${schedule.x}, ${schedule.y}]</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function logCombat(message, type = "system") {
    const feed = document.getElementById("combat-log-feed");
    if (!feed) return;
    
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    entry.innerText = `[${new Date().toLocaleTimeString()}]: ${message}`;
    
    feed.appendChild(entry);
    feed.scrollTop = feed.scrollHeight;
}

// ----------------------------------------------------
// 9. STORY RENDER & FINISHER FLOWS
// ----------------------------------------------------
function renderStoryMission() {
    const stage = missionStages[activeMissionStage];
    if (!stage) return;
    
    const titleEl = document.getElementById("quest-stage-title");
    const quoteEl = document.getElementById("story-quote");
    const narrativeEl = document.getElementById("story-narrative");
    const labelEl = document.getElementById("current-objective-label");
    const choicesWrapper = document.getElementById("choices-wrapper");
    const badgeEl = document.getElementById("mission-status-badge");
    
    if (titleEl) titleEl.innerText = stage.title;
    if (quoteEl) quoteEl.innerText = stage.quote;
    if (narrativeEl) narrativeEl.innerHTML = stage.narrative;
    if (labelEl) labelEl.innerText = stage.objective;
    if (badgeEl) badgeEl.innerText = `STAGE ${activeMissionStage} / 5`;
    
    if (choicesWrapper) {
        choicesWrapper.innerHTML = "";
        stage.choices.forEach(ch => {
            const card = document.createElement("div");
            card.className = "choice-card";
            card.innerHTML = `
                <h5>${ch.text}</h5>
                <p>${ch.desc}</p>
            `;
            card.onclick = ch.action;
            choicesWrapper.appendChild(card);
        });
    }
}

function advanceStage(stageNum) {
    activeMissionStage = stageNum;
    logCombat(`[MISSION]: Advanced Infiltration Stage to Stage ${stageNum}: ${missionStages[stageNum].objective}`);
    updateUI();
}

function finishStory(outcome) {
    const narrativeEl = document.getElementById("story-narrative");
    const choicesWrapper = document.getElementById("choices-wrapper");
    const titleEl = document.getElementById("quest-stage-title");
    const labelEl = document.getElementById("current-objective-label");
    
    if (titleEl) titleEl.innerText = "EPILOGUE: THE RANA DYNASTY";
    if (labelEl) labelEl.innerText = "Simulation Completed Successfully";
    
    if (outcome === "benevolent") {
        narrativeEl.innerHTML = `
            <p class="narrative-text" style="font-family:'Spectral'; font-size:16px;">
                Your legacy as Maharaja is defined by administrative modernization. The codification of the **Muluki Ain** in 1854 protected public lands, codified historic caste disputes, and established modern court structures. Under your vision, the kingdom remains independent of British annexation, recognized across Europe as a sovereign nation in the heart of the Himalayas.
            </p>
            <div style="margin-top:14px; border:2px solid var(--green-stamina); background:rgba(35,122,60,0.1); padding:12px; border-radius:6px; font-size:12px;">
                🌟 <strong>OUTCOME ACHIEVED: Sovereign Reformer & Diplomat</strong><br>
                You successfully balanced public respect, noble leverage, and military security to secure a stable and modern state structure.
            </div>
        `;
    } else {
        narrativeEl.innerHTML = `
            <p class="narrative-text" style="font-family:'Spectral'; font-size:16px;">
                Your rule is an iron-tight structure of military dominance. By purging remaining noble BHARDARS and reinforcing mountain fortresses, you consolidated absolute authority. The dynasty stands secure, surrounded by elite red-jacketed regiments, ruling via command, fear, and absolute discipline.
            </p>
            <div style="margin-top:14px; border:2px solid var(--red-bright); background:rgba(130,20,20,0.1); padding:12px; border-radius:6px; font-size:12px;">
                🔥 <strong>OUTCOME ACHIEVED: The Iron Prime Minister</strong><br>
                You established absolute power by eliminating all internal rival nodes. The court whispers your name in absolute intimidation.
            </div>
        `;
    }
    
    if (choicesWrapper) {
        choicesWrapper.innerHTML = "";
        const resetBtn = document.createElement("button");
        resetBtn.className = "combat-btn parry-btn";
        resetBtn.style.gridColumn = "span 2";
        resetBtn.style.width = "100%";
        resetBtn.innerText = "🔄 RESTART CONTINUOUS SANDBOX";
        resetBtn.onclick = () => {
            playerStats.health = 100;
            playerStats.stamina = 100;
            playerStats.mount = "dismounted";
            playerStats.balance = 500;
            playerStats.equipped = "unarmed";
            playerStats.threatLevel = 15;
            
            factions.royal.trust = 60;
            factions.royal.fear = 10;
            factions.royal.respect = 40;
            factions.bhardar.trust = 30;
            factions.bhardar.fear = 20;
            factions.bhardar.respect = 50;
            factions.military.trust = 50;
            factions.military.fear = 0;
            factions.military.respect = 70;
            
            activeMissionStage = 1;
            logCombat("[CORE]: Resetting companion simulation matrix.");
            updateUI();
        };
        choicesWrapper.appendChild(resetBtn);
    }
}

// ----------------------------------------------------
// 10. ACHIEVEMENTS SYSTEM
// ----------------------------------------------------
function unlockAchievement(id) {
    if (!playerStats.unlockedAchievements.includes(id)) {
        playerStats.unlockedAchievements.push(id);
        const pill = document.getElementById(`ach-${id}`);
        if (pill) {
            pill.classList.remove("locked");
            pill.classList.add("unlocked");
            logCombat(`🏆 [ACHIEVEMENT UNLOCKED]: Earned the "${pill.innerText}" badge!`, "player-action");
            playSynthBeats(900, 0.15, "sine");
        }
    }
}

function restoreAchievements() {
    // Reset all achievement cards visually first
    const achievements = ["mount", "spy", "infiltration", "gambler"];
    achievements.forEach(id => {
        const pill = document.getElementById(`ach-${id}`);
        if (pill) {
            pill.classList.add("locked");
            pill.classList.remove("unlocked");
        }
    });
    
    // Light up unlocked achievements
    playerStats.unlockedAchievements.forEach(id => {
        const pill = document.getElementById(`ach-${id}`);
        if (pill) {
            pill.classList.remove("locked");
            pill.classList.add("unlocked");
        }
    });
}

// ----------------------------------------------------
// 11. PERSISTENT COURT GATEWAY LOGIN PROTOCOLS
// ----------------------------------------------------
function handleAuthAction(type) {
    const userEl = document.getElementById("auth-username");
    const passEl = document.getElementById("auth-password");
    const factEl = document.getElementById("auth-faction");
    const msgEl = document.getElementById("auth-message");
    
    const username = userEl.value.trim();
    const password = passEl.value.trim();
    const faction = factEl.value;
    
    if (!username || !password) {
        showAuthMessage("Courtier name and seal passcode required!", "error");
        return;
    }
    
    initAudio(); // Initialize audio context on player click
    
    if (type === "register") {
        const existingProfile = localStorage.getItem(`rana_profile_${username}`);
        if (existingProfile) {
            showAuthMessage("This Courtier name already occupies a seat in the council!", "error");
            return;
        }
        
        // Initial user registration blueprint
        const newProfile = {
            username: username,
            password: password,
            faction: faction,
            stats: {
                health: 100,
                stamina: 100,
                equipped: "unarmed",
                mount: "dismounted",
                balance: 500,
                activeDistrict: "bazaar",
                threatLevel: 15,
                unlockedAchievements: []
            },
            activeMissionStage: 1,
            factions: {
                royal: { trust: faction === "royal" ? 75 : 60, fear: 10, respect: 40 },
                bhardar: { trust: faction === "bhardar" ? 55 : 30, fear: 20, respect: 50 },
                military: { trust: faction === "military" ? 70 : 50, fear: 0, respect: 70 }
            }
        };
        
        localStorage.setItem(`rana_profile_${username}`, JSON.stringify(newProfile));
        showAuthMessage("Royal Seal Registered successfully! Enter the Court gates below.", "success");
        playSynthBeats(700, 0.1, "sine");
        
    } else if (type === "login") {
        const rawProfile = localStorage.getItem(`rana_profile_${username}`);
        if (!rawProfile) {
            showAuthMessage("Lineage name not found in the royal records!", "error");
            return;
        }
        
        const profile = JSON.parse(rawProfile);
        if (profile.password !== password) {
            showAuthMessage("Incorrect passcode! The royal guard is alerted.", "error");
            
            // Intimidation check penalty: raising wanted level!
            adjustThreatLevel(15);
            playSynthBeats(90, 0.5, "sawtooth");
            
            logCombat(`[SECURITY]: Intruder alert! Unauthorized entry attempt on profile "${username}". Wanted alert scaled!`, "clash");
            return;
        }
        
        // Correct auth match
        sessionStorage.setItem("rana_current_user", username);
        
        // Load settings
        playerStats = profile.stats;
        activeMissionStage = profile.activeMissionStage || 1;
        
        factions.royal = profile.factions.royal;
        factions.bhardar = profile.factions.bhardar;
        factions.military = profile.factions.military;
        
        showAuthMessage("Access granted. Loading Hanuman Dhoka...", "success");
        playSynthBeats(440, 0.2, "sine");
        setTimeout(() => playSynthBeats(550, 0.2, "sine"), 120);
        
        // Transition fade out overlay
        const overlay = document.getElementById("auth-overlay");
        if (overlay) {
            overlay.style.opacity = "0";
            setTimeout(() => {
                overlay.style.visibility = "hidden";
            }, 800);
        }
        
        // Reload dashboard displays
        restoreAchievements();
        travelToDistrict(playerStats.activeDistrict);
        updateUI();
        
        logCombat(`[SYSTEM]: Courtier "${username}" successfully authenticated. Welcome to Hanuman Dhoka sandbox, Officer!`, "player-action");
    }
}

function showAuthMessage(msg, type) {
    const msgEl = document.getElementById("auth-message");
    if (!msgEl) return;
    
    msgEl.innerText = msg;
    msgEl.className = `auth-msg-label ${type}`;
}

function handleLogout() {
    sessionStorage.removeItem("rana_current_user");
    
    // Clear user credentials input
    document.getElementById("auth-username").value = "";
    document.getElementById("auth-password").value = "";
    showAuthMessage("Courtier signed out. Gates sealed.", "success");
    
    const overlay = document.getElementById("auth-overlay");
    if (overlay) {
        overlay.style.visibility = "visible";
        overlay.style.opacity = "1";
    }
    
    logCombat("[SYSTEM]: Courtier signed out. Returning to the Gatehouse Portal.");
}

function saveProfile() {
    const username = sessionStorage.getItem("rana_current_user");
    if (!username) return;
    
    const rawProfile = localStorage.getItem(`rana_profile_${username}`);
    if (!rawProfile) return;
    
    const profile = JSON.parse(rawProfile);
    
    // Update states
    profile.stats = playerStats;
    profile.activeMissionStage = activeMissionStage;
    profile.factions = factions;
    
    localStorage.setItem(`rana_profile_${username}`, JSON.stringify(profile));
}

// ----------------------------------------------------
// 12. WEB AUDIO API - PROCEDURAL SYNTH ENGINE
// ----------------------------------------------------
let soundContext = null;
let activeTracks = {
    rain: null,
    sarangi: null,
    flute: null,
    drums: null
};

function initAudio() {
    if (!soundContext) {
        soundContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function toggleTrack(trackId) {
    initAudio();
    const card = document.getElementById(`track-${trackId}`);
    if (!card) return;
    
    const btn = card.querySelector(".play-btn");
    
    if (activeTracks[trackId]) {
        activeTracks[trackId].stop();
        activeTracks[trackId] = null;
        card.classList.remove("active");
        btn.innerText = "PLAY";
        logCombat(`[SOUNDBOARD]: Deactivated synth loop - ${trackId}`);
    } else {
        card.classList.add("active");
        btn.innerText = "STOP";
        logCombat(`[SOUNDBOARD]: Playing procedural synth loop - ${trackId}`);
        
        if (trackId === "rain") {
            activeTracks.rain = startRainSynthesizer();
        } else if (trackId === "sarangi") {
            activeTracks.sarangi = startSarangiMelody();
        } else if (trackId === "flute") {
            activeTracks.flute = startFluteSolo();
        } else if (trackId === "drums") {
            activeTracks.drums = startWarDrums();
        }
    }
}

function playSynthBeats(freq, duration, type = "sine") {
    if (!soundContext) return;
    try {
        let osc = soundContext.createOscillator();
        let gain = soundContext.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, soundContext.currentTime);
        
        gain.gain.setValueAtTime(0.06, soundContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, soundContext.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(soundContext.destination);
        osc.start();
        osc.stop(soundContext.currentTime + duration);
    } catch (e) {}
}

function startRainSynthesizer() {
    const bufferSize = soundContext.sampleRate * 2;
    const noiseBuffer = soundContext.createBuffer(1, bufferSize, soundContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.8;
    }
    
    const noiseSource = soundContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    const filter = soundContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 550;
    
    const gainNode = soundContext.createGain();
    gainNode.gain.value = 0.15;
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(soundContext.destination);
    noiseSource.start();
    
    const thunderTimer = setInterval(() => {
        if (!activeTracks.rain) {
            clearInterval(thunderTimer);
            return;
        }
        playSynthBeats(42, 2.5, "triangle");
        playSynthBeats(60, 1.8, "sine");
        logCombat("[AMBIENCE]: Heavy monsoon thunder rolls over Hanuman Dhoka roofs...");
    }, 9000);
    
    return {
        stop: () => {
            try {
                noiseSource.stop();
                clearInterval(thunderTimer);
            } catch(e) {}
        }
    };
}

function startSarangiMelody() {
    let interval = null;
    const scale = [293.66, 329.63, 349.23, 392.00, 440.00, 466.16, 523.25]; // D minor raga
    
    const playNote = () => {
        let osc = soundContext.createOscillator();
        let vibrato = soundContext.createOscillator();
        let vibratoGain = soundContext.createGain();
        let gain = soundContext.createGain();
        
        osc.type = "triangle";
        let noteFreq = scale[Math.floor(Math.random() * scale.length)];
        osc.frequency.setValueAtTime(noteFreq, soundContext.currentTime);
        
        // Pitch slide representing organic friction string sliding
        osc.frequency.exponentialRampToValueAtTime(noteFreq * (Math.random() > 0.5 ? 1.03 : 0.97), soundContext.currentTime + 0.9);
        
        vibrato.frequency.value = 6.8;
        vibratoGain.gain.value = 9;
        
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        gain.gain.setValueAtTime(0.04, soundContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, soundContext.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, soundContext.currentTime + 1.3);
        
        osc.connect(gain);
        gain.connect(soundContext.destination);
        
        vibrato.start();
        osc.start();
        vibrato.stop(soundContext.currentTime + 1.3);
        osc.stop(soundContext.currentTime + 1.3);
    };
    
    interval = setInterval(playNote, 1400);
    return { stop: () => clearInterval(interval) };
}

function startFluteSolo() {
    let interval = null;
    const pentatonicScale = [329.63, 392.00, 440.00, 493.88, 587.33, 659.25]; // E Pentatonic Bansuri scale
    
    const playFlute = () => {
        let osc = soundContext.createOscillator();
        let filter = soundContext.createBiquadFilter();
        let gain = soundContext.createGain();
        
        osc.type = "sine";
        let note = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
        osc.frequency.setValueAtTime(note, soundContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(note * 1.012, soundContext.currentTime + 0.6);
        
        filter.type = "lowpass";
        filter.frequency.value = 1100;
        
        gain.gain.setValueAtTime(0.0, soundContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, soundContext.currentTime + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.0001, soundContext.currentTime + 1.7);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(soundContext.destination);
        
        osc.start();
        osc.stop(soundContext.currentTime + 1.7);
    };
    
    interval = setInterval(playFlute, 1800);
    return { stop: () => clearInterval(interval) };
}

function startWarDrums() {
    let interval = null;
    let beats = 0;
    
    const playDrum = (freq, duration, gainVal) => {
        let osc = soundContext.createOscillator();
        let gain = soundContext.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, soundContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, soundContext.currentTime + duration);
        
        gain.gain.setValueAtTime(gainVal, soundContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, soundContext.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(soundContext.destination);
        osc.start();
        osc.stop(soundContext.currentTime + duration);
    };
    
    interval = setInterval(() => {
        beats++;
        // Dum-Dum-Ta-Dum Madal roll
        if (beats % 4 === 1) {
            playDrum(52, 0.42, 0.28);
        } else if (beats % 4 === 2) {
            playDrum(52, 0.32, 0.18);
        } else if (beats % 4 === 3) {
            playSynthBeats(185, 0.08, "triangle");
        } else {
            playDrum(72, 0.4, 0.22);
        }
    }, 545); // ~110 BPM
    
    return { stop: () => clearInterval(interval) };
}

// ----------------------------------------------------
// 12. INITIALIZATION ON WINDOW LOAD
// ----------------------------------------------------
window.onload = () => {
    initKaudaBoard();
    
    const currentUser = sessionStorage.getItem("rana_current_user");
    const overlay = document.getElementById("auth-overlay");
    
    if (currentUser) {
        // User session already logged in
        if (overlay) {
            overlay.style.opacity = "0";
            overlay.style.visibility = "hidden";
        }
        
        // Restore user state
        const rawProfile = localStorage.getItem(`rana_profile_${currentUser}`);
        if (rawProfile) {
            const profile = JSON.parse(rawProfile);
            playerStats = profile.stats;
            activeMissionStage = profile.activeMissionStage || 1;
            factions.royal = profile.factions.royal;
            factions.bhardar = profile.factions.bhardar;
            factions.military = profile.factions.military;
        }
        
        setTimeOfDay(currentHour);
        setWeather(activeWeather);
        selectDuelOpponent("guard");
        selectWeapon(playerStats.equipped);
        restoreAchievements();
        travelToDistrict(playerStats.activeDistrict);
        
        logCombat(`[SYSTEM]: Active session verified for Courtier "${currentUser}". Welcome back to the court.`, "system");
        
    } else {
        // Enforce secure gatehouse login
        if (overlay) {
            overlay.style.opacity = "1";
            overlay.style.visibility = "visible";
        }
        
        setTimeOfDay(12);
        setWeather("clear");
        selectDuelOpponent("guard");
        selectWeapon("unarmed");
        
        logCombat("[SECURITY]: Gatehouse quarantine active. Seal verification required.", "system");
    }
};
