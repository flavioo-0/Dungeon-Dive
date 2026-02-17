// script.js
// --- 1. Dichiarazione degli Elementi HTML ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartButton = document.getElementById('restartButton');
const winScreen = document.getElementById('winScreen');
const playAgainButton = document.getElementById('playAgainButton');
const merchantScreen = document.getElementById('merchantScreen');
const merchantMessageDiv = document.getElementById('merchant-message');
const merchantUpgradesDiv = document.getElementById('merchant-upgrades');
const merchantAbilitiesDiv = document.getElementById('merchant-abilities');
const merchantExitButton = document.getElementById('merchant-exit-button');
const gameMessagesDiv = document.getElementById('game-messages');

// Elementi per la pausa
const pauseScreen = document.getElementById('pauseScreen');
const resumeButton = document.getElementById('resumeButton');
const menuButton = document.getElementById('menuButton');
const controlsButton = document.getElementById('controlsButton');
const indexButton = document.getElementById('indexButton');
const commandsScreen = document.getElementById('commandsScreen');
const commandsBackButton = document.getElementById('commandsBackButton');
const indexDialog = document.getElementById('indexDialog');
const closeIndexButton = document.getElementById('closeIndexButton');
const monstersInfoDiv = document.getElementById('monstersInfo');

// HUD Elements
const playerHpSpan = document.getElementById('playerHp');
const playerMaxHpSpan = document.getElementById('playerMaxHp');
const playerAtkSpan = document.getElementById('playerAtk');
const playerDefSpan = document.getElementById('playerDef');
const playerAgiSpan = document.getElementById('playerAgi');
const playerGoldSpan = document.getElementById('playerGold');
const playerLevelSpan = document.getElementById('playerLevel');
const currentFloorDisplay = document.getElementById('currentFloorDisplay');
const totalFloorsDisplay = document.getElementById('totalFloorsDisplay');
const playerExpSpan = document.getElementById('playerExp');
const expBarFill = document.getElementById('exp-bar-fill');
const expToNextLevelSpan = document.getElementById('expToNextLevel');

// --- 2. Costanti e Variabili di Gioco Globali ---
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const PLAYER_SIZE = 30;
const MONSTER_SIZE = 35;
const PROJECTILE_SIZE = 8;
const PLAYER_BASE_SPEED = 3;
const PROJECTILE_SPEED = 8;
const ROOM_BUFFER = 50;
const SPAWN_SAFE_ZONE = 150;

const TOWER_HEIGHT = 100;
const BOSS_FLOOR_INTERVAL = 10;
const MERCHANT_FLOOR_OFFSET = 1;

const XP_TO_LEVEL_UP = [0, 100, 300, 600, 1200, 1800, 2400, 3000, 4000, 6000];

let player;
let monsters = [];
let projectiles = [];
let floorEffects = [];
let dungeonFloors = [];
let currentFloor = 0;
let currentDungeonFloor;

let keys = {};
let mouse = { x: 0, y: 0 };
let mouseDown = false;
let lastShotTime = 0;

let gameLoopInterval = null;
let gameState = 'menu';

// --- 3. Dati del Gioco (Mostri, Abilità) ---
const monstersData = {
    slime: { name: "Slime Viscido", hp: 35, atk: 7, def: 2, xp: 10, gold: 5, color: 'lime', speed: 1.3, cooldown: 200, maxHp: 35, abilityType: null },
    druid: { name: "Druido Silvano", hp: 60, atk: 12, def: 3, xp: 25, gold: 12, color: 'lightblue', speed: 1.5, cooldown: 280, maxHp: 60, abilityType: 'wind_fury', abilityValue: { damage: 5, pushbackForce: 10, effectDuration: 60, effectSize: 150 }, abilityCooldown: 300},
    orc: { name: "Orco Bruto", hp: 90, atk: 15, def: 4, xp: 40, gold: 20, color: 'green', speed: 1.6, cooldown: 300, maxHp: 90, abilityType: 'aoe_stomp', abilityValue: 100, abilityCooldown: 280 },
    skeleton: { name: "Scheletro Rianimato", hp: 65, atk: 12, def: 4, xp: 30, gold: 15, color: 'lightgray', speed: 2.5, cooldown: 180, maxHp: 65, abilityType: 'speed_boost', abilityValue: 1.5, abilityDuration: 120, abilityCooldown: 350 },
    ghoul: { name: "Ghoul Affamato", hp: 80, atk: 13, def: 5, xp: 35, gold: 18, color: 'brown', speed: 1.7, cooldown: 220, maxHp: 80, abilityType: 'push_back', abilityValue: 150, abilityCooldown: 280 },
    necromancer: { name: "Necromante Oscuro", hp: 250, atk: 15, def: 12, xp: 50, gold: 25, color: 'indigo', speed: 1.2, cooldown: 380, maxHp: 250, abilityType: 'spawn_minions', abilityValue: 2, abilityCooldown: 280 },
    dwarf: { name: "Nano Berserker", hp: 1, atk: 30, def: 0, xp: 15, gold: 8, color: 'red', speed: 5, cooldown: 150, maxHp: 1, abilityType: null },
    dragon: { name: "Drago Antico", hp: 500, atk: 70, def: 60, xp: 500, gold: 200, color: 'darkred', speed: 1.0, cooldown: 300, maxHp: 500, abilityType: ['fire_breath', 'flame_patch'], abilityValue: [15, 15], abilityCooldown: [300, 350] },
    orc_boss: { name: "Orco Capo", hp: 300, atk: 25, def: 7, xp: 150, gold: 80, color: 'darkgreen', speed: 1.5, cooldown: 280, maxHp: 300, abilityType: ['aoe_stomp', 'charge'], abilityValue: [100, 0], abilityCooldown: [280, 350] },
    necromancer_boss: { name: "Necromante Supremo", hp: 180, atk: 20, def: 12, xp: 160, gold: 90, color: 'darkviolet', speed: 1.1, cooldown: 300, maxHp: 180, abilityType: ['spawn_minions', 'cursed_projectile'], abilityValue: [2, 0.5], abilityCooldown: [450, 350] },
    stone_golem: { 
        name: "Golem di Pietra", 
        hp: 800, 
        atk: 45, 
        def: 50, 
        xp: 300, 
        gold: 150, 
        color: 'gray', 
        speed: 0.8, 
        cooldown: 320, 
        maxHp: 800, 
        abilityType: ['earthquake', 'rock_barrier'], 
        abilityValue: [120, 100], 
        abilityCooldown: [350, 280] 
    },
    lich_king: { 
        name: "Re Lich", 
        hp: 650, 
        atk: 55, 
        def: 35, 
        xp: 350, 
        gold: 170, 
        color: 'darkblue', 
        speed: 1.1, 
        cooldown: 300, 
        maxHp: 650, 
        abilityType: ['ice_nova', 'summon_ghosts'], 
        abilityValue: [40, 3], 
        abilityCooldown: [300, 400] 
    },
    thunder_titan: { 
        name: "Titano del Fulmine", 
        hp: 700, 
        atk: 60, 
        def: 30, 
        xp: 380, 
        gold: 180, 
        color: 'yellow', 
        speed: 1.3, 
        cooldown: 280, 
        maxHp: 700, 
        abilityType: ['lightning_storm', 'chain_lightning'], 
        abilityValue: [25, 4], 
        abilityCooldown: [320, 280] 
    },
    abyss_guardian: { 
        name: "Guardiano dell'Abisso", 
        hp: 900, 
        atk: 65, 
        def: 45, 
        xp: 420, 
        gold: 200, 
        color: 'black', 
        speed: 1.4, 
        cooldown: 290, 
        maxHp: 900, 
        abilityType: ['void_teleport', 'dark_pulse'], 
        abilityValue: [50, 70], 
        abilityCooldown: [250, 300] 
    },
    flame_hydra: { 
        name: "Idra delle Fiamme", 
        hp: 750, 
        atk: 70, 
        def: 25, 
        xp: 400, 
        gold: 190, 
        color: 'orangered', 
        speed: 1.2, 
        cooldown: 270, 
        maxHp: 750, 
        abilityType: ['triple_fireball', 'lava_pool'], 
        abilityValue: [15, 80], 
        abilityCooldown: [200, 350] 
    },
    fallen_angel: { 
        name: "Angelo Caduto", 
        hp: 850, 
        atk: 75, 
        def: 40, 
        xp: 450, 
        gold: 220, 
        color: 'purple', 
        speed: 1.7, 
        cooldown: 260, 
        maxHp: 850, 
        abilityType: ['holy_beam', 'dark_wings'], 
        abilityValue: [55, 1.8], 
        abilityCooldown: [280, 320] 
    },
    chaos_lord: { 
        name: "Signore del Caos", 
        hp: 2000, 
        atk: 100, 
        def: 80, 
        xp: 1000, 
        gold: 500, 
        color: '#8A2BE2',
        speed: 1.5, 
        cooldown: 200, 
        maxHp: 2000, 
        abilityType: ['chaos_blast', 'dimensional_rift', 'summon_minions'], 
        abilityValue: [100, 150, 4], 
        abilityCooldown: [250, 400, 300] 
    }
};

