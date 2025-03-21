// script.js
document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        entryScreen: document.getElementById('entry-screen'),
        dosText: document.getElementById('dos-text'),
        questLog: document.getElementById('quest-log'),
        commandInput: document.getElementById('command-input'),
        bootScreen: document.getElementById('boot-screen'),
        desktop: document.getElementById('desktop'),
        startButton: document.getElementById('start-button'),
        startMenu: document.getElementById('start-menu'),
        taskbarTime: document.getElementById('taskbar-time'),
        shutdownButton: document.getElementById('shutdown'),
        progressBar: document.getElementById('progress-bar'),
        idiotAssistant: document.getElementById('idiot-assistant'),
        assistantMessage: document.getElementById('assistant-message'),
        startupSound: document.getElementById('startup-sound'),
        clickSound: document.getElementById('click-sound'),
        fridgeSound: document.getElementById('fridge-sound'),
        errorSound: document.getElementById('error-sound'),
    };

    elements.startupSound.load();
    elements.clickSound.load();
    elements.fridgeSound.load();
    elements.errorSound.load();

    const idiotsArt = `
   IIIIIII  DDDDD   IIIIIII   OOOO   TTTTTTT  SSSSS
     III    DD  DD    III    O    O    TTT    SS   
     III    DD   DD   III   O      O   TTT    SSSSS
     III    DD   DD   III   O      O   TTT        SS
     III    DD  DD    III    O    O    TTT        SS
   IIIIIII  DDDDD   IIIIIII   OOOO     TTT    SSSSS
`;

    const separatorLine = "----------------------------------------";

    let gameState = {
        isPlaying: false,
        player: {
            name: 'IDIOT',
            class: '',
            race: '',
            level: 1,
            xp: 0,
            maxXP: 100,
            hp: 50,
            maxHP: 50,
            attributes: { strength: 5, magic: 5, agility: 5, luck: 5 },
            inventory: [],
            gold: 50,
            location: { x: 0, y: 0 },
            equipment: { head: null, armor: null, legs: null, weapon: null, hands: null, feet: null, accessory: null }
        },
        map: [],
        enemies: [],
        heroes: [],
        bosses: [],
        quests: [],
        currentEvent: null,
        inCombat: false,
        combatEnemy: null,
        gameOver: false,
        startTime: 0,
        highScore: localStorage.getItem('highScore') || 0,
        gameLog: "",
        tweetData: []
    };

    // Load Tweets from tweets.json
    fetch('tweets.json')
        .then(response => response.json())
        .then(data => gameState.tweetData = data)
        .catch(() => console.log("No tweets.json found, using defaults"));

    function logMessage(message) {
        gameState.gameLog += `${new Date().toISOString()}: ${message}\n`;
    }

    const items = [
        // 10x Head Items
        { name: "Ordinal Cap", description: "A cap with a tiny Ordinal scribble.", category: "head", attributeBoosts: { luck: 1 }, levelName: "Comunn Idiot", levelColor: "rgb(100,100,100)" },
        { name: "Rune Tiara", description: "A tiara etched with sparkly Runes.", category: "head", attributeBoosts: { magic: 2 }, levelName: "Wow im special", levelColor: "rgb(0,150,255)" },
        { name: "HODL Helm", description: "A sturdy helm for diamond hands.", category: "head", attributeBoosts: { strength: 3 }, levelName: "Capt idiot", levelColor: "rgb(0,255,0)" },
        { name: "Satoshi’s Fedora", description: "A legendary hat of mystery.", category: "head", attributeBoosts: { luck: 5 }, levelName: "@CUZ", levelColor: "rgb(255,0,255)" },
        { name: "Pixel Visor", description: "A visor with Ordinal pixel art.", category: "head", attributeBoosts: { agility: 2 }, levelName: "LegenDIDIOT", levelColor: "rgb(255,255,0)" },
        { name: "Wojak Beanie", description: "Keeps your head warm, NGMI vibes.", category: "head", attributeBoosts: { luck: 1 }, levelName: "Comunn Idiot", levelColor: "rgb(100,100,100)" },
        { name: "Pepe Crown", description: "A crown for meme lords.", category: "head", attributeBoosts: { magic: 3 }, levelName: "Wow im special", levelColor: "rgb(0,150,255)" },
        { name: "Degen Beret", description: "Artistic flair for risky trades.", category: "head", attributeBoosts: { agility: 3 }, levelName: "Capt idiot", levelColor: "rgb(0,255,0)" },
        { name: "Silkroad Hood", description: "Shady and secretive headgear.", category: "head", attributeBoosts: { luck: 4 }, levelName: "LegenDIDIOT", levelColor: "rgb(255,255,0)" },
        { name: "DogArmy Helm", description: "Barks included, Sats protected.", category: "head", attributeBoosts: { strength: 5 }, levelName: "@CUZ", levelColor: "rgb(255,0,255)" },

        // 10x Armor Items
        { name: "Rune-Etched Vest", description: "Hastily etched Runes.", category: "armor", attributeBoosts: { strength: 1, agility: 1 }, armorValue: 5, levelName: "Wow im special", levelColor: "rgb(0,150,255)" },
        { name: "Chainmail of Hopium", description: "Woven from pure Hopium.", category: "armor", attributeBoosts: { luck: 2 }, armorValue: 10, levelName: "Wow im special", levelColor: "rgb(0,150,255)" },
        { name: "Ordinal Plate", description: "Heavy with inscribed Sats.", category: "armor", attributeBoosts: { strength: 3 }, armorValue: 15, levelName: "Capt idiot", levelColor: "rgb(0,255,0)" },
        { name: "Bull Run Robes", description: "Flowy robes for moon vibes.", category: "armor", attributeBoosts: { agility: 4 }, armorValue: 8, levelName: "LegenDIDIOT", levelColor: "rgb(255,255,0)" },
        { name: "Diamond Chestplate", description: "Unbreakable HODL armor.", category: "armor", attributeBoosts: { strength: 5 }, armorValue: 20, levelName: "@CUZ", levelColor: "rgb(255,0,255)" },
        { name: "Paper Hand Poncho", description: "Light but flimsy.", category: "armor", attributeBoosts: { agility: 1 }, armorValue: 3, levelName: "Comunn Idiot", levelColor: "rgb(100,100,100)" },
        { name: "Rekt Jacket", description: "Worn but oddly protective.", category: "armor", attributeBoosts: { luck: 2 }, armorValue: 7, levelName: "Wow im special", levelColor: "rgb(0,150,255)" },
        { name: "Sat Stacker Suit", description: "Tailored for Sats hoarders.", category: "armor", attributeBoosts: { strength: 2 }, armorValue: 12, levelName: "Capt idiot", levelColor: "rgb(0,255,0)" },
        { name: "Inscription Cloak", description: "Mysterious and inscribed.", category: "armor", attributeBoosts: { magic: 3 }, armorValue: 10, levelName: "LegenDIDIOT", levelColor: "rgb(255,255,0)" },
        { name: "Leonidas’ Aegis", description: "Spartan-grade protection.", category: "armor", attributeBoosts: { strength: 6 }, armorValue: 25, levelName: "@CUZ", levelColor: "rgb(255,0,255)" },

        // 10x Weapon Items
        { name: "Rusty Sat Sword", description: "Crudely made from old Sats.", category: "weapon", attributeBoosts: { strength: 1 }, damage: 5, levelName: "Comunn Idiot", levelColor: "rgb(100,100,100)" },
        { name: "Golden Rune Axe", description: "Gleaming with Runes.", category: "weapon", attributeBoosts: { strength: 2 }, damage: 15, levelName: "Capt idiot", levelColor: "rgb(0,255,0)" },
        { name: "Ordinal Dagger", description: "Sharp and inscribed.", category: "weapon", attributeBoosts: { agility: 2 }, damage: 8, levelName: "Wow im special", levelColor: "rgb(0,150,255)" },
        { name: "Laser Sat Blaster", description: "Pew pew for Sats!", category: "weapon", attributeBoosts: { magic: 3 }, damage: 12, levelName: "LegenDIDIOT", levelColor: "rgb(255,255,0)" },
        { name: "Diamond Hand Hammer", description: "Smashes with HODL power.", category: "weapon", attributeBoosts: { strength: 5 }, damage: 20, levelName: "@CUZ", levelColor: "rgb(255,0,255)" },
        { name: "Copium Staff", description: "Casts hopeful vibes.", category: "weapon", attributeBoosts: { magic: 2 }, damage: 6, levelName: "Comunn Idiot", levelColor: "rgb(100,100,100)" },
        { name: "Rune Scythe", description: "Reaps with mystical edge.", category: "weapon", attributeBoosts: { agility: 3 }, damage: 14, levelName: "Capt idiot", levelColor: "rgb(0,255,0)" },
        { name: "Shill Spear", description: "Pointy and persuasive.", category: "weapon", attributeBoosts: { strength: 2 }, damage: 10, levelName: "Wow im special", levelColor: "rgb(0,150,255)" },
        { name: "Pepe’s Blade", description: "Meme-powered sharpness.", category: "weapon", attributeBoosts: { luck: 3 }, damage: 13, levelName: "LegenDIDIOT", levelColor: "rgb(255,255,0)" },
        { name: "Satoshi’s Katana", description: "The ultimate blockchain edge.", category: "weapon", attributeBoosts: { strength: 6 }, damage: 25, levelName: "@CUZ", levelColor: "rgb(255,0,255)" },

        // 10x Consumables (for /item in combat)
        { name: "Hopium Potion", description: "Heals 20 HP with optimism.", category: "consumable", effect: () => gameState.player.hp = Math.min(gameState.player.maxHP, gameState.player.hp + 20), levelName: "Comunn Idiot", levelColor: "rgb(100,100,100)" },
        { name: "Rune Dust", description: "Boosts Magic by 5 for a turn.", category: "consumable", effect: () => gameState.player.attributes.magic += 5, levelName: "Wow im special", levelColor: "rgb(0,150,255)" },
        { name: "Sat Snack", description: "Restores 30 HP, tasty Sats!", category: "consumable", effect: () => gameState.player.hp = Math.min(gameState.player.maxHP, gameState.player.hp + 30), levelName: "Capt idiot", levelColor: "rgb(0,255,0)" },
        { name: "Copium Capsule", description: "Heals 15 HP, cope harder.", category: "consumable", effect: () => gameState.player.hp = Math.min(gameState.player.maxHP, gameState.player.hp + 15), levelName: "Comunn Idiot", levelColor: "rgb(100,100,100)" },
        { name: "Bull Brew", description: "Strength +10 for a turn.", category: "consumable", effect: () => gameState.player.attributes.strength += 10, levelName: "LegenDIDIOT", levelColor: "rgb(255,255,0)" },
        { name: "Bear Bait", description: "Enemy damage -5 next turn.", category: "consumable", effect: () => gameState.combatEnemy.strength = Math.max(1, gameState.combatEnemy.strength - 5), levelName: "Wow im special", levelColor: "rgb(0,150,255)" },
        { name: "WAGMI Wine", description: "Full HP restore!", category: "consumable", effect: () => gameState.player.hp = gameState.player.maxHP, levelName: "@CUZ", levelColor: "rgb(255,0,255)" },
        { name: "NGMI Nectar", description: "Heals 10 HP, tastes bitter.", category: "consumable", effect: () => gameState.player.hp = Math.min(gameState.player.maxHP, gameState.player.hp + 10), levelName: "Comunn Idiot", levelColor: "rgb(100,100,100)" },
        { name: "Ordinal Ointment", description: "Agility +5 for a turn.", category: "consumable", effect: () => gameState.player.attributes.agility += 5, levelName: "Capt idiot", levelColor: "rgb(0,255,0)" },
        { name: "Laser Juice", description: "Luck +10 for a turn.", category: "consumable", effect: () => gameState.player.attributes.luck += 10, levelName: "LegenDIDIOT", levelColor: "rgb(255,255,0)" },

        // Add more items for other slots (hands, legs, feet, accessory) similarly...
    ];

    const spells = [
        { name: "Sat Blast", description: "Blasts enemy with Sats for 10 damage.", cost: 5, effect: () => gameState.combatEnemy.hp -= 10 },
        { name: "Rune Burn", description: "Burns enemy for 15 damage.", cost: 7, effect: () => gameState.combatEnemy.hp -= 15 },
        { name: "Ordinal Flash", description: "Blinds enemy, reducing strength by 5.", cost: 6, effect: () => gameState.combatEnemy.strength = Math.max(1, gameState.combatEnemy.strength - 5) },
        { name: "HODL Heal", description: "Restores 20 HP.", cost: 8, effect: () => gameState.player.hp = Math.min(gameState.player.maxHP, gameState.player.hp + 20) },
        { name: "WAGMI Wave", description: "Massive 25 damage to enemy.", cost: 10, effect: () => gameState.combatEnemy.hp -= 25 },
        { name: "NGMI Curse", description: "Lowers enemy HP by 5.", cost: 4, effect: () => gameState.combatEnemy.hp -= 5 },
        { name: "Bull Rush", description: "20 damage with bullish force.", cost: 9, effect: () => gameState.combatEnemy.hp -= 20 },
        { name: "Bear Claw", description: "15 damage, bearish style.", cost: 7, effect: () => gameState.combatEnemy.hp -= 15 },
        { name: "Inscribe Bolt", description: "10 damage with inscription power.", cost: 5, effect: () => gameState.combatEnemy.hp -= 10 },
        { name: "Degen Dance", description: "Random 5-20 damage.", cost: 6, effect: () => gameState.combatEnemy.hp -= Math.floor(Math.random() * 16) + 5 },
    ];

    const enemyAdjectives = ["FUD-Slinging", "Shill-Crazed", "Rug-Pulling", "Ape-Minded", "Whale-Sized", "Bot-Driven", "Paper-Handed", "Diamond-Fisted", "Hopium-Addicted", "Copium-Soaked", "Rekt", "Moon-Bound", "Ordinal-Obsessed", "Rune-Scrawling", "Inscription-Mad", "Silkroad-Sneaky", "Degen", "Leonidasian", "Dogmatic", "Pepe-Fueled"];
    const enemyNouns = ["Trader", "Goblin", "Shaman", "Raider", "Whale", "Bot", "Pirate", "Hodler", "Jeet", "Maxi", "Idiot", "Wojak", "Pepe", "Satoshi", "Stacker", "Inscriber", "Etcher", "Scammer", "Troll", "Army"];

    function generateEnemyName() {
        return `${enemyAdjectives[Math.floor(Math.random() * enemyAdjectives.length)]} ${enemyNouns[Math.floor(Math.random() * enemyNouns.length)]}`;
    }

    function generateEnemy() {
        const tweet = gameState.tweetData[Math.floor(Math.random() * gameState.tweetData.length)] || "NGMI!";
        return {
            name: generateEnemyName(),
            hp: Math.floor(Math.random() * 20) + 10,
            strength: Math.floor(Math.random() * 5) + 3,
            loot: items[Math.floor(Math.random() * items.length)].name,
            attackText: `The ${generateEnemyName()} yells, "${tweet.split(' ').slice(0, 3).join(' ')}!"`
        };
    }

    const heroNames = ["Capt.Idiot", "Top Jeet", "Dopemind", "BtcMaxi", "Satoshi’s Ghost", "RuneLord", "OrdinalKing", "DogArmy Alpha", "Leonidas", "Silkroad Phantom"];
    function generateHero() {
        const name = heroNames[Math.floor(Math.random() * heroNames.length)];
        const behavior = ["helpful", "tricky", "aggressive"][Math.floor(Math.random() * 3)];
        return {
            name,
            behavior,
            description: `${name} ${behavior === "helpful" ? "offers a hand" : behavior === "tricky" ? "smirks slyly" : "glares menacingly"}.`,
            reward: items[Math.floor(Math.random() * items.length)].name
        };
    }

    const bosses = [
        { name: "Ethwhale", hp: 100, strength: 15, loot: "Eth Shard", attackText: "Ethwhale splashes gas fees at you!" },
        { name: "Solanamaxi", hp: 80, strength: 12, loot: "Sol Rune", attackText: "Solanamaxi speed-runs an attack!" },
        { name: "Katana.fun", hp: 90, strength: 14, loot: "Katana Blade", attackText: "Katana.fun slices with NFT precision!" },
        { name: "Binance Beast", hp: 120, strength: 16, loot: "BNB Coin", attackText: "Binance Beast pumps and dumps!" },
        { name: "Shiba Sovereign", hp: 70, strength: 10, loot: "Shiba Bone", attackText: "Shiba Sovereign barks memecoin fury!" },
        { name: "XRP Xterminator", hp: 85, strength: 13, loot: "XRP Ledger", attackText: "XRP Xterminator ripples through!" },
        { name: "Cardano Colossus", hp: 110, strength: 14, loot: "ADA Stake", attackText: "Cardano Colossus stakes its claim!" },
        { name: "Polkadot Phantom", hp: 95, strength: 12, loot: "DOT Link", attackText: "Polkadot Phantom bridges an assault!" },
        { name: "Avalanche Avenger", hp: 100, strength: 15, loot: "AVAX Crystal", attackText: "Avalanche Avenger buries you!" },
        { name: "Terra Tyrant", hp: 130, strength: 18, loot: "LUNA Dust", attackText: "Terra Tyrant crashes with stablecoin rage!" }
    ];

    const questTypes = [
        { type: "collect", description: "Collect {0} {1}", reward: "50 gold", target: () => `${Math.floor(Math.random() * 5) + 1} ${items[Math.floor(Math.random() * items.length)].name}` },
        { type: "defeat", description: "Defeat {0}", reward: "100 XP", target: () => generateEnemyName() },
        { type: "find", description: "Find {0}", reward: "Rare Sat", target: () => `The ${["Hidden", "Lost", "Cursed"][Math.floor(Math.random() * 3)]} Rune` },
        { type: "deliver", description: "Deliver {0} to {1}", reward: "Rune Shard", target: () => `${items[Math.floor(Math.random() * items.length)].name} to ${heroNames[Math.floor(Math.random() * heroNames.length)]}` },
        { type: "explore", description: "Explore {0}", reward: "Ordinal Fragment", target: () => `The ${["Dark", "Mystic", "Volatile"][Math.floor(Math.random() * 3)]} ${["Swamp", "Ruins", "Stack"][Math.floor(Math.random() * 3)]}` },
        { type: "inscribe", description: "Inscribe {0}", reward: "200 gold", target: () => `${Math.floor(Math.random() * 3) + 1} Ordinals` },
        { type: "stack", description: "Stack {0} Sats", reward: "Sat Stacker Badge", target: () => `${Math.floor(Math.random() * 50) + 10}` },
        { type: "trade", description: "Trade {0} for {1}", reward: "100 XP", target: () => `${items[Math.floor(Math.random() * items.length)].name} for ${items[Math.floor(Math.random() * items.length)].name}` },
        { type: "hunt", description: "Hunt down {0}", reward: "Boss Loot", target: () => bosses[Math.floor(Math.random() * bosses.length)].name },
        { type: "survive", description: "Survive {0} encounters", reward: "WAGMI Token", target: () => `${Math.floor(Math.random() * 5) + 3}` }
    ];

    function generateQuest() {
        const quest = questTypes[Math.floor(Math.random() * questTypes.length)];
        const target = quest.target();
        return {
            description: quest.description.replace("{0}", target.split(" ")[0]).replace("{1}", target.split(" ").slice(1).join(" ")),
            reward: quest.reward,
            type: quest.type,
            target,
            progress: 0
        };
    }

    function generateMap() {
        gameState.map = Array(5).fill().map(() => Array(5).fill('□'));
        gameState.map[gameState.player.location.y][gameState.player.location.x] = 'P';
    }

    function generateASCIIArt(type) {
        if (type === 'map') {
            return gameState.map.map(row => row.join(' ')).join('\n');
        }
        return idiotsArt;
    }

    function startGame() {
        gameState.isPlaying = true;
        gameState.startTime = Date.now();
        gameState.enemies = Array(10).fill().map(generateEnemy);
        gameState.heroes = Array(5).fill().map(generateHero);
        gameState.bosses = [...bosses];
        gameState.quests.push(generateQuest());
        generateMap();
        displayGameState();
    }

    function levelUp() {
        if (gameState.player.xp >= gameState.player.maxXP) {
            gameState.player.level++;
            gameState.player.xp -= gameState.player.maxXP;
            gameState.player.maxXP = Math.floor(gameState.player.maxXP * 1.2);
            gameState.player.maxHP += 10;
            gameState.player.hp = gameState.player.maxHP;
            gameState.player.attributes.strength += 2;
            gameState.player.attributes.magic += 2;
            gameState.player.attributes.agility += 2;
            gameState.player.attributes.luck += 1;
            return `<span class="game-message">Level Up! You’re now Level ${gameState.player.level}!</span>\n`;
        }
        return '';
    }

    function handleCombat(command) {
        let result = '';
        if (command === '/attack') {
            let weaponDamage = gameState.player.equipment.weapon?.damage || 0;
            let totalDamage = Math.floor((gameState.player.attributes.strength * (Math.random() * 0.5 + 0.5)) + weaponDamage);
            gameState.combatEnemy.hp -= totalDamage;
            result = `<span class="combat-text">You hit ${gameState.combatEnemy.name} for ${totalDamage} damage!</span>\n`;
            logMessage(`Player attacked ${gameState.combatEnemy.name} for ${totalDamage} damage`);

            if (gameState.combatEnemy.hp <= 0) {
                result += `<span class="combat-text">${gameState.combatEnemy.name} defeated! You gain 20 XP and find ${gameState.combatEnemy.loot}!</span>\n`;
                gameState.player.xp += 20;
                gameState.player.inventory.push(gameState.combatEnemy.loot);
                if (Math.random() < 0.5) {
                    const randomLootItem = items[Math.floor(Math.random() * items.length)];
                    gameState.player.inventory.push(randomLootItem.name);
                    result += `<span class="game-message">You loot a <span style="color: ${randomLootItem.levelColor}">${randomLootItem.name}</span>!</span>\n`;
                }
                gameState.inCombat = false;
                gameState.combatEnemy = null;
                result += levelUp();
            } else {
                const enemyDamage = Math.floor(gameState.combatEnemy.strength * (Math.random() * 0.5 + 0.5));
                gameState.player.hp -= enemyDamage;
                result += `<span class="combat-text">${gameState.combatEnemy.name} hits for ${enemyDamage} damage! "${gameState.combatEnemy.attackText}"</span>\n`;
                if (gameState.player.hp <= 0) {
                    result += `<span class="error-text">YOU DIED, IDIOT! Game Over.</span>\n/tweet to share your shame!\n`;
                    gameState.gameOver = true;
                }
            }
        } else if (command === '/spare') {
            if (Math.random() < 0.6 + (gameState.player.attributes.luck * 0.02)) {
                result = `<span class="game-message">You spare ${gameState.combatEnemy.name}. It drops ${gameState.combatEnemy.loot} and leaves.</span>\n`;
                gameState.player.inventory.push(gameState.combatEnemy.loot);
                gameState.player.xp += 5;
                gameState.inCombat = false;
                gameState.combatEnemy = null;
            } else {
                result = `<span class="combat-text">${gameState.combatEnemy.name} laughs, "WAGMI? Nope!" and attacks!</span>\n`;
                const enemyDamage = Math.floor(gameState.combatEnemy.strength * (Math.random() * 0.5 + 0.5));
                gameState.player.hp -= enemyDamage;
                result += `<span class="combat-text">You take ${enemyDamage} damage!</span>\n`;
                if (gameState.player.hp <= 0) {
                    result += `<span class="error-text">YOU DIED, IDIOT! Game Over.</span>\n/tweet to share!\n`;
                    gameState.gameOver = true;
                }
            }
        } else if (command === '/taunt') {
            const taunt = ["Your Sats are dust!", "Rune noob!", "Ordinal flop!"][Math.floor(Math.random() * 3)];
            result = `<span class="game-message">You taunt: "${taunt}"</span>\n`;
            if (Math.random() < 0.5) {
                result += `<span class="combat-text">${gameState.combatEnemy.name} rages and hits harder!</span>\n`;
                const enemyDamage = Math.floor(gameState.combatEnemy.strength * 1.5 * (Math.random() * 0.5 + 0.5));
                gameState.player.hp -= enemyDamage;
                result += `<span class="combat-text">You take ${enemyDamage} damage!</span>\n`;
                if (gameState.player.hp <= 0) {
                    result += `<span class="error-text">YOU DIED, IDIOT! Game Over.</span>\n/tweet to share!\n`;
                    gameState.gameOver = true;
                }
            } else {
                result += `<span class="game-message">${gameState.combatEnemy.name} falters, strength drops!</span>\n`;
                gameState.combatEnemy.strength = Math.max(1, gameState.combatEnemy.strength - 2);
            }
        } else if (command === '/bribe') {
            if (gameState.player.gold >= 10) {
                gameState.player.gold -= 10;
                if (Math.random() < 0.7) {
                    result = `<span class="game-message">You bribe ${gameState.combatEnemy.name} with 10 gold. It flees!</span>\n`;
                    gameState.inCombat = false;
                    gameState.combatEnemy = null;
                } else {
                    result = `<span class="combat-text">${gameState.combatEnemy.name} takes the gold and attacks!</span>\n`;
                    const enemyDamage = Math.floor(gameState.combatEnemy.strength * (Math.random() * 0.5 + 0.5));
                    gameState.player.hp -= enemyDamage;
                    result += `<span class="combat-text">You take ${enemyDamage} damage!</span>\n`;
                    if (gameState.player.hp <= 0) {
                        result += `<span class="error-text">YOU DIED, IDIOT! Game Over.</span>\n/tweet to share!\n`;
                        gameState.gameOver = true;
                    }
                }
            } else {
                result = `<span class="error-text">Not enough gold, IDIOT!</span>\n`;
            }
        } else if (command === '/magic') {
            const spell = spells[Math.floor(Math.random() * spells.length)];
            if (gameState.player.attributes.magic >= spell.cost) {
                gameState.player.attributes.magic -= spell.cost;
                spell.effect();
                result = `<span class="combat-text">You cast ${spell.name}! ${spell.description}</span>\n`;
                if (gameState.combatEnemy.hp <= 0) {
                    result += `<span class="combat-text">${gameState.combatEnemy.name} defeated! 20 XP and ${gameState.combatEnemy.loot}!</span>\n`;
                    gameState.player.xp += 20;
                    gameState.player.inventory.push(gameState.combatEnemy.loot);
                    gameState.inCombat = false;
                    gameState.combatEnemy = null;
                    result += levelUp();
                } else {
                    const enemyDamage = Math.floor(gameState.combatEnemy.strength * (Math.random() * 0.5 + 0.5));
                    gameState.player.hp -= enemyDamage;
                    result += `<span class="combat-text">${gameState.combatEnemy.name} hits for ${enemyDamage} damage!</span>\n`;
                    if (gameState.player.hp <= 0) {
                        result += `<span class="error-text">YOU DIED, IDIOT! Game Over.</span>\n/tweet to share!\n`;
                        gameState.gameOver = true;
                    }
                }
            } else {
                result = `<span class="error-text">Not enough magic, IDIOT!</span>\n`;
            }
        } else if (command === '/item') {
            const consumable = items.find(i => i.category === "consumable" && gameState.player.inventory.includes(i.name));
            if (consumable) {
                consumable.effect();
                gameState.player.inventory.splice(gameState.player.inventory.indexOf(consumable.name), 1);
                result = `<span class="game-message">You use ${consumable.name}! ${consumable.description}</span>\n`;
                const enemyDamage = Math.floor(gameState.combatEnemy.strength * (Math.random() * 0.5 + 0.5));
                gameState.player.hp -= enemyDamage;
                result += `<span class="combat-text">${gameState.combatEnemy.name} hits for ${enemyDamage} damage!</span>\n`;
                if (gameState.player.hp <= 0) {
                    result += `<span class="error-text">YOU DIED, IDIOT! Game Over.</span>\n/tweet to share!\n`;
                    gameState.gameOver = true;
                }
            } else {
                result = `<span class="error-text">No usable items, IDIOT!</span>\n`;
            }
        } else if (command === '/flee') {
            if (Math.random() < 0.5 + (gameState.player.attributes.agility * 0.01)) {
                result = `<span class="game-message">You flee from ${gameState.combatEnemy.name}!</span>\n`;
                gameState.inCombat = false;
                gameState.combatEnemy = null;
            } else {
                result = `<span class="combat-text">Flee failed! ${gameState.combatEnemy.name} catches you!</span>\n`;
                const enemyDamage = Math.floor(gameState.combatEnemy.strength * (Math.random() * 0.5 + 0.5));
                gameState.player.hp -= enemyDamage;
                result += `<span class="combat-text">You take ${enemyDamage} damage!</span>\n`;
                if (gameState.player.hp <= 0) {
                    result += `<span class="error-text">YOU DIED, IDIOT! Game Over.</span>\n/tweet to share!\n`;
                    gameState.gameOver = true;
                }
            }
        } else {
            result = `<span class="error-text">Invalid command! Use /attack, /spare, /taunt, /bribe, /magic, /item, /flee</span>\n`;
        }
        return result;
    }

    function handleEvent(command) {
        let result = '';
        if (!gameState.currentEvent) return result;
        const hero = gameState.currentEvent;
        if (command === '/talk') {
            if (hero.behavior === 'helpful') {
                result = `<span class="game-message">${hero.name} says, "Take this ${hero.reward}—WAGMI!"</span>\n`;
                gameState.player.inventory.push(hero.reward);
            } else if (hero.behavior === 'tricky') {
                result = `<span class="game-message">${hero.name} laughs, "Fooled ya! Maybe next time!"</span>\n`;
                if (Math.random() > 0.5) gameState.player.inventory.push(hero.reward);
            } else {
                result = `<span class="combat-text">${hero.name} roars, "Fight me, IDIOT!"</span>\n`;
                gameState.inCombat = true;
                gameState.combatEnemy = { name: hero.name, hp: 30, strength: 10, loot: "Hero’s Sats" };
            }
        } else if (command === '/ignore') {
            result = `<span class="game-message">You ignore ${hero.name} and move on.</span>\n`;
        }
        gameState.currentEvent = null;
        return result;
    }

    function checkForEvents() {
        let eventText = '';
        const eventChance = Math.random();
        if (eventChance < 0.2 && gameState.enemies.length > 0) {
            gameState.inCombat = true;
            gameState.combatEnemy = gameState.enemies[Math.floor(Math.random() * gameState.enemies.length)];
            eventText = `<span class="combat-text">You’ve encountered ${gameState.combatEnemy.name}!</span>\n`;
        } else if (eventChance < 0.3 && gameState.heroes.length > 0) {
            gameState.currentEvent = gameState.heroes[Math.floor(Math.random() * gameState.heroes.length)];
            eventText = `<span class="game-message">${gameState.currentEvent.description} /talk, /ignore</span>\n`;
        } else if (eventChance < 0.35 && gameState.bosses.length > 0) {
            gameState.inCombat = true;
            gameState.combatEnemy = gameState.bosses[Math.floor(Math.random() * gameState.bosses.length)];
            eventText = `<span class="combat-text">BOSS ALERT: ${gameState.combatEnemy.name} emerges!</span>\n`;
        }
        return eventText;
    }

    function handleEquipCommand(commandParts) {
        if (commandParts.length < 2) return `<span class="error-text">Use /equip [item name]</span>\n`;
        const itemName = commandParts.slice(1).join(' ').toLowerCase();
        const item = items.find(i => i.name.toLowerCase() === itemName && gameState.player.inventory.includes(i.name));
        if (!item) return `<span class="error-text">Item not found or not in inventory!</span>\n`;
        if (item.category === "consumable") return `<span class="error-text">Can’t equip consumables, IDIOT!</span>\n`;
        gameState.player.equipment[item.category] = item;
        gameState.player.inventory.splice(gameState.player.inventory.indexOf(item.name), 1);
        for (let attr in item.attributeBoosts) {
            gameState.player.attributes[attr] += item.attributeBoosts[attr];
        }
        return `<span class="game-message">Equipped ${item.name}!</span>\n`;
    }

    function displayGameState() {
        let display = `<span class="player-stat">IDIOT: ${gameState.player.name} | Level ${gameState.player.level} | XP: ${gameState.player.xp}/${gameState.player.maxXP}</span>\n`;
        display += `<span class="player-stat">HP: ${gameState.player.hp}/${gameState.player.maxHP} | STR: ${gameState.player.attributes.strength} | MAG: ${gameState.player.attributes.magic} | AGI: ${gameState.player.attributes.agility} | LCK: ${gameState.player.attributes.luck}</span>\n`;
        display += `<span class="player-stat">Inventory: ${gameState.player.inventory.length > 0 ? gameState.player.inventory.join(', ') : 'Empty'}</span>\n`;
        display += `<span class="player-stat">Equipment:`;
        for (let slot in gameState.player.equipment) {
            const item = gameState.player.equipment[slot];
            display += ` ${slot}: ${item ? `<span style="color: ${item.levelColor}">${item.name}</span>` : 'None'}`;
        }
        display += `</span>\n`;
        display += `<span class="player-stat">Gold: ${gameState.player.gold} | Location: (${gameState.player.location.x}, ${gameState.player.location.y})</span>\n`;
        display += `<span class="game-message">Tweets Loaded: ${gameState.tweetData.length}</span>\n`;
        display += separatorLine + '\n';
        display += `Map:\n${generateASCIIArt('map')}\n`;
        display += separatorLine + '\n';
        if (gameState.inCombat) {
            display += `<span class="combat-text">Combat!</span>\n`;
            display += `<span class="combat-text">Enemy: ${gameState.combatEnemy.name} (HP: ${gameState.combatEnemy.hp})</span>\n`;
            display += `<span class="game-message">Commands: /attack, /spare, /taunt, /bribe, /magic, /item, /flee</span>\n`;
        } else if (gameState.currentEvent) {
            display += `<span class="game-message">Event: ${gameState.currentEvent.description}</span>\n`;
            display += `<span class="game-message">Commands: /talk, /ignore</span>\n`;
        } else {
            display += `<span class="game-message">Quest: ${gameState.quests.length > 0 ? gameState.quests[0].description : 'None'}</span>\n`;
            display += `<span class="game-message">Commands: /north, /south, /east, /west, /inventory, /stats, /quests, /quit, /downloadlog, /equip [item name], /tweet</span>\n`;
        }
        elements.dosText.innerHTML = display;
        elements.commandInput.focus();
    }

    function displayQuests() {
        let display = `<span class="game-message">Active Quests:</span>\n`;
        gameState.quests.forEach(q => display += `<span class="game-message">${q.description} (Reward: ${q.reward})</span>\n`);
        elements.questLog.innerHTML = display;
        elements.questLog.classList.remove('hidden');
        elements.dosText.classList.add('hidden');
    }

    function endGame() {
        const playTime = (Date.now() - gameState.startTime) / 1000;
        if (playTime > gameState.highScore) {
            gameState.highScore = playTime;
            localStorage.setItem('highScore', playTime);
        }
        return `<span class="game-message">Game Over! Playtime: ${Math.floor(playTime / 60)}m ${Math.floor(playTime % 60)}s | High Score: ${Math.floor(gameState.highScore / 60)}m ${Math.floor(gameState.highScore % 60)}s</span>\n`;
    }

    elements.commandInput.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const command = elements.commandInput.value.trim().toLowerCase();
        elements.commandInput.value = '';
        logMessage(`Player command: ${command}`);
        let result = '';

        if (!gameState.isPlaying) {
            if (command === '/start') {
                startGame();
                result = `<span class="game-message">Welcome to IDIOTS, Master! Type /stats to begin your quest!</span>\n`;
            } else {
                result = idiotsArt + '\n<span class="game-message">Type /start to begin, IDIOT!</span>\n';
            }
        } else if (gameState.gameOver) {
            if (command === '/tweet') {
                const tweet = `YOU DIED, IDIOT! Level ${gameState.player.level} run ended. @idiotsbtc @captnakedidiot`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, '_blank');
                result = `<span class="game-message">Tweet sent! Game resetting...</span>\n`;
                gameState = { ...gameState, isPlaying: false, gameOver: false, player: { ...gameState.player, hp: 50, xp: 0, level: 1 } };
            } else {
                result = `<span class="error-text">Game Over! /tweet to share or /start to retry</span>\n`;
            }
        } else if (gameState.inCombat) {
            result = handleCombat(command);
        } else if (gameState.currentEvent) {
            result = handleEvent(command);
        } else {
            if (command === '/north') {
                if (gameState.player.location.y > 0) gameState.player.location.y--;
            } else if (command === '/south') {
                if (gameState.player.location.y < 4) gameState.player.location.y++;
            } else if (command === '/east') {
                if (gameState.player.location.x < 4) gameState.player.location.x++;
            } else if (command === '/west') {
                if (gameState.player.location.x > 0) gameState.player.location.x--;
            } else if (command === '/inventory') {
                result = `<span class="player-stat">Inventory: ${gameState.player.inventory.length > 0 ? gameState.player.inventory.join(', ') : 'Empty'}</span>\n`;
            } else if (command === '/stats') {
                result = `<span class="player-stat">Level ${gameState.player.level} | HP: ${gameState.player.hp}/${gameState.player.maxHP} | STR: ${gameState.player.attributes.strength} | MAG: ${gameState.player.attributes.magic} | AGI: ${gameState.player.attributes.agility} | LCK: ${gameState.player.attributes.luck}</span>\n`;
            } else if (command === '/quests') {
                displayQuests();
                return;
            } else if (command === '/quit') {
                result = endGame();
                gameState.gameOver = true;
            } else if (command === '/downloadlog') {
                const blob = new Blob([gameState.gameLog], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'idiots_game_log.txt';
                a.click();
                URL.revokeObjectURL(url);
                result = `<span class="game-message">Log downloaded!</span>\n`;
            } else if (command.startsWith('/equip')) {
                result = handleEquipCommand(command.split(' '));
            } else if (command === '/tweet') {
                result = `<span class="error-text">Tweet only works when you die, IDIOT!</span>\n`;
            } else {
                result = `<span class="error-text">Invalid command! Use /north, /south, /east, /west, /inventory, /stats, /quests, /quit, /downloadlog, /equip [item name], /tweet</span>\n`;
            }
            generateMap();
            result += checkForEvents();
        }

        elements.dosText.innerHTML += result;
        displayGameState();
    });

    function bootSequence() {
        elements.bootScreen.classList.remove('hidden');
        elements.entryScreen.classList.add('hidden');
        elements.desktop.classList.add('hidden');
        elements.dosTextBoot.innerHTML = "IDIOTS OS v0.95\nBooting up...\n";
        setTimeout(() => {
            elements.bootScreen.classList.add('hidden');
            elements.entryScreen.classList.remove('hidden');
            elements.dosText.innerHTML = idiotsArt + '\n<span class="game-message">Type /start to begin, IDIOT!</span>\n';
            elements.startupSound.play();
        }, 5000);
    }

    bootSequence();
});