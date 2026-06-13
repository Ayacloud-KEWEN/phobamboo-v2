// One-shot: fill EN + ZH names for existing dishes (migrated FR-only).
// Idempotent — only fills fields that are still EMPTY, never overwrites.
//   cd /home/app/backend && node scripts/translate-products.js
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// id -> { en, zh }
const T = {
  // ---- ALCOOL ----
  '3PixvfS8TwioHCe50oyQ': { en: '501 Mojito 40cl', zh: '501 莫吉托 40cl' },
  nHNWqZ6b91YArp9wqnPA: { en: '502 Ricard / Campari 4cl', zh: '502 里卡德 / 金巴利 4cl' },
  HwMKOVBLkngdqVQMTvp6: { en: '503 Martini Rosso / Bianco 4cl', zh: '503 马天尼 红 / 白 4cl' },
  GASo1LJ4okQBuTeprb48: { en: '504 Kir (white wine) 12cl', zh: '504 基尔白葡萄酒 12cl' },
  '5Q0zURWRK7oWxjSxhgYX': { en: "505 J&B / Jack Daniel's 4cl", zh: '505 珍宝 / 杰克丹尼威士忌 4cl' },
  '22h055HZnUxBWCa32EMG': { en: '506 Johnnie Walker Black Label 4cl', zh: '506 尊尼获加黑牌 4cl' },
  OhqZbx8y8bY4yDoLdyQq: { en: '507 Tsingtao / Asahi 33cl', zh: '507 青岛 / 朝日啤酒 33cl' },
  '7KXQ4OetUW9VhTz4O20J': { en: '508 Carlsberg / Leffe 33cl', zh: '508 嘉士伯 / 乐飞啤酒 33cl' },
  '3MquccbLCI9ccHZJFekx': { en: '509 Desperados / Heineken 33cl', zh: '509 Desperados / 喜力啤酒 33cl' },
  oSqSPh4KPVy8fkywWGEe: { en: '510 Heineken / Bud 25cl', zh: '510 喜力 / 百威啤酒 25cl' },
  ZBnXYdDLmfwCbnBjg4nt: { en: '511 Muscadet white wine 75cl', zh: '511 慕斯卡德白葡萄酒 75cl' },
  '3JVwxzhmbtsjuIpLXoKi': { en: '512 Muscadet white wine 37.5cl', zh: '512 慕斯卡德白葡萄酒 37.5cl' },
  lYLwmK6S1g7pEii1FvRs: { en: '513 Pouilly-Fumé white wine 75cl', zh: '513 普伊-富美白葡萄酒 75cl' },
  LLSVBXzLnaPd1lOhZlie: { en: '514 Côtes de Provence rosé 75cl', zh: '514 普罗旺斯桃红葡萄酒 75cl' },
  c7G7kDxGOwaiBFCDuE9B: { en: '515 Côtes de Provence rosé 37.5cl', zh: '515 普罗旺斯桃红葡萄酒 37.5cl' },
  ZgiAwQyMD5Qt5Ps9CKuG: { en: '516 Sancerre white wine, Réserve 75cl', zh: '516 桑塞尔白葡萄酒 珍藏 75cl' },
  ApgRf8sfe8jkzm02uQ9V: { en: '517 Bordeaux red wine 75cl', zh: '517 波尔多红葡萄酒 75cl' },
  RHnDWoFY8zbDdNEoIBY4: { en: '518 Bordeaux red wine 37.5cl', zh: '518 波尔多红葡萄酒 37.5cl' },
  RNlOYnKsl9UlBK5GCxdJ: { en: '519 Saint-Émilion red wine, Excellence 75cl', zh: '519 圣埃美隆红葡萄酒 精选 75cl' },
  MxY9FLrErsvmZCPafTlI: { en: '520 Saumur-Champigny red wine 75cl', zh: '520 索缪-香比尼红葡萄酒 75cl' },
  JJrZdnIkl2aCRRfXfhZT: { en: '5211 Carafe Sauvignon 12cl', zh: '5211 壶装长相思白葡萄酒 12cl' },
  axzeUKCiPOIaGgtURJPF: { en: '5212 Carafe Sauvignon 25cl', zh: '5212 壶装长相思白葡萄酒 25cl' },
  iJhlVBaeqPOBxi2P1lUy: { en: '5213 Carafe Sauvignon 50cl', zh: '5213 壶装长相思白葡萄酒 50cl' },
  DQn4S7MWwbycOuq9jPmi: { en: '5214 Carafe J.P Chenet 12cl', zh: '5214 壶装 J.P Chenet 12cl' },
  S8YoYsPSANhow40VQF9P: { en: '5215 Carafe J.P Chenet 25cl', zh: '5215 壶装 J.P Chenet 25cl' },
  ARFf5CIZNRFgVGsqSjf1: { en: '5216 Carafe J.P Chenet 50cl', zh: '5216 壶装 J.P Chenet 50cl' },
  '9kVTYYQT1Zt9f0qeqjfH': { en: '5217 Carafe Bordeaux 12cl', zh: '5217 壶装波尔多 12cl' },
  '4FOug7axJGTUYz9fg88k': { en: '5218 Carafe Bordeaux 25cl', zh: '5218 壶装波尔多 25cl' },
  TKmmxPYfth6AA8SoT3Ej: { en: '5219 Carafe Bordeaux 50cl', zh: '5219 壶装波尔多 50cl' },
  eT7adEayoo8iBiey2p68: { en: '522 Mei Kuei Lu liquor 2cl', zh: '522 玫瑰露酒 2cl' },
  Pkjrvjg9YHM56cHelHcC: { en: '523 Hennessy VSOP Cognac 4cl', zh: '523 轩尼诗 VSOP 干邑 4cl' },
  zkHo6Ub7KhAZo54wtgnj: { en: '524 Armagnac 4cl', zh: '524 雅文邑白兰地 4cl' },
  '5iJZDgnL8ZZZxxxW4B2c': { en: "525 Bailey's 4cl", zh: '525 百利甜酒 4cl' },
  yzklz8OFQXnXpWtIpawI: { en: '526 Calvados / Vodka 4cl', zh: '526 卡尔瓦多斯苹果白兰地 / 伏特加 4cl' },
  MZq2iWAjrT6zJw9iJHHo: { en: '527 Get 27 (mint) 4cl', zh: '527 Get 27 薄荷利口酒 4cl' },
  XmLFvzFYpYqCXyYrRasO: { en: '528 Poire Williams 4cl', zh: '528 威廉姆斯梨子白兰地 4cl' },

  // ---- BOISSONS ----
  eueN9oNWRyIUz1fqU8eD: { en: '401 Cristaline still water 50cl', zh: '401 Cristaline 矿泉水 50cl' },
  vkfDZgMXfd5XxyLRIMo4: { en: '402 Cristaline still water 100cl', zh: '402 Cristaline 矿泉水 100cl' },
  si9MmkSIz3atKXJAcJzZ: { en: '403 Evian 50cl', zh: '403 依云矿泉水 50cl' },
  AGfN8fPT4IC5F0gnjnOV: { en: '404 Evian 100cl', zh: '404 依云矿泉水 100cl' },
  '0DawUazkwR6UGzctAhgu': { en: '405 San Pellegrino sparkling 50cl', zh: '405 圣培露气泡水 50cl' },
  kIgnSA66SZsqkc6Pf9uT: { en: '406 San Pellegrino sparkling 100cl', zh: '406 圣培露气泡水 100cl' },
  '1yeFB336vVxoUd9olhAY': { en: '407 Coke / Coke Zero 33cl', zh: '407 可乐 / 零度可乐 33cl' },
  v5dOGhozWFxgJTjK5y9K: { en: '408 Fanta / Orangina 33cl', zh: '408 芬达 / Orangina 33cl' },
  SgfrgYGbsNCIO5Mcw6yv: { en: '409 Ice Tea / Sprite 33cl', zh: '409 冰红茶 / 雪碧 33cl' },
  oNKdxxGeSRXNuwbOLebQ: { en: '410 Schweppes 33cl', zh: '410 怡泉 Schweppes 33cl' },
  '8tjmyzp9nnt4EcTTNkrl': { en: '411 Red Bull 25cl', zh: '411 红牛 25cl' },
  uOCfSYkYaXO21H64G194: { en: '412 Lychee / Mango juice 33cl', zh: '412 荔枝 / 芒果汁 33cl' },
  sgijAq61yOpPZ4XyhwNu: { en: '413 Coconut / Tamarind juice 33cl', zh: '413 椰子 / 罗望子汁 33cl' },
  skpUwAk6z42xZ36zyfE6: { en: '414 Orange / Apricot juice 25cl', zh: '414 橙汁 / 杏汁 25cl' },
  J3q9cSOcAc9P5PxaZc3w: { en: '415 Pineapple / Apple juice 25cl', zh: '415 菠萝 / 苹果汁 25cl' },
  '0scPxyh4MVJFjbdCy1bu': { en: '416 Ginger Beer 33cl', zh: '416 姜汁啤酒(无酒精) 33cl' },
  TEyxUq9WJ6HrLnWF2JOT: { en: '417 Soy Milk 33cl', zh: '417 豆奶 33cl' },
  hJqtgiQBWZRHckpbvHxg: { en: '418 Apple Mojito (alcohol-free) 40cl', zh: '418 苹果莫吉托(无酒精) 40cl' },
  Wjlp25HlSggPUXwcAPWd: { en: '419 Jasmine / Green / Black Tea', zh: '419 茉莉花茶 / 绿茶 / 红茶' },
  KeGV05l4T1oWiRmTYtWO: { en: '420 Fresh Mint Green Tea', zh: '420 鲜薄荷绿茶' },
  LskTBwRH3eZAVvkI7alP: { en: '421 Red Fruits Tea', zh: '421 红果茶' },
  Zi2T4BX0H7P4DY8S2Jtr: { en: '422 Herbal / Verbena Infusion', zh: '422 花草茶 / 马鞭草茶' },
  aHXkyjigsfxu78AmbZNP: { en: '423 Lemon Ginger Honey', zh: '423 柠檬姜汁蜂蜜茶' },
  CcSMrrsooUNcA7Koxvix: { en: '424 Chrysanthemum Goji Tea', zh: '424 菊花枸杞茶' },
  '3m3wgrnHpgnIQb6wk4iV': { en: '425 Nespresso Coffee', zh: '425 Nespresso 咖啡' },
  sZbg3sTt6UYTMKU2bK48: { en: '426 Large Café Crème', zh: '426 大杯奶咖' },
  ksunoMEA5mmbAM3aKW28: { en: '427 Vietnamese Coffee', zh: '427 越南咖啡' },
  Tx7ZYDxRJ2Q4G2FOPHQk: { en: '428 Iced Green Tea with Lemon 40cl', zh: '428 柠檬冰绿茶 40cl' },
  '7KCwkCMTZckGzakE6axX': { en: '429 Iced Fruit Tea (Passion, Peach, Lychee, Raspberry) 40cl', zh: '429 水果冰茶(百香果/桃/荔枝/覆盆子) 40cl' },
  Ykm6hheywwMw5mjBKozU: { en: '430 Iced Vietnamese Milk Coffee 40cl', zh: '430 越南冰奶咖 40cl' },
  KEx8IY4tT0tusWoyZbt4: { en: '431 Coconut Water with Pulp 40cl', zh: '431 椰子水(含椰肉) 40cl' },

  // ---- DESSERTS ----
  aiSjUdpjtnGpZt3oy2aW: { en: '301 Fresh Pineapple', zh: '301 新鲜菠萝' },
  egt7rYgsDsD6Q64fDYE1: { en: '302 Lychee in Syrup', zh: '302 糖水荔枝' },
  xpqq8xC4NXiLAiQkTI8I: { en: '303 Fresh Mango', zh: '303 新鲜芒果' },
  l5RDKj5Bbg7BQlz2XTC6: { en: '304 Fruit Salad', zh: '304 水果沙拉' },
  jOau0EHM32yXCIFXuXgT: { en: '305 Coconut Glutinous Balls x2', zh: '305 椰丝糯米糍 x2' },
  emGZR1i2JTnuY3WyvaWD: { en: '306 Nougat', zh: '306 牛轧糖' },
  '7u5NpQ0YuNmHSC1g1uv7': { en: '307 Candied Ginger', zh: '307 蜜饯姜糖' },
  icj6RyitqghMzKoLXA4r: { en: '308 Cheesecake', zh: '308 芝士蛋糕' },
  flSjbZEDtIQ4oT2QJduJ: { en: '309 Tiramisu', zh: '309 提拉米苏' },
  '64x3RzDA4AdcgaBg1bYm': { en: '310 Coffee Gourmand (coffee + mini desserts)', zh: '310 法式咖啡甜点拼盘' },
  ZxNyQzHTDDxyV9uhNmKy: { en: '311 Tea Gourmand (tea + mini desserts)', zh: '311 法式茶点拼盘' },
  yrW92P1ci8FySKmHTMdt: { en: 'Banana Coconut Tapioca', zh: '香蕉椰奶西米露' },

  // ---- ENTRÉES ----
  o28F0A0gm4bAwAbftbqZ: { en: '000 Banh Mi — Vietnamese Sandwich', zh: '000 越南法包三明治 (Banh Mi)' },
  PGD8HFMk6NzasbKyWf7m: { en: '101 Pork Spring Rolls (4 pcs)', zh: '101 越式炸春卷·猪肉 (4个)' },
  RnMlBlqpVAD2ikOgjcsL: { en: '102 Chicken Spring Rolls (4 pcs)', zh: '102 越式炸春卷·鸡肉 (4个)' },
  IUEirEea7PnTxzAxBfre: { en: '103 Shrimp Tempura (4 pcs)', zh: '103 天妇罗炸虾 (4个)' },
  rGEhV00JRZz8SfMr9fzq: { en: '104 Grilled Chicken Gyoza (4 pcs)', zh: '104 香煎鸡肉煎饺 (4个)' },
  zQqZc5wvYfGrb1dz71Q4: { en: '105 Steamed Shrimp Dumplings (4 pcs)', zh: '105 蒸虾饺 (4个)' },
  CYDnyrNKUmfmyyuaVSpj: { en: '106 Fried Shrimp Dumplings (3 pcs)', zh: '106 炸虾饺 (3个)' },
  M8EkgeblXhrvet5ksRAd: { en: '107 Banh Cuon (steamed rice rolls)', zh: '107 越南肠粉 (Banh Cuon)' },
  ThFDaXgju8coNsOdgO0o: { en: '108 Wakame Seaweed Salad', zh: '108 裙带菜沙拉' },
  tNEdnf1mAxWFd8dWmhdF: { en: '109 Mango Shrimp Salad', zh: '109 芒果鲜虾沙拉' },
  eGVL8lk7DMxX1V2tp95R: { en: '110 Chicken Cabbage Salad', zh: '110 鸡肉白菜丝沙拉' },
  '0QiDxB0pmMuf4pQlLPGr': { en: '111 Vegetable or Chicken Bun', zh: '111 蔬菜或鸡肉包' },
  '4JyFrmab1fQj9411ZRty': { en: '112 Pork Bun', zh: '112 猪肉包' },
  sjw8aTx9hlVpuCLktSpN: { en: '113 BBQ Pork Banh Mi', zh: '113 叉烧越南法包' },
  DftooC2xZEG8fD2R1Y5y: { en: '114 Chicken Banh Mi', zh: '114 鸡肉越南法包' },
  eehq2FuUpXdIOLBasx5t: { en: '180 Caviar 10g', zh: '180 鱼子酱 10g' },
  avPiGaSlNU9UPaLXOJhg: { en: '181 Caviar 30g', zh: '181 鱼子酱 30g' },
  sffHqmtPtqStRkmEOJl0: { en: 'Pork Bao Bun', zh: '猪肉包 (Bao)' },

  // ---- MENUS (plats spéciaux) ----
  ASFTObrUHiViplmzfc44: { en: '001 Vietnamese Beef Pho', zh: '001 越南牛肉河粉 Pho' },
  ZKnV45TDJwUvMEYHx47A: { en: '002 Zha Jiang Noodles', zh: '002 炸酱面' },
  SUDPLvFUpju3HFOqLpf7: { en: '003 BBQ Pork Rice', zh: '003 叉烧饭' },
  uLNUhoWUtwKSgjWe1QnB: { en: '003 Wonton Noodle Soup', zh: '003 中式云吞面汤' },
  PQjnngOviiTJ69UbZsZd: { en: '004 Shrimp Pad Thai', zh: '004 泰式炒河粉·虾' },
  HXX6evik8dLFxWF8I436: { en: '004 Thai Chicken Rice', zh: '004 泰汁鸡肉饭' },
  lmvcBBEqZqVCbZeeI18A: { en: '005 Vegetarian Pad Thai', zh: '005 素食泰式炒河粉' },
  '9g3vQCU50CoahvXUKeTm': { en: '005 Thai Beef Rice', zh: '005 泰汁牛肉饭' },
  n02pW8jjQIE28Qnl9En7: { en: '006 Chicken Pad Thai', zh: '006 泰式炒河粉·鸡肉' },
  '2YkhBuiPqnM9037UF1hR': { en: '006 Vegetables & Tofu Rice', zh: '006 蔬菜豆腐饭' },
  nlPCsJwy0HYvtqLxISC9: { en: '007 Thai Shrimp Rice', zh: '007 泰汁虾饭' },
  mvYinyHJRhE9QHwByzvj: { en: '008 Salmon Fillet Rice', zh: '008 三文鱼扒饭' },
  QVLQCkPhkoiAoB6N4EuW: { en: '009 Chicken Katsu Rice (fried breaded chicken)', zh: '009 日式炸鸡排饭 (Katsu)' },
  '091gUUtcVMKcys5FPb4K': { en: '010 Stir-fried Noodles / Udon, Chicken', zh: '010 鸡肉炒面 / 乌冬' },
  ji5AChTnFmfuCaAgvtMi: { en: '010 Fish Fillet Rice (Thai red curry)', zh: '010 红咖喱鱼柳饭' },
  pCg7Z40vfHfcXU0otXqC: { en: '011 Stir-fried Noodles / Udon, Beef', zh: '011 牛肉炒面 / 乌冬' },
  eQOcVMlQRuDtBlfpDn3i: { en: '012 Stir-fried Noodles / Udon, Shrimp', zh: '012 虾仁炒面 / 乌冬' },
  T6qNQKaaiaABunPiucB2: { en: '013 Stir-fried Noodles / Udon, Veg & Tofu', zh: '013 蔬菜豆腐炒面 / 乌冬' },
  Iu1hF9gykQTQbC0jc63h: { en: 'Hainanese Chicken Rice', zh: '海南鸡饭' },

  // ---- PLATS ----
  SSwezwRJAkgI6JLtbntG: { en: '201 Large Noodle Soup — BBQ Pork', zh: '201 叉烧汤面 (大碗)' },
  cpzbj5asRqstQ5MzkPfk: { en: '202 Large Noodle Soup — Shrimp Dumplings', zh: '202 虾饺汤面 (大碗)' },
  UBPNiT0E0uQ0w2sceSyf: { en: '203 Large Noodle Soup — Beef', zh: '203 牛肉汤面 (大碗)' },
  h08ZbdUceLXQR97R57i4: { en: '204 Large Noodle Soup — Chicken', zh: '204 鸡肉汤面 (大碗)' },
  ZbRTFiN2mmk6Wn7oLX1B: { en: '205 Large Noodle Soup — Veg & Tofu', zh: '205 蔬菜豆腐汤面 (大碗)' },
  uEWraXLnGAq28pJ0eaxc: { en: '206 Large Noodle Soup — Seafood', zh: '206 海鲜汤面 (大碗)' },
  '87982z44elFRJx2AUdff': { en: '207 Lemongrass Chicken Bo Bun + 2 Chicken Spring Rolls', zh: '207 香茅鸡肉拌米粉 + 2鸡肉春卷' },
  lOJV6QgsaydzBUqqHPoX: { en: '208 Lemongrass Beef Bo Bun + 2 Chicken Spring Rolls', zh: '208 香茅牛肉拌米粉 + 2鸡肉春卷' },
  za8HJLFJT0xuwXTAjMHN: { en: '209 Veg & Tofu Bo Bun + 2 Veggie Spring Rolls', zh: '209 蔬菜豆腐拌米粉 + 2素春卷' },
  XSwIaiSPBaBrnlPyqbs2: { en: '210 Shrimp Bo Bun + 2 Veggie Spring Rolls', zh: '210 鲜虾拌米粉 + 2素春卷' },
};

let updated = 0;
let skipped = 0;
let missing = 0;
for (const [id, t] of Object.entries(T)) {
  const p = await prisma.product.findUnique({ where: { id }, select: { nameEn: true, nameZh: true } });
  if (!p) {
    missing++;
    continue;
  }
  const data = {};
  if (!p.nameEn && t.en) data.nameEn = t.en;
  if (!p.nameZh && t.zh) data.nameZh = t.zh;
  if (Object.keys(data).length) {
    await prisma.product.update({ where: { id }, data });
    updated++;
  } else {
    skipped++;
  }
}

console.log(`✅ Traductions: ${updated} mis à jour, ${skipped} déjà remplis, ${missing} introuvables.`);
await prisma.$disconnect();