// --- 4. Classi del Gioco ---

class Entity {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.hp = 1;
        this.maxHp = 1;
        this.atk = 0;
        this.def = 0;
        this.isInvincible = false;
        this.statusEffects = {};
        this.originalColor = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }

    drawHealthBar() {
        if (this.hp <= 0) return;
        const barWidth = this.size;
        const barHeight = 5;
        const barX = this.x - this.size / 2;
        const barY = this.y - this.size / 2 - 10;

        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = (this instanceof Player) ? 'green' : 'orange';
        ctx.fillRect(barX, barY, barWidth * (this.hp / this.maxHp), barHeight);
    }

    checkCollision(other) {
        const otherWidth = other.width !== undefined ? other.width : other.size;
        const otherHeight = other.height !== undefined ? other.height : other.size;

        return this.x - this.size / 2 < other.x + otherWidth / 2 &&
               this.x + this.size / 2 > other.x - otherWidth / 2 &&
               this.y - this.size / 2 < other.y + otherHeight / 2 &&
               this.y + this.size / 2 > other.y - otherHeight / 2;
    }

    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    takeDamage(damage) {
        if (this.isInvincible) return 0;
        const actualDamage = Math.max(1, damage - this.def);
        this.hp -= actualDamage;
        return actualDamage;
    }

    applyStatusEffect(type, duration, value = 0) {
        if (this.statusEffects[type] && this.statusEffects[type].duration < duration) {
            this.statusEffects[type].duration = duration;
            this.statusEffects[type].value = value;
            return;
        }

        if (!this.statusEffects[type] || this.statusEffects[type].duration <= 0) {
            this.statusEffects[type] = { duration: duration, value: value, originalSpeed: this.speed, originalColor: this.color };
            if (type === 'slow') {
                this.speed *= (1 - value);
                this.speed = Math.max(0.5, this.speed);
                this.color = 'darkcyan';
            }
            if (type === 'wind_fury_color') {
                this.color = value;
            }
            if (type === 'speed_boost') {
                this.color = 'yellow';
            }
            if (type === 'dash_invincibility') {
                this.isInvincible = true;
                this.color = 'lightblue';
            }
            if (type === 'invisibility_invincibility') {
                this.isInvincible = true;
                this.color = 'grey';
            }
            if (type === 'defense_boost') {
                this.def = Math.floor(this.def * (1 + value));
                this.color = 'brown';
            }
        }
    }

    updateStatusEffects() {
        for (const type in this.statusEffects) {
            this.statusEffects[type].duration--;
            if (this.statusEffects[type].duration <= 0) {
                if (type === 'slow' || type === 'speed_boost') {
                    this.speed = this.statusEffects[type].originalSpeed;
                } else if (type === 'defense_boost') {
                    this.def = Math.floor(this.def / (1 + this.statusEffects[type].value));
                }
                if (type === 'slow' || type === 'wind_fury_color' || type === 'speed_boost' || type === 'dash_invincibility' || type === 'invisibility_invincibility' || type === 'defense_boost') {
                    this.color = this.originalColor;
                }
                if (type === 'dash_invincibility' || type === 'invisibility_invincibility') {
                    this.isInvincible = false;
                }
                delete this.statusEffects[type];
            }
        }
    }
}

class Projectile {
    constructor(x, y, angle, damage, color, isMonsterProjectile = false, size = PROJECTILE_SIZE, speed = PROJECTILE_SPEED, statusEffect = null, effectDuration = 0, effectValue = 0) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.damage = damage;
        this.color = color;
        this.size = size;
        this.speed = speed;
        this.isMonsterProjectile = isMonsterProjectile;
        this.statusEffect = statusEffect;
        this.effectDuration = effectDuration;
        this.effectValue = effectValue;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    checkCollision(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size / 2 + other.size / 2);
    }

    isOffScreen() {
        return this.x < 0 || this.x > CANVAS_WIDTH || this.y < 0 || this.y > CANVAS_HEIGHT;
    }
}

class FloorEffect {
    constructor(x, y, size, color, duration, type, damage) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.duration = duration;
        this.type = type;
        this.damage = damage;

