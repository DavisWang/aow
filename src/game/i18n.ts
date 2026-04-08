export type Locale = "en" | "zh";

let currentLocale: Locale = "en";
try {
  const stored = localStorage.getItem("aow-locale");
  if (stored === "en" || stored === "zh") {
    currentLocale = stored;
  }
} catch {
  // localStorage unavailable (private browsing, etc.)
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  try {
    localStorage.setItem("aow-locale", locale);
  } catch {
    // ignore
  }
}

export function toggleLocale(): Locale {
  const next = currentLocale === "en" ? "zh" : "en";
  setLocale(next);
  return next;
}

const translations: Record<string, Record<Locale, string>> = {
  title: { en: "AGE OF WAR", zh: "战争时代" },
  subtitle: { en: "Conquer five ages of warfare", zh: "征服五个战争时代" },
  howToPlay: {
    en: "Fight across one lane.\nEarn kill XP to climb all five ages.\nBreak the enemy base before their late game arrives.",
    zh: "在一条通道上作战。\n通过击杀获取经验，跨越五个时代。\n在敌方后期来临前摧毁敌方基地。",
  },
  newGame: { en: "NEW GAME", zh: "新游戏" },
  testMode: { en: "TEST MODE", zh: "测试模式" },
  testModeHint: { en: "UNLIMITED CASH, XP, AND SUPERS", zh: "无限金钱、经验和超级技能" },
  byStudio: { en: "By Pwner Studios", zh: "By Pwner Studios" },

  yourBase: { en: "YOUR BASE", zh: "我方基地" },
  enemyBase: { en: "ENEMY BASE", zh: "敌方基地" },
  buyUnits: { en: "BUY UNITS", zh: "购买单位" },
  buyTowers: { en: "BUY TOWERS", zh: "购买塔楼" },
  battleOver: { en: "BATTLE OVER", zh: "战斗结束" },
  playAgain: { en: "PLAY AGAIN", zh: "再来一局" },
  winMessage: {
    en: "Enemy base destroyed.\nYour war machine holds.",
    zh: "敌方基地已被摧毁。\n你的战争机器坚不可摧。",
  },
  loseMessage: {
    en: "Your base fell.\nRebuild and try again.",
    zh: "你的基地已沦陷。\n重整旗鼓再战。",
  },
  drawMessage: {
    en: "Both bases collapsed.\nCall it a draw.",
    zh: "双方基地同时倒塌。\n以平局收场。",
  },
  baseHp: { en: "Base HP", zh: "基地血量" },
  enemyHp: { en: "Enemy HP", zh: "敌方血量" },
  money: { en: "Money", zh: "金钱" },
  xp: { en: "XP", zh: "经验" },
  finalAge: { en: "FINAL AGE", zh: "最终时代" },
  buildQueue: { en: "Build Queue", zh: "建造队列" },
  player: { en: "Player", zh: "玩家" },
  enemy: { en: "Enemy", zh: "敌方" },
  units: { en: "Units", zh: "单位" },
  towers: { en: "Towers", zh: "塔楼" },
  super: { en: "SUPER", zh: "超级" },
  advance: { en: "ADVANCE", zh: "进化" },
  age: { en: "AGE", zh: "时代" },
  testSubtitle: {
    en: "TEST MODE: free cash, XP, and full ladder previews",
    zh: "测试模式：无限金钱、经验和全阵容预览",
  },
  normalSubtitle: {
    en: "Build units, towers, supers, and age up on kill XP",
    zh: "建造单位、塔楼和超级技能，通过击杀经验进化",
  },
};

export function t(key: string): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLocale] ?? entry.en ?? key;
}

const nameTranslations: Record<string, string> = {
  // Age themes
  Prehistoric: "远古",
  Medieval: "中世纪",
  Renaissance: "文艺复兴",
  Modern: "现代",
  Future: "未来",

  // Units — Prehistoric
  Caveman: "穴居人",
  Stonethrower: "投石手",
  "Dino Rider": "恐龙骑士",
  // Units — Medieval
  Swordsman: "剑士",
  Archer: "弓箭手",
  Knight: "骑士",
  // Units — Renaissance
  Musketeer: "火枪手",
  Cannoneer: "炮手",
  Cavalier: "骑兵",
  // Units — Modern
  "Ground Infantry": "步兵",
  "Machine Gunner": "机枪手",
  Tank: "坦克",
  // Units — Future
  Sentinels: "哨兵",
  "Plasma Ranger": "等离子游侠",
  "Titan Walker": "泰坦步行者",
  "Omega Colossus": "终极巨像",

  // Towers — Prehistoric
  "Stone Guard": "石卫塔",
  "Fossil Catapult": "化石投石车",
  "Ember Totem": "余烬图腾",
  // Towers — Medieval
  "Arrow Tower": "箭塔",
  "Ballista Tower": "弩炮塔",
  "Fire Cauldron": "火油锅",
  // Towers — Renaissance
  "Arquebus Tower": "火绳枪塔",
  "Bombard Tower": "轰炸塔",
  "Alchemist Tower": "炼金塔",
  // Towers — Modern
  "Gun Turret": "机枪塔",
  "Gatling Gun": "加特林炮",
  "Missile Launcher": "导弹发射器",
  // Towers — Future
  "Pulse Turret": "脉冲炮塔",
  "Drone Bay": "无人机舱",
  "Ion Blaster": "离子炮",
};

/** Translate an entity or theme name. Returns the original in EN mode. */
export function tn(englishName: string): string {
  if (currentLocale === "en") return englishName;
  return nameTranslations[englishName] ?? englishName;
}