        this.originalSize = size;
    }

    draw() {
        if (this.type === 'stomp_aoe' || this.type === 'fire') {
            const currentSize = this.originalSize * (1 - (this.duration / 15));
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentSize / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'ice') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    update() {
        this.duration--;

        if (player && !player.isInvincible && player.checkCollision(this)) {
            if ((this.type === 'fire' || this.type === 'ice') && this.duration % 30 === 0) {
                const damageDealt = player.takeDamage(this.damage);
                if (damageDealt > 0) {
                    const message = this.type === 'fire' 
                        ? `Stai bruciando! Hai subito ${damageDealt} danni!` 
                        : `Sei congelato! Hai subito ${damageDealt} danni!`;
                    updateGameMessage(message);
                    updateHUD();
                }
            }
        }
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y, PLAYER_SIZE, 'blue');
        this.maxHp = 120;
        this.hp = this.maxHp;
        this.atk = 10;
        this.def = 5;
        this.agility = 0;
        this.baseSpeed = PLAYER_BASE_SPEED;
        this.speed = this.baseSpeed;
        this.gold = 0;
        this.xp = 0;
        this.level = 1;
        this.shootCooldown = 0;
        this.maxShootCooldown = 20;

        this.hasDash = false;
        this.dashCooldown = 0;
        this.maxDashCooldown = 120;
        this.dashDuration = 10;

        this.hasInvisibility = false;
        this.invisibilityCooldown = 0;
        this.maxInvisibilityCooldown = 300;
        this.invisibilityDuration = 60;

        this.hasFireball = false;
        this.fireballCooldown = 0;
        this.maxFireballCooldown = 180;
        this.isTransitioning = false;
    }

    update() {
        this.speed = this.baseSpeed + this.agility * 0.2;
        let effectiveSpeed = this.speed;
        if (this.statusEffects['slow']) {
            effectiveSpeed *= (1 - this.statusEffects['slow'].value);
        }

        this.updateStatusEffects();

        if (keys['w']) this.y -= effectiveSpeed;
        if (keys['s']) this.y += effectiveSpeed;
        if (keys['a']) this.x -= effectiveSpeed;
        if (keys['d']) this.x += effectiveSpeed;

        const playerHalfSize = this.size / 2;
        this.x = Math.max(playerHalfSize, Math.min(CANVAS_WIDTH - playerHalfSize, this.x));
        this.y = Math.max(playerHalfSize, Math.min(CANVAS_HEIGHT - playerHalfSize, this.y));

        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.invisibilityCooldown > 0) this.invisibilityCooldown--;
        if (this.fireballCooldown > 0) this.fireballCooldown--;
        if (this.shootCooldown > 0) this.shootCooldown--;
    }

    activateDash() {
        if (this.hasDash && this.dashCooldown <= 0) {
            this.dashCooldown = this.maxDashCooldown;
            const angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
            const dashDistance = 100;
            this.x += Math.cos(angle) * dashDistance;
            this.y += Math.sin(angle) * dashDistance;

            const playerHalfSize = this.size / 2;
            this.x = Math.max(playerHalfSize, Math.min(CANVAS_WIDTH - playerHalfSize, this.x));
            this.y = Math.max(playerHalfSize, Math.min(CANVAS_HEIGHT - playerHalfSize, this.y));

            updateGameMessage("Hai usato Dash!");
            this.applyStatusEffect('dash_invincibility', this.dashDuration);
        } else if (!this.hasDash) {
            updateGameMessage("Non hai ancora imparato l'abilità Dash!");
        } else {
            updateGameMessage("Dash è in cooldown!");
        }
    }

    activateInvisibility() {
        if (this.hasInvisibility && this.invisibilityCooldown <= 0) {
            this.invisibilityCooldown = this.maxInvisibilityCooldown;
            updateGameMessage("Sei diventato invisibile per un breve periodo!");
            this.applyStatusEffect('invisibility_invincibility', this.invisibilityDuration);
        } else if (!this.hasInvisibility) {
            updateGameMessage("Non hai ancora imparato l'abilità Invisibilità!");
        } else {
            updateGameMessage("Invisibilità è in cooldown!");
        }
    }

    activateFireball() {
        if (this.hasFireball && this.fireballCooldown <= 0) {
            this.fireballCooldown = this.maxFireballCooldown;
            const angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
            projectiles.push(new Projectile(this.x, this.y, angle, this.atk * 2, 'red'));
            updateGameMessage("Hai lanciato una Palla di Fuoco!");
        } else if (!this.hasFireball) {
            updateGameMessage("Non hai ancora imparato l'abilità Palla di Fuoco!");
        } else {
            updateGameMessage("Palla di Fuoco è in cooldown!");
        }
    }

    addXP(amount) {
        this.xp += amount;
        updateGameMessage(`+${amount} XP!`);
        this.checkLevelUp();
    }

    checkLevelUp() {
        if (this.level < XP_TO_LEVEL_UP.length && this.xp >= XP_TO_LEVEL_UP[this.level]) {
            this.level++;
            this.maxHp += 15;
            this.hp = Math.min(this.maxHp, this.hp + 15);
            this.atk += 2;
            this.def += 1;
            this.agility += 1;
            updateGameMessage(`🎉 Congratulazioni! Sei salito al Livello ${this.level}! HP, ATK, DEF, AGI aumentati! 🎉`);
            updateHUD();
        }
    }
}

class Monster extends Entity {
    constructor(x, y, typeData) {
        super(x, y, MONSTER_SIZE, typeData.color);
        this.name = typeData.name;
        this.hp = typeData.hp;
        this.maxHp = typeData.hp;
        this.atk = typeData.atk;
        this.def = typeData.def;
        this.xp = typeData.xp;
        this.gold = typeData.gold;
        this.speed = typeData.speed;
        this.attackCooldown = 0;
        this.maxAttackCooldown = typeData.cooldown;
        this.originalColor = typeData.color;
        this.originalSpeed = typeData.speed;
        
        this.spawnTimer = 60;
        this.isSpawning = true;
        this.spawnEffectSize = 0;
        this.isInvincible = true;

        this.abilityType = Array.isArray(typeData.abilityType) ? typeData.abilityType : (typeData.abilityType ? [typeData.abilityType] : []);
        this.abilityValue = typeData.abilityValue;
        this.abilityCooldown = Array.isArray(typeData.abilityCooldown) ? typeData.abilityCooldown : (typeData.abilityCooldown ? [typeData.abilityCooldown] : []);
        this.currentAbilityCooldown = this.initializeCooldowns(this.abilityCooldown);
        this.abilityDuration = typeData.abilityDuration || 0;
        this.currentAbilityDuration = 0;

        this.isCharging = false;
        this.chargeAngle = 0;
        this.chargeSpeed = 10;
        this.chargeDuration = 30;
        this.currentChargeDuration = 0;
    }

    initializeCooldowns(cooldowns) {
        if (Array.isArray(cooldowns)) {
            return cooldowns.map(cd => rand(0, cd));
        }
        return rand(0, cooldowns || 0);
    }

    update() {
        if (this.isSpawning) {
            this.spawnTimer--;
            this.spawnEffectSize = (1 - this.spawnTimer / 60) * this.size * 2;
            
            if (this.spawnTimer <= 0) {
                this.isSpawning = false;
                this.isInvincible = false;
            }
            return;
        }

        this.updateStatusEffects();

        let effectiveSpeed = this.originalSpeed;
        
        if (this.statusEffects['speed_boost']) {
            effectiveSpeed *= this.statusEffects['speed_boost'].value;
        }
        
        if (this.statusEffects['slow']) {
            effectiveSpeed *= (1 - this.statusEffects['slow'].value);
        }
        
        this.speed = effectiveSpeed;

        if (this.isCharging) {
            this.x += Math.cos(this.chargeAngle) * this.chargeSpeed;
            this.y += Math.sin(this.chargeAngle) * this.chargeSpeed;
            this.currentChargeDuration--;
            this.isInvincible = true;

            if (player && this.checkCollision(player) && !player.isInvincible) {
                const damageDealt = player.takeDamage(this.atk * 1.5);
                if (damageDealt > 0) {
                    updateGameMessage(`${this.name} ti ha caricato per ${damageDealt} danni!`);
                    updateHUD();
                }
                this.isCharging = false;
                this.currentChargeDuration = 0;
            }

            if (this.currentChargeDuration <= 0) {
                this.isCharging = false;
                this.isInvincible = false;
                this.color = this.originalColor;
            }
            return;
        }

        const playerIsInvisible = player.statusEffects['invisibility_invincibility'];
        const isExecutingDurationAbility = this.currentAbilityDuration > 0;
        const canMove = !playerIsInvisible || isExecutingDurationAbility || this.abilityType.includes('fire_breath');

        if (player && canMove) {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;
        }

        if (player && this.distanceTo(player) < (this.size / 2 + player.size / 2 + 5) && this.attackCooldown <= 0 && !player.isInvincible) {
            const damageDealt = player.takeDamage(this.atk);
            if (damageDealt > 0) {
                updateGameMessage(`${this.name} ti ha colpito per ${damageDealt} danni.`);
            }
            this.attackCooldown = this.maxAttackCooldown;
            if (player.hp <= 0) {
                gameOver();
                return;
            }
            updateHUD();
        }
        if (this.attackCooldown > 0) this.attackCooldown--;

        if (player && this.abilityType && gameState === 'playing') {
            this.abilityType.forEach((ability, index) => {
                if (this.currentAbilityCooldown[index] > 0) {
                    this.currentAbilityCooldown[index]--;
                } else {
                    const abilityVal = Array.isArray(this.abilityValue) ? this.abilityValue[index] : this.abilityValue;
                    this.activateAbility(ability, abilityVal);
                    this.currentAbilityCooldown[index] = Array.isArray(this.abilityCooldown) ? this.abilityCooldown[index] : this.abilityCooldown;
                }
            });

            if (this.currentAbilityDuration > 0) {
                this.currentAbilityDuration--;
            }

            if (this.abilityType.includes('wind_fury') && this.currentAbilityDuration > 0) {
                const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
                const abilityData = this.abilityValue; // Usa il valore dell'abilità del mostro
                const windEffectRange = abilityData.effectSize;
                const pushbackForce = abilityData.pushbackForce;
                const damagePerTick = abilityData.damage;

                const distToPlayer = this.distanceTo(player);

                if (distToPlayer < windEffectRange && !player.isInvincible) {
                    if (!this.statusEffects['wind_damage_cooldown'] || this.statusEffects['wind_damage_cooldown'].duration <= 0) {
                        const damageDealt = player.takeDamage(damagePerTick);
                        if (damageDealt > 0) {
                            updateGameMessage(`${this.name} ti respinge con la Furia del Vento! (-${damageDealt} HP)`);
                            updateHUD();
                        }
                        player.applyStatusEffect('wind_damage_cooldown', 15);
                    }

                    player.x += Math.cos(angleToPlayer) * pushbackForce;
                    player.y += Math.sin(angleToPlayer) * pushbackForce;

                    const playerHalfSize = player.size / 2;
                    player.x = Math.max(playerHalfSize, Math.min(CANVAS_WIDTH - playerHalfSize, player.x));
                    player.y = Math.max(playerHalfSize, Math.min(CANVAS_HEIGHT - playerHalfSize, player.y));
                }

                floorEffects.push(new FloorEffect(this.x, this.y, windEffectRange * 2, 'rgba(173,216,230,0.2)', 10, 'wind_effect', 0));
            }
        }
    }

    activateAbility(ability, value) {
        if (player.statusEffects['invisibility_invincibility'] &&
            (ability === 'projectile' || ability === 'fire_breath' || ability === 'push_back' || ability === 'charge' || ability === 'cursed_projectile' || ability === 'flame_patch' || ability === 'earthquake' || ability === 'ice_nova' || ability === 'lightning_storm' || ability === 'chain_lightning' || ability === 'void_teleport' || ability === 'dark_pulse' || ability === 'triple_fireball' || ability === 'lava_pool' || ability === 'holy_beam' || ability === 'chaos_blast' || ability === 'dimensional_rift')) {
            return;
        }

        switch (ability) {
            case 'projectile':
                if (this.distanceTo(player) < 300 && !player.isInvincible) {
                    const angle = Math.atan2(player.y - this.y, player.x - this.x);
                    projectiles.push(new Projectile(this.x, this.y, angle, this.atk, 'purple', true));
                }
                break;
            case 'wind_fury':
                if (this.distanceTo(player) < 200 && !player.isInvincible && this.currentAbilityDuration <= 0) {
                    const abilityData = this.abilityValue;
                    this.currentAbilityDuration = abilityData.effectDuration;
                    this.applyStatusEffect('wind_fury_color', this.currentAbilityDuration, 'lightblue');
                    updateGameMessage(`${this.name} scatena la Furia del Vento!`);
                }
                break;
            case 'aoe_stomp':
                floorEffects.push(new FloorEffect(this.x, this.y, value * 2, 'rgba(255, 69, 0, 0.4)', 15, 'stomp_aoe', 0));

                if (this.distanceTo(player) < value) {
                    const damageDealt = player.takeDamage(this.atk * 0.75);
                    if (damageDealt > 0) {
                        updateGameMessage(`${this.name} ha usato Stomp! Hai subito ${damageDealt} danni.`);
                        updateHUD();
                    }
                }
                break;
            case 'speed_boost':
                if (this.currentAbilityDuration <= 0) {
                    this.currentAbilityDuration = this.abilityDuration;
                    this.applyStatusEffect('speed_boost', this.abilityDuration, value);
                    updateGameMessage(`${this.name} è diventato più veloce!`);
                }
                break;
            case 'fire_breath':
                if (this.distanceTo(player) < 250 && !player.isInvincible) {
                    const angle = Math.atan2(player.y - this.y, player.x - this.x);
                    projectiles.push(new Projectile(this.x, this.y, angle, value, 'orange', true, 20, 3));
                    updateGameMessage(`${this.name} ha usato Respiro di Fuoco!`);
                }
                break;
            case 'push_back':
                if (this.distanceTo(player) > 50 && this.distanceTo(player) < value && !player.isInvincible) {
                    const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
                    const pushForce = -30;
                    player.x += Math.cos(angleToPlayer) * pushForce;
                    player.y += Math.sin(angleToPlayer) * pushForce;
                    const playerHalfSize = player.size / 2;
                    player.x = Math.max(playerHalfSize, Math.min(CANVAS_WIDTH - playerHalfSize, player.x));
                    player.y = Math.max(playerHalfSize, Math.min(CANVAS_HEIGHT - playerHalfSize, player.y));
                    updateGameMessage(`${this.name} ti ha spinto via con la forza del vento!`);
                }
                break;
            case 'spawn_minions':
                if (currentDungeonFloor.activeMonsters.length < 6) {
                    for (let i = 0; i < value; i++) {
                        const minionData = {...monstersData.skeleton};
                        minionData.hp = Math.floor(minionData.hp * 0.5);
                        minionData.atk = Math.floor(minionData.atk * 0.7);
                        minionData.def = Math.floor(minionData.def * 0.5);
                        minionData.maxHp = minionData.hp;

                        const spawnX = this.x + rand(-50, 50);
                        const spawnY = this.y + rand(-50, 50);
                        const newMinion = new Monster(spawnX, spawnY, minionData);
                        currentDungeonFloor.activeMonsters.push(newMinion);
                        monsters.push(newMinion); // Aggiungi anche all'array globale
                    }
                    updateGameMessage(`${this.name} ha evocato ${value} mini-scheletri!`);
                }
                break;
            case 'charge':
                if (!this.isCharging && this.distanceTo(player) > 70 && !player.isInvincible) {
                    this.isCharging = true;
                    this.chargeAngle = Math.atan2(player.y - this.y, player.x - this.x);
                    this.currentChargeDuration = this.chargeDuration;
                    this.color = 'darkorange';
                    updateGameMessage(`${this.name} si sta preparando alla carica!`);
                }
                break;
            case 'cursed_projectile':
                if (this.distanceTo(player) < 350 && !player.isInvincible) {
                    const angle = Math.atan2(player.y - this.y, player.x - this.x);
                    projectiles.push(new Projectile(this.x, this.y, angle, this.atk * 0.8, 'darkgreen', true, PROJECTILE_SIZE * 1.5, PROJECTILE_SPEED * 0.7, 'slow', 60, value));
                    updateGameMessage(`${this.name} ha lanciato un Proiettile Maledetto!`);
                }
                break;
            case 'flame_patch':
                if (this.distanceTo(player) < 300 && !player.isInvincible) {
                    const flameSize = 60;
                    const flameDuration = 180;
                    const flameDamage = value; // Usa il valore come danno
                    floorEffects.push(new FloorEffect(player.x + rand(-20, 20), player.y + rand(-20, 20), flameSize, 'orange', flameDuration, 'fire', flameDamage));
                    updateGameMessage(`${this.name} ha sputato fiamme a terra!`);
                }
                break;
            case 'earthquake':
                floorEffects.push(new FloorEffect(this.x, this.y, value * 2, 'rgba(139, 69, 19, 0.5)', 20, 'stomp_aoe', value));
                updateGameMessage(`${this.name} scatena un Terremoto!`);
                break;
            case 'rock_barrier':
                this.applyStatusEffect('defense_boost', 180, 0.5);
                updateGameMessage(`${this.name} si protegge con una Barriera di Roccia!`);
                break;
            case 'ice_nova':
                floorEffects.push(new FloorEffect(this.x, this.y, 250, 'rgba(0, 191, 255, 0.4)', 120, 'ice', value));
                updateGameMessage(`${this.name} scatena una Nova di Ghiaccio!`);
                break;
            case 'summon_ghosts':
                for (let i = 0; i < value; i++) {
                    const ghostData = {...monstersData.ghoul};
                    ghostData.hp *= 1.5;
                    ghostData.atk *= 1.5;
                    ghostData.def *= 1.2;
                    ghostData.maxHp = ghostData.hp; // Aggiorna maxHp
                    
                    const spawnX = this.x + rand(-100, 100);
                    const spawnY = this.y + rand(-100, 100);
                    const newGhost = new Monster(spawnX, spawnY, ghostData);
                    currentDungeonFloor.activeMonsters.push(newGhost);
                    monsters.push(newGhost); // Aggiungi anche all'array globale
                }
                updateGameMessage(`${this.name} ha evocato ${value} fantasmi!`);
                break;
            case 'lightning_storm':
                for (let i = 0; i < 5; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 200 + Math.random() * 100;
                    const targetX = player.x + Math.cos(angle) * distance;
                    const targetY = player.y + Math.sin(angle) * distance;
                    
                    floorEffects.push(new FloorEffect(targetX, targetY, 80, 'rgba(255, 255, 0, 0.6)', 60, 'lightning', value));
                }
                updateGameMessage(`${this.name} scatena una Tempesta di Fulmini!`);
                break;
            case 'chain_lightning':
                if (player && !player.isInvincible) {
                    const damage = value * 0.8;
                    const damageDealt = player.takeDamage(damage);
                    if (damageDealt > 0) {
                        updateGameMessage(`${this.name} ti colpisce con un Fulmine a Catena! (${damageDealt} danni)`);
                        updateHUD();
                    }
                }
                break;
            case 'void_teleport':
                this.x = player.x + rand(-200, 200);
                this.y = player.y + rand(-200, 200);
                this.x = Math.max(ROOM_BUFFER, Math.min(CANVAS_WIDTH - ROOM_BUFFER, this.x));
                this.y = Math.max(ROOM_BUFFER, Math.min(CANVAS_HEIGHT - ROOM_BUFFER, this.y));
                updateGameMessage(`${this.name} si teletrasporta!`);
                break;
            case 'dark_pulse':
                const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
                projectiles.push(new Projectile(this.x, this.y, angleToPlayer, value, 'black', true, 25, 4, 'slow', 90, 0.5));
                updateGameMessage(`${this.name} lancia un Impulso Oscuro!`);
                break;
            case 'triple_fireball':
                for (let i = -1; i <= 1; i++) {
                    const angle = Math.atan2(player.y - this.y, player.x - this.x) + i * 0.3;
                    projectiles.push(new Projectile(this.x, this.y, angle, value, 'orangered', true, 15, 4));
                }
                updateGameMessage(`${this.name} lancia tre Palle di Fuoco!`);
                break;
            case 'lava_pool':
                floorEffects.push(new FloorEffect(player.x, player.y, value, 'rgba(255, 69, 0, 0.5)', 180, 'fire', value));
                updateGameMessage(`${this.name} crea una Pozza di Lava!`);
                break;
            case 'holy_beam':
                const beamAngle = Math.atan2(player.y - this.y, player.x - this.x);
                projectiles.push(new Projectile(this.x, this.y, beamAngle, value, 'white', true, 10, 8));
                updateGameMessage(`${this.name} lancia un Raggio Sacro!`);
                break;
            case 'dark_wings':
                this.speed *= value;
                updateGameMessage(`${this.name} apre le ali oscure e accelera!`);
                break;
            case 'chaos_blast':
                floorEffects.push(new FloorEffect(this.x, this.y, value * 2, 'rgba(138, 43, 226, 0.6)', 25, 'chaos', value));
                updateGameMessage(`${this.name} rilascia un'Esplosione del Caos!`);
                break;
            case 'dimensional_rift':
                for (let i = 0; i < 3; i++) {
                    const riftX = player.x + rand(-150, 150);
                    const riftY = player.y + rand(-150, 150);
                    floorEffects.push(new FloorEffect(riftX, riftY, value, 'rgba(0, 0, 0, 0.7)', 200, 'void', value));
                }
                updateGameMessage(`${this.name} apre Fessure Dimensionali!`);
                break;
        }
    }

    draw() {
        if (this.isSpawning) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.spawnTimer / 120})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.spawnEffectSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalAlpha = 0.5;
            super.draw();
            ctx.globalAlpha = 1.0;
        } else {
            super.draw();
        }
        this.drawHealthBar();
    }
}

class Portal {
    constructor(x, y, width, height, type = 'next') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.scale = 1.0;
        this.scaleDirection = 0.005;
        this.maxScale = 1.05;
        this.minScale = 0.95;
    }

    update() {
        this.scale += this.scaleDirection;
        if (this.scale > this.maxScale || this.scale < this.minScale) {
            this.scaleDirection *= -1;
        }
    }

    draw() {
        const centerX = this.x;
        const centerY = this.y;
        const currentWidth = this.width * this.scale;
        const currentHeight = this.height * this.scale;
        
        let gradient;
        if (this.type === 'boss') {
            gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(currentWidth, currentHeight));
            gradient.addColorStop(0, 'rgba(255, 69, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(139, 0, 0, 0.4)');
        } else if (this.type === 'merchant') {
            gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(currentWidth, currentHeight));
            gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(218, 165, 32, 0.4)');
        } else {
            gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(currentWidth, currentHeight));
            gradient.addColorStop(0, 'rgba(106, 90, 205, 0.8)');
            gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.6)');
            gradient.addColorStop(1, 'rgba(0, 0, 128, 0.4)');
        }

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, currentWidth / 2, currentHeight / 2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, currentWidth / 2 * 1.1, currentHeight / 2 * 1.1, 0, 0, 2 * Math.PI);
        ctx.fillStyle = this.type === 'boss' ? 'rgba(255, 69, 0, 0.1)' : 
                         this.type === 'merchant' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(75, 0, 130, 0.1)';
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#EEE';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`NEXT`, centerX, centerY - 10);
        ctx.fillText(`FLOOR`, centerX, centerY + 5);
        
        if (this.type === 'boss') {
            ctx.fillStyle = 'red';
            ctx.font = '16px "Press Start 2P"';
            ctx.fillText(`BOSS`, centerX, centerY + 30);
        } else if (this.type === 'merchant') {
            ctx.fillStyle = 'gold';
            ctx.font = '16px "Press Start 2P"';
            ctx.fillText(`MERCHANT`, centerX, centerY + 30);
        }
    }

    checkCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const a = this.width / 2;
        const b = this.height / 2;

        const normalizedX = dx / a;
        const normalizedY = dy / b;

        return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
    }
}

class DungeonFloor {
    constructor(floorNumber) {
        this.floorNumber = floorNumber;
        this.initialMonsters = [];
        this.activeMonsters = [];
        this.type = 'monster';
        this.cleared = false;
        this.portal = null;
        this.spawnComplete = false;

        if (floorNumber === 0) {
            this.type = 'start';
            this.cleared = true;
        } else if ((floorNumber + 1) % 10 === 0) {
            this.type = 'boss';
            this.initialMonsters = this.generateBossMonsters(floorNumber);
        } else if ((floorNumber + 1) % 10 === 1) {
            this.type = 'merchant';
            this.initialMonsters = [];
            this.cleared = true;
        } else if ((floorNumber + 1) % 10 === 9) {
            this.type = 'preBoss';
            this.initialMonsters = this.generateMonsters(floorNumber);
        } else {
            this.type = 'monster';
            this.initialMonsters = this.generateMonsters(floorNumber);
        }

        if (this.type === 'monster' || this.type === 'boss' || this.type === 'preBoss') {
            this.activeMonsters = this.initialMonsters.map(m => new Monster(m.x, m.y, {
                name: m.name, hp: m.hp, atk: m.atk, def: m.def, xp: m.xp, gold: m.gold,
                color: m.color, speed: m.speed, cooldown: m.cooldown, maxHp: m.maxHp,
                abilityType: m.abilityType, abilityValue: m.abilityValue, abilityCooldown: m.abilityCooldown,
                abilityDuration: m.abilityDuration
            }));
        } else {
            this.activeMonsters = [];
        }
    }

    generateMonsters(floor) {
        const monstersOnFloor = [];
        const numMonsters = Math.min(5, Math.floor(floor / 5) + 2);

        let monsterPool = [];
        if (floor < 3) {
            monsterPool = ['slime'];
        } else if (floor < 7) {
            monsterPool = ['slime', 'druid'];
        } else if (floor < 12) {
            monsterPool = ['slime', 'druid', 'orc', 'skeleton'];
        } else if (floor < 20) {
            monsterPool = ['slime', 'druid', 'orc', 'skeleton', 'ghoul'];
        } else {
            monsterPool = ['slime', 'druid', 'orc', 'skeleton', 'ghoul', 'necromancer', 'dwarf'];
        }

        const playerCenterX = CANVAS_WIDTH / 2;
        const playerCenterY = CANVAS_HEIGHT / 2 + 50;

        for (let i = 0; i < numMonsters; i++) {
            const monsterType = monsterPool[rand(0, monsterPool.length - 1)];
            const typeData = { ...monstersData[monsterType] };

            const floorMultiplier = 1 + floor * 0.2;
            typeData.hp = Math.floor(typeData.hp * floorMultiplier);
            typeData.atk = Math.floor(typeData.atk * floorMultiplier);
            typeData.def = Math.floor(typeData.def * floorMultiplier);
            typeData.maxHp = typeData.hp;
            typeData.xp = Math.floor(typeData.xp * floorMultiplier);
            typeData.gold = Math.floor(typeData.gold * floorMultiplier);

            let x, y;
            let validPosition = false;
            let attempts = 0;
            
            while (!validPosition && attempts < 100) {
                x = rand(ROOM_BUFFER, CANVAS_WIDTH - ROOM_BUFFER);
                y = rand(ROOM_BUFFER, CANVAS_HEIGHT - ROOM_BUFFER);
                
                const dx = x - playerCenterX;
                const dy = y - playerCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > SPAWN_SAFE_ZONE) {
                    validPosition = true;
                }
                
                attempts++;
            }

            monstersOnFloor.push({
                x: x, y: y, name: typeData.name, hp: typeData.hp, atk: typeData.atk, def: typeData.def, xp: typeData.xp, gold: typeData.gold,
                color: typeData.color, speed: typeData.speed, cooldown: typeData.cooldown, maxHp: typeData.maxHp,
                abilityType: typeData.abilityType, abilityValue: typeData.abilityValue, abilityCooldown: typeData.abilityCooldown,
                abilityDuration: typeData.abilityDuration
            });
        }
        return monstersOnFloor;
    }

    generateBossMonsters(floor) {
        const bosses = [];
        let bossType;

        const bossAssignments = {
            9: 'orc_boss',       
            19: 'necromancer_boss',
            29: 'dragon',        
            39: 'stone_golem',   
            49: 'lich_king',    
            59: 'thunder_titan', 
            69: 'abyss_guardian',
            79: 'flame_hydra',   
            89: 'fallen_angel',  
            99: 'chaos_lord'     
        };

        bossType = bossAssignments[floor] || 'chaos_lord';

        const typeData = { ...monstersData[bossType] };

        const floorPower = 1 + (floor - 9) * 0.15;
        
        typeData.hp = Math.floor(typeData.hp * floorPower);
        typeData.atk = Math.floor(typeData.atk * floorPower);
        typeData.def = Math.floor(typeData.def * floorPower);
        typeData.maxHp = typeData.hp;
        typeData.xp = Math.floor(typeData.xp * floorPower);
        typeData.gold = Math.floor(typeData.gold * floorPower);

        if (floor === 99) {
            typeData.hp = Math.floor(typeData.hp * 1.5);
            typeData.atk = Math.floor(typeData.atk * 1.4);
            typeData.def = Math.floor(typeData.def * 1.3);
            typeData.speed *= 1.2;
        }

        const x = CANVAS_WIDTH / 2;
        const y = CANVAS_HEIGHT / 2;
        bosses.push({
            x, y, 
            name: typeData.name, 
            hp: typeData.hp, 
            atk: typeData.atk, 
            def: typeData.def, 
            xp: typeData.xp, 
            gold: typeData.gold,
            color: typeData.color, 
            speed: typeData.speed, 
            cooldown: typeData.cooldown, 
            maxHp: typeData.maxHp,
            abilityType: typeData.abilityType, 
            abilityValue: typeData.abilityValue, 
            abilityCooldown: typeData.abilityCooldown
        });
        return bosses;
    }

    generatePortal(portalType = 'next') {
        if (this.portal) return;

        const portalWidth = 80;
        const portalHeight = 150;

        const portalX = CANVAS_WIDTH - portalWidth / 2 - 20;
        const portalY = CANVAS_HEIGHT / 2;

        this.portal = new Portal(portalX, portalY, portalWidth, portalHeight, portalType);
    }
}

// --- 5. Funzioni Principali del Gioco ---

function startGame() {
    gameState = 'playing';
    hideAllScreens();
    canvas.style.display = 'block';

    player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
    player.color = 'blue';

    dungeonFloors = [];
    for (let i = 0; i < TOWER_HEIGHT; i++) {
        dungeonFloors.push(new DungeonFloor(i));
    }

    currentFloor = 0;
    loadFloor(currentFloor);
    startGameLoop();
    updateHUD();
}

function loadFloor(floorNum) {
    if (floorNum >= TOWER_HEIGHT) {
        winGame();
        return;
    }

    currentFloor = floorNum;
    currentDungeonFloor = dungeonFloors[currentFloor];
    monsters = [...currentDungeonFloor.activeMonsters];

    projectiles = [];
    floorEffects = [];

    player.x = CANVAS_WIDTH / 2;
    player.y = CANVAS_HEIGHT / 2 + 50;
    player.isTransitioning = false;

    if (currentDungeonFloor.type === 'start') {
        currentDungeonFloor.generatePortal();
    }

    updateHUD();

    if (currentDungeonFloor.type === 'merchant') {
        enterMerchantScreen();
    } else {
        updateGameMessage(`Sei arrivato al Piano ${currentFloor + 1}. Preparati!`);
    }
}

function gameLoop() {
    if (gameState !== 'playing') return;

    if (mouseDown && player.shootCooldown <= 0) {
        const currentTime = Date.now();
        if (currentTime - lastShotTime > 100) {
            const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
            projectiles.push(new Projectile(player.x, player.y, angle, player.atk, 'yellow'));
            player.shootCooldown = player.maxShootCooldown;
            lastShotTime = currentTime;
        }
    }

    player.update();
    monsters.forEach(monster => monster.update());
    projectiles.forEach(projectile => projectile.update());
    floorEffects.forEach(effect => effect.update());
    if (currentDungeonFloor.portal) {
        currentDungeonFloor.portal.update();
    }

    projectiles = projectiles.filter(p => !p.isOffScreen());
    floorEffects = floorEffects.filter(e => e.duration > 0);

    handleCollisions();
    checkFloorCompletion();
    draw();

    gameLoopInterval = requestAnimationFrame(gameLoop);
}

function handleCollisions() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        if (p.isMonsterProjectile) continue;

        for (let j = monsters.length - 1; j >= 0; j--) {
            const m = monsters[j];
            if (m.isSpawning) continue;
            
            if (p.checkCollision(m)) {
                const damageDealt = m.takeDamage(p.damage);
                if (damageDealt > 0) {
                    updateGameMessage(`Hai colpito ${m.name} per ${damageDealt} danni.`);
                }

                if (m.hp <= 0) {
                    updateGameMessage(`Hai sconfitto ${m.name}! Hai ottenuto ${m.xp} XP e ${m.gold} oro!`);
                    player.addXP(m.xp);
                    player.gold += m.gold;
                    updateHUD();
                    
                    // Rimuovi da entrambi gli array
                    const indexInActive = currentDungeonFloor.activeMonsters.indexOf(m);
                    if (indexInActive !== -1) currentDungeonFloor.activeMonsters.splice(indexInActive, 1);
                    monsters.splice(j, 1);
                }

                projectiles.splice(i, 1);
                break;
            }
        }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        if (!p.isMonsterProjectile) continue;

        if (player.checkCollision(p) && !player.isInvincible) {
            const damageDealt = player.takeDamage(p.damage);
            if (damageDealt > 0) {
                updateGameMessage(`Sei stato colpito da ${damageDealt} danni!`);
                updateHUD();
            }

            if (p.statusEffect) {
                player.applyStatusEffect(p.statusEffect, p.effectDuration, p.effectValue);
            }

            projectiles.splice(i, 1);

            if (player.hp <= 0) {
                gameOver();
                return;
            }
            updateHUD();
        }
    }

    if (currentDungeonFloor.cleared && currentDungeonFloor.portal) {
        const portal = currentDungeonFloor.portal;
        if (portal.checkCollision(player) && !player.isTransitioning) {
            if (monsters.length > 0) {
                updateGameMessage("Devi sconfiggere tutti i mostri prima di procedere!");
                return;
            }
            
            player.isTransitioning = true;
            setTimeout(() => {
                loadFloor(currentFloor + 1);
            }, 100);
        }
    }
}

function checkFloorCompletion() {
    if (currentDungeonFloor.type === 'monster' || 
        currentDungeonFloor.type === 'boss' || 
        currentDungeonFloor.type === 'preBoss') {
        
        if (monsters.length === 0 && !currentDungeonFloor.cleared) {
            currentDungeonFloor.cleared = true;
            updateGameMessage(`Piano ${currentFloor + 1} completato!`);
            
            if (currentDungeonFloor.type === 'preBoss') {
                currentDungeonFloor.generatePortal('boss');
            } else if (currentDungeonFloor.type === 'boss') {
                currentDungeonFloor.generatePortal('next');
            } else {
                currentDungeonFloor.generatePortal();
            }
        }
    }
}

function draw() {
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (currentDungeonFloor.portal) {
        currentDungeonFloor.portal.draw();
    }

    floorEffects.forEach(effect => effect.draw());
    player.draw();
    player.drawHealthBar();
    monsters.forEach(monster => monster.draw());
    projectiles.forEach(projectile => projectile.draw());
}

function gameOver() {
    gameState = 'gameover';
    cancelAnimationFrame(gameLoopInterval);
    showScreen(gameOverScreen);
}

function winGame() {
    gameState = 'win';
    cancelAnimationFrame(gameLoopInterval);
    showScreen(winScreen);
}

function hideAllScreens() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    merchantScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    commandsScreen.classList.add('hidden');
    indexDialog.classList.add('hidden');
    canvas.style.display = 'block';
}

function showScreen(screen) {
    hideAllScreens();
    
    if (screen === commandsScreen && gameState !== 'paused') {
        return;
    }
    
    screen.classList.remove('hidden');
    
    if (screen !== canvas) {
        canvas.style.display = 'none';
    }
}

function enterMerchantScreen() {
    gameState = 'merchant';
    cancelAnimationFrame(gameLoopInterval);
    showScreen(merchantScreen);
    renderMerchantOptions();
}

function renderMerchantOptions() {
    merchantUpgradesDiv.innerHTML = '<h3>Potenziamenti</h3>';
    merchantAbilitiesDiv.innerHTML = '<h3>Abilità</h3>';

    const hpUpgradePrice = player.level * 10;
    const hpUpgradeButton = document.createElement('button');
    hpUpgradeButton.textContent = `Aumenta HP Massimi (+20) - Costo: ${hpUpgradePrice} Oro`;
    hpUpgradeButton.classList.add('merchant-button');
    if (player.gold >= hpUpgradePrice) {
        hpUpgradeButton.addEventListener('click', () => {
            player.gold -= hpUpgradePrice;
            player.maxHp += 20;
            player.hp = player.maxHp;
            updateHUD();
            renderMerchantOptions();
            updateGameMessage("HP Massimi aumentati!");
        });
    } else {
        hpUpgradeButton.disabled = true;
    }
    merchantUpgradesDiv.appendChild(hpUpgradeButton);

    const atkUpgradePrice = player.level * 15;
    const atkUpgradeButton = document.createElement('button');
    atkUpgradeButton.textContent = `Aumenta ATK (+3) - Costo: ${atkUpgradePrice} Oro`;
    atkUpgradeButton.classList.add('merchant-button');
    if (player.gold >= atkUpgradePrice) {
        atkUpgradeButton.addEventListener('click', () => {
            player.gold -= atkUpgradePrice;
            player.atk += 3;
            updateHUD();
            renderMerchantOptions();
            updateGameMessage("Attacco aumentato!");
        });
    } else {
        atkUpgradeButton.disabled = true;
    }
    merchantUpgradesDiv.appendChild(atkUpgradeButton);

    const defUpgradePrice = player.level * 12;
    const defUpgradeButton = document.createElement('button');
    defUpgradeButton.textContent = `Aumenta DEF (+1) - Costo: ${defUpgradePrice} Oro`;
    defUpgradeButton.classList.add('merchant-button');
    if (player.gold >= defUpgradePrice) {
        defUpgradeButton.addEventListener('click', () => {
            player.gold -= defUpgradePrice;
            player.def += 1;
            updateHUD();
            renderMerchantOptions();
            updateGameMessage("Difesa aumentata!");
        });
    } else {
        defUpgradeButton.disabled = true;
    }
    merchantUpgradesDiv.appendChild(defUpgradeButton);

    const agiUpgradePrice = player.level * 15;
    const agiUpgradeButton = document.createElement('button');
    agiUpgradeButton.textContent = `Aumenta AGI (+1) - Costo: ${agiUpgradePrice} Oro`;
    agiUpgradeButton.classList.add('merchant-button');
    if (player.gold >= agiUpgradePrice) {
        agiUpgradeButton.addEventListener('click', () => {
            player.gold -= agiUpgradePrice;
            player.agility += 1;
            updateHUD();
            renderMerchantOptions();
            updateGameMessage("Agilità aumentata!");
        });
    } else {
        agiUpgradeButton.disabled = true;
    }
    merchantUpgradesDiv.appendChild(agiUpgradeButton);

    const potionPrice = 25;
    const potionHealAmount = 50;
    const potionButton = document.createElement('button');
    potionButton.textContent = `Pozione di Cura (+${potionHealAmount} HP) - Costo: ${potionPrice} Oro`;
    potionButton.classList.add('merchant-button');
    if (player.gold >= potionPrice) {
        potionButton.addEventListener('click', () => {
            player.gold -= potionPrice;
            player.hp = Math.min(player.maxHp, player.hp + potionHealAmount);
            updateHUD();
            renderMerchantOptions();
            updateGameMessage("Hai bevuto una pozione e sei stato curato!");
        });
    } else {
        potionButton.disabled = true;
    }
    merchantUpgradesDiv.appendChild(potionButton);

    const dashPrice = 100;
    if (!player.hasDash) {
        const dashButton = document.createElement('button');
        dashButton.textContent = `Impara Dash - Costo: ${dashPrice} Oro`;
        dashButton.classList.add('merchant-button');
        if (player.gold >= dashPrice) {
            dashButton.addEventListener('click', () => {
                player.gold -= dashPrice;
                player.hasDash = true;
                updateHUD();
                renderMerchantOptions();
                updateGameMessage("Hai imparato Dash!");
            });
        } else {
            dashButton.disabled = true;
        }
        merchantAbilitiesDiv.appendChild(dashButton);
    }

    const invisibilityPrice = 200;
    if (!player.hasInvisibility) {
        const invisibilityButton = document.createElement('button');
        invisibilityButton.textContent = `Impara Invisibilità - Costo: ${invisibilityPrice} Oro`;
        invisibilityButton.classList.add('merchant-button');
        if (player.gold >= invisibilityPrice) {
            invisibilityButton.addEventListener('click', () => {
                player.gold -= invisibilityPrice;
                player.hasInvisibility = true;
                updateHUD();
                renderMerchantOptions();
                updateGameMessage("Hai imparato Invisibilità!");
            });
        } else {
            invisibilityButton.disabled = true;
        }
        merchantAbilitiesDiv.appendChild(invisibilityButton);
    }

    const fireballPrice = 400;
    if (!player.hasFireball) {
        const fireballButton = document.createElement('button');
        fireballButton.textContent = `Impara Palla di Fuoco - Costo: ${fireballPrice} Oro`;
        fireballButton.classList.add('merchant-button');
        if (player.gold >= fireballPrice) {
            fireballButton.addEventListener('click', () => {
                player.gold -= fireballPrice;
                player.hasFireball = true;
                updateHUD();
                renderMerchantOptions();
                updateGameMessage("Hai imparato Palla di Fuoco!");
            });
        } else {
            fireballButton.disabled = true;
        }
        merchantAbilitiesDiv.appendChild(fireballButton);
    }
}

function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        showScreen(pauseScreen);
        cancelAnimationFrame(gameLoopInterval);
    } else if (gameState === 'paused') {
        if (!indexDialog.classList.contains('hidden')) {
            closeIndex();
            return;
        }
        
        gameState = 'playing';
        hideAllScreens();
        canvas.style.display = 'block';
        startGameLoop();
    }
}

function showControls() {
    showScreen(commandsScreen);
}

function showIndex() {
    monstersInfoDiv.innerHTML = '';
    
    for (const key in monstersData) {
        const monster = monstersData[key];
        const monsterDiv = document.createElement('div');
        monsterDiv.className = 'monster-info';
        
        monsterDiv.innerHTML = `
            <div class="monster-header" style="background-color: ${monster.color};">
                <h3>${monster.name}</h3>
            </div>
            <div class="monster-stats">
                <p>HP: ${monster.hp}</p>
                <p>ATK: ${monster.atk}</p>
                <p>DEF: ${monster.def}</p>
                <p>XP: ${monster.xp}</p>
                <p>Oro: ${monster.gold}</p>
                <p>Velocità: ${monster.speed}</p>
            </div>
            <div class="monster-abilities">
                <h4>Abilità:</h4>
                ${monster.abilityType ? 
                    (Array.isArray(monster.abilityType) ? 
                        monster.abilityType.map(ability => `<p>${formatAbilityName(ability)}</p>`).join('') : 
                        `<p>${formatAbilityName(monster.abilityType)}</p>`) 
                    : '<p>Nessuna abilità speciale</p>'}
            </div>
        `;
        
        monstersInfoDiv.appendChild(monsterDiv);
    }
    
    pauseScreen.classList.add('hidden');
    indexDialog.classList.remove('hidden');
}

function formatAbilityName(ability) {
    const names = {
        'wind_fury': 'Furia del Vento',
        'aoe_stomp': 'Stomp Area',
        'speed_boost': 'Boost Velocità',
        'fire_breath': 'Respiro di Fuoco',
        'push_back': 'Spinta',
        'spawn_minions': 'Evoca Minion',
        'charge': 'Carica',
        'cursed_projectile': 'Proiettile Maledetto',
        'flame_patch': 'Macchia di Fuoco',
        'earthquake': 'Terremoto',
        'rock_barrier': 'Barriera di Roccia',
        'ice_nova': 'Nova di Ghiaccio',
        'summon_ghosts': 'Evoca Fantasmi',
        'lightning_storm': 'Tempesta di Fulmini',
        'chain_lightning': 'Fulmine a Catena',
        'void_teleport': 'Teletrasporto nel Vuoto',
        'dark_pulse': 'Impulso Oscuro',
        'triple_fireball': 'Tripla Palla di Fuoco',
        'lava_pool': 'Pozza di Lava',
        'holy_beam': 'Raggio Sacro',
        'dark_wings': 'Ali Oscure',
        'chaos_blast': 'Esplosione del Caos',
        'dimensional_rift': 'Fessura Dimensionale'
    };
    
    return names[ability] || ability;
}

function closeIndex() {
    indexDialog.classList.add('hidden');
    pauseScreen.classList.remove('hidden');
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateHUD() {
    playerHpSpan.textContent = Math.max(0, Math.floor(player.hp));
    playerMaxHpSpan.textContent = player.maxHp;
    playerAtkSpan.textContent = player.atk;
    playerDefSpan.textContent = player.def;
    playerAgiSpan.textContent = player.agility;
    playerGoldSpan.textContent = player.gold;
    playerLevelSpan.textContent = player.level;
    currentFloorDisplay.textContent = currentFloor + 1;
    totalFloorsDisplay.textContent = TOWER_HEIGHT;

    playerExpSpan.textContent = player.xp;
    const expNeeded = player.level < XP_TO_LEVEL_UP.length 
        ? XP_TO_LEVEL_UP[player.level] 
        : "MAX";
    expToNextLevelSpan.textContent = expNeeded;

    const expPercentage = player.level < XP_TO_LEVEL_UP.length
        ? (player.xp / XP_TO_LEVEL_UP[player.level]) * 100
        : 100;
    
    expBarFill.style.width = `${expPercentage}%`;
}

function updateGameMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('game-message');
    
    if (message.includes("Devi sconfiggere")) {
        messageElement.innerHTML = '⚠️ ' + message;
        messageElement.classList.add('warning-message');
    } else {
        messageElement.textContent = message;
    }
    
    gameMessagesDiv.prepend(messageElement);

    if (gameMessagesDiv.children.length > 5) {
        gameMessagesDiv.removeChild(gameMessagesDiv.lastChild);
    }
}

function startGameLoop() {
    if (gameLoopInterval) {
        cancelAnimationFrame(gameLoopInterval);
    }
    
    gameLoopInterval = requestAnimationFrame(gameLoop);
}

// --- 6. Gestione degli Eventi ---

window.addEventListener('load', () => {
    hideAllScreens();
    startScreen.classList.remove('hidden');
    canvas.style.display = 'none';
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', startGame);
    merchantExitButton.addEventListener('click', exitMerchant);
    
    resumeButton.addEventListener('click', togglePause);
    menuButton.addEventListener('click', returnToMenu);
    controlsButton.addEventListener('click', showControls);
    indexButton.addEventListener('click', showIndex);
    commandsBackButton.addEventListener('click', backFromCommands);
    closeIndexButton.addEventListener('click', closeIndex);
    
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0 && gameState === 'playing') {
            mouseDown = true;
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            mouseDown = false;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        mouseDown = false;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!indexDialog.classList.contains('hidden')) {
                closeIndex();
                return;
            }
            togglePause();
        }

        keys[e.key.toLowerCase()] = true;
        
        if (gameState === 'playing') {
            if (e.key === 'q' && player.hasDash) {
                player.activateDash();
            }
            if (e.key === 'e' && player.hasFireball) {
                player.activateFireball();
            }
            if (e.key === 'r' && player.hasInvisibility) {
                player.activateInvisibility();
            }
        }
    });
});

function exitMerchant() {
    hideAllScreens();
    gameState = 'playing';
    
    currentDungeonFloor.generatePortal('merchant');
    
    startGameLoop();
}

function returnToMenu() {
    gameState = 'menu';
    hideAllScreens();
    showScreen(startScreen);
}

function backFromCommands() {
    showScreen(pauseScreen);
}