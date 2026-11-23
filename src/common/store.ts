import fs from 'fs';
import path from 'path';
import {
  Address,
  Category,
  Coupon,
  Notification,
  Order,
  Product,
  Restaurant,
  SupportSettings,
  User,
} from './types';
import { hashPassword, makeId } from './crypto.util';

type ProfileOverride = Partial<User> & Pick<User, 'id'>;

const dataDir = process.env.VERCEL
  ? '/tmp'
  : path.join(__dirname, '..', '..', 'data');
const profileFile = path.join(dataDir, 'bitehub-profiles.json');
const supportFile = path.join(dataDir, 'bitehub-support.json');
const couponFile = path.join(dataDir, 'bitehub-coupons.json');

function loadProfileOverrides(): ProfileOverride[] {
  try {
    if (!fs.existsSync(profileFile)) return [];
    const parsed = JSON.parse(fs.readFileSync(profileFile, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProfileOverrides(users: User[]): void {
  const overrides: ProfileOverride[] = users.map((user) => ({ ...user }));
  const directory = path.dirname(profileFile);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(profileFile, JSON.stringify(overrides, null, 2), 'utf8');
}

function loadSupportSettings(): SupportSettings | null {
  try {
    if (!fs.existsSync(supportFile)) return null;
    return JSON.parse(fs.readFileSync(supportFile, 'utf8')) as SupportSettings;
  } catch {
    return null;
  }
}

function saveSupportSettings(settings: SupportSettings): void {
  const directory = path.dirname(supportFile);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(supportFile, JSON.stringify(settings, null, 2), 'utf8');
}

function loadCoupons(): Coupon[] {
  try {
    if (!fs.existsSync(couponFile)) return [];
    const parsed = JSON.parse(fs.readFileSync(couponFile, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCoupons(coupons: Coupon[]): void {
  const directory = path.dirname(couponFile);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(couponFile, JSON.stringify(coupons, null, 2), 'utf8');
}

const now = () => new Date().toISOString();
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const calmGradients = [
  'from-violet-300 to-purple-500',
  'from-fuchsia-300 to-purple-500',
  'from-slate-400 to-purple-500',
  'from-indigo-300 to-violet-500',
  'from-purple-400 to-fuchsia-600',
  'from-stone-300 to-slate-500',
  'from-indigo-300 to-purple-500',
  'from-rose-300 to-fuchsia-500',
];

const cheeseAddOn = { id: 'ao-cheese', name: 'Extra Cheese', price: 1.5 };
const baconAddOn = { id: 'ao-bacon', name: 'Crispy Bacon', price: 2 };
const avocadoAddOn = { id: 'ao-avocado', name: 'Avocado', price: 1.75 };
const pattyAddOn = { id: 'ao-patty', name: 'Extra Patty', price: 3.5 };
const friesAddOn = { id: 'ao-fries', name: 'Side of Fries', price: 3 };

const categorySeed: Category[] = [
  { id: 'cat-burgers', name: 'Burgers', slug: 'burgers', description: 'Juicy, stacked and made to order', emoji: 'burger', gradient: 'from-orange-400 to-red-500', active: true, sortOrder: 1 },
  { id: 'cat-pizza', name: 'Pizza', slug: 'pizza', description: 'Stone-baked, cheesy perfection', emoji: 'pizza', gradient: 'from-amber-400 to-orange-500', active: true, sortOrder: 2 },
  { id: 'cat-sushi', name: 'Sushi', slug: 'sushi', description: 'Fresh rolls and nigiri', emoji: 'sushi', gradient: 'from-rose-400 to-pink-600', active: true, sortOrder: 3 },
  { id: 'cat-salads', name: 'Salads', slug: 'salads', description: 'Crisp, fresh and nourishing', emoji: 'salad', gradient: 'from-purple-400 to-fuchsia-600', active: true, sortOrder: 4 },
  { id: 'cat-desserts', name: 'Desserts', slug: 'desserts', description: 'A sweet finish to any meal', emoji: 'cake', gradient: 'from-fuchsia-400 to-purple-600', active: true, sortOrder: 5 },
  { id: 'cat-drinks', name: 'Drinks', slug: 'drinks', description: 'Cool sips and warm favourites', emoji: 'drink', gradient: 'from-violet-400 to-purple-600', active: true, sortOrder: 6 },
  { id: 'cat-breakfast', name: 'Breakfast', slug: 'breakfast', description: 'Start your day deliciously', emoji: 'egg', gradient: 'from-amber-400 to-orange-600', active: true, sortOrder: 7 },
  { id: 'cat-sides', name: 'Sides', slug: 'sides', description: 'The perfect companions', emoji: 'fries', gradient: 'from-indigo-400 to-purple-600', active: true, sortOrder: 8 },
];

type ProductSeed = [string, string, string, number, string, string, boolean, number, string[], any[]];

const productSeed: ProductSeed[] = [
  ['prod-classic-smash', 'cat-burgers', 'Classic Smash Burger', 12.99, 'burger', 'from-orange-400 to-red-500', true, 15, ['Bestseller'], [cheeseAddOn, baconAddOn, pattyAddOn]],
  ['prod-double-cheese', 'cat-burgers', 'Double Cheese Burger', 15.49, 'burger', 'from-amber-500 to-red-600', false, 18, ['Cheesy'], [cheeseAddOn, baconAddOn, pattyAddOn]],
  ['prod-spicy-chicken', 'cat-burgers', 'Spicy Chicken Burger', 13.99, 'chicken', 'from-red-400 to-rose-600', false, 16, ['Spicy'], [cheeseAddOn, avocadoAddOn]],
  ['prod-mega-bbq', 'cat-burgers', 'Mega BBQ Burger', 16.99, 'burger', 'from-orange-500 to-amber-700', false, 20, ['Large'], [cheeseAddOn, baconAddOn, pattyAddOn, friesAddOn]],
  ['prod-veggie-delight', 'cat-burgers', 'Veggie Delight Burger', 12.49, 'leaf', 'from-purple-400 to-fuchsia-600', false, 14, ['Vegetarian'], [cheeseAddOn, avocadoAddOn]],

  ['prod-margherita', 'cat-pizza', 'Margherita Pizza', 14.99, 'pizza', 'from-yellow-400 to-orange-500', true, 20, ['Bestseller', 'Vegetarian'], [cheeseAddOn, avocadoAddOn]],
  ['prod-pepperoni', 'cat-pizza', 'Pepperoni Feast', 17.99, 'pizza', 'from-red-400 to-orange-600', false, 22, ['Popular'], [cheeseAddOn]],
  ['prod-bbq-chicken', 'cat-pizza', 'BBQ Chicken Pizza', 18.49, 'pizza', 'from-amber-400 to-red-500', false, 24, [], [cheeseAddOn, baconAddOn]],
  ['prod-veggie-supreme', 'cat-pizza', 'Veggie Supreme', 16.99, 'pizza', 'from-violet-400 to-purple-600', false, 21, ['Vegetarian'], [cheeseAddOn, avocadoAddOn]],
  ['prod-four-cheese', 'cat-pizza', 'Four Cheese Pizza', 17.49, 'pizza', 'from-yellow-300 to-amber-500', false, 22, ['Cheesy', 'Vegetarian'], [cheeseAddOn]],

  ['prod-salmon-nigiri', 'cat-sushi', 'Salmon Nigiri', 15.99, 'fish', 'from-orange-300 to-rose-500', true, 12, ['Fresh'], [avocadoAddOn]],
  ['prod-california-roll', 'cat-sushi', 'California Roll', 13.49, 'sushi', 'from-rose-300 to-pink-500', false, 12, ['Bestseller'], [avocadoAddOn]],
  ['prod-dragon-roll', 'cat-sushi', 'Dragon Roll', 18.99, 'dragon', 'from-indigo-400 to-purple-600', false, 16, ['Chef special'], [avocadoAddOn]],
  ['prod-spicy-tuna', 'cat-sushi', 'Spicy Tuna Roll', 16.49, 'fish', 'from-red-400 to-rose-600', false, 14, ['Spicy'], [avocadoAddOn]],

  ['prod-caesar', 'cat-salads', 'Classic Caesar Salad', 11.99, 'salad', 'from-indigo-300 to-purple-500', false, 10, ['Fresh'], [avocadoAddOn]],
  ['prod-greek', 'cat-salads', 'Greek Salad', 12.49, 'salad', 'from-fuchsia-400 to-purple-600', true, 10, ['Vegetarian'], [avocadoAddOn]],
  ['prod-chicken-avocado', 'cat-salads', 'Chicken Avocado Salad', 14.99, 'salad', 'from-purple-400 to-fuchsia-600', false, 12, ['Protein'], [avocadoAddOn]],
  ['prod-quinoa-bowl', 'cat-salads', 'Quinoa Power Bowl', 13.99, 'wrap', 'from-amber-300 to-purple-500', false, 12, ['Vegan'], [avocadoAddOn]],

  ['prod-choco-lava', 'cat-desserts', 'Chocolate Lava Cake', 8.99, 'cake', 'from-amber-700 to-stone-700', true, 10, ['Bestseller'], []],
  ['prod-cheesecake', 'cat-desserts', 'New York Cheesecake', 7.99, 'cake', 'from-yellow-200 to-amber-400', false, 8, ['Classic'], []],
  ['prod-tiramisu', 'cat-desserts', 'Tiramisu', 8.49, 'pudding', 'from-amber-400 to-stone-600', false, 8, ['Italian'], []],
  ['prod-ice-cream', 'cat-desserts', 'Ice Cream Trio', 6.99, 'iceCream', 'from-pink-300 to-fuchsia-500', false, 5, ['Kids favourite'], []],

  ['prod-iced-latte', 'cat-drinks', 'Iced Latte', 5.49, 'coffee', 'from-amber-400 to-stone-600', true, 5, ['Caffeine'], []],
  ['prod-orange-juice', 'cat-drinks', 'Fresh Orange Juice', 4.99, 'orange', 'from-orange-300 to-amber-500', false, 5, ['Fresh'], []],
  ['prod-berry-smoothie', 'cat-drinks', 'Berry Smoothie', 6.49, 'berry', 'from-fuchsia-400 to-purple-600', false, 6, ['Healthy'], []],
  ['prod-sparkling-water', 'cat-drinks', 'Sparkling Water', 2.99, 'water', 'from-violet-300 to-purple-400', false, 2, [], []],

  ['prod-all-day', 'cat-breakfast', 'All-Day Breakfast Platter', 13.99, 'egg', 'from-amber-400 to-orange-600', true, 18, ['Bestseller'], [avocadoAddOn]],
  ['prod-pancakes', 'cat-breakfast', 'Fluffy Pancake Stack', 10.99, 'pancakes', 'from-yellow-300 to-orange-400', false, 14, ['Sweet'], []],
  ['prod-avocado-toast', 'cat-breakfast', 'Avocado Toast', 11.49, 'avocado', 'from-violet-400 to-purple-600', false, 10, ['Vegan'], []],
  ['prod-breakfast-burrito', 'cat-breakfast', 'Breakfast Burrito', 12.49, 'burrito', 'from-orange-400 to-amber-600', false, 15, ['Fillings'], [cheeseAddOn]],

  ['prod-truffle-fries', 'cat-sides', 'Truffle Parmesan Fries', 6.99, 'fries', 'from-yellow-400 to-amber-600', true, 8, ['Bestseller'], []],
  ['prod-onion-rings', 'cat-sides', 'Golden Onion Rings', 5.99, 'onion', 'from-amber-300 to-orange-500', false, 8, [], []],
  ['prod-chicken-wings', 'cat-sides', 'Buffalo Chicken Wings', 9.99, 'chicken', 'from-red-400 to-orange-600', false, 12, ['Spicy'], []],
  ['prod-mozzarella', 'cat-sides', 'Mozzarella Sticks', 7.49, 'cheese', 'from-yellow-300 to-amber-500', false, 10, ['Cheesy'], []],
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const productSeedMap: Product[] = productSeed.map(
  ([id, categoryId, name, price, emoji, gradient, popular, prepTime, tags, addOns], index) => {
    const nairaPrice = Math.round(price * 1000);
    return {
      id,
      categoryId,
      name,
      slug: slugify(name),
      description: `${name} prepared fresh to order with our signature recipe and the finest ingredients.`,
      price: nairaPrice,
      compareAtPrice: popular ? Math.round(nairaPrice * 1.15) : undefined,
      emoji,
      gradient: calmGradients[index % calmGradients.length],
      available: true,
      popular,
      rating: Math.round((4.2 + Math.random() * 0.8) * 10) / 10,
      reviewCount: 20 + Math.floor(Math.random() * 180),
      prepTime,
      tags,
      addOns: addOns.map((addOn) => ({ ...addOn, price: Math.round(addOn.price * 1000) })),
      createdAt: daysAgo(60),
    };
  },
);

const restaurantSeed: Restaurant = {
  name: 'BiteHub Kitchen',
  tagline: 'Your Cravings, Delivered.',
  description: 'Fresh, flavourful food made to order and delivered straight to your door.',
  phone: '+1 (555) 010-2030',
  email: 'hello@bitehub.test',
  address: '124 Craven Street, Food District, FH 10001',
  openingHours: 'Open daily · 9:00 AM – 11:00 PM',
  deliveryFee: 1500,
  freeDeliveryOver: 30000,
  currency: 'NGN',
};

const supportSettingsSeed: SupportSettings = {
  email: 'care@bitehub.test',
  phone: '+1 (555) 010-2030',
  whatsapp: '+15550102030',
  hours: 'Daily · 9:00 AM – 11:00 PM',
  address: '124 Craven Street, Food District, FH 10001',
  responseTime: 'We usually reply within 15 minutes.',
  faqs: [
    {
      question: 'How long does delivery take?',
      answer: 'Most orders arrive within 30–45 minutes. You can follow progress from My Orders.',
    },
    {
      question: 'Can I change or cancel my order?',
      answer: 'Contact us as soon as possible. Once your order is being prepared, changes may not be possible.',
    },
    {
      question: 'How do I use a coupon code?',
      answer: 'Enter your code on the checkout page. Eligible discounts are applied before you pay.',
    },
    {
      question: 'What if I have a food allergy?',
      answer: 'Tell us in the order notes and contact our care team before placing your order.',
    },
  ],
};

export class MemoryStore {
  users: User[] = [
    {
      id: 'user-admin',
      email: process.env.SEED_ADMIN_EMAIL || 'oluebubechidavid@gmail.com',
      username: process.env.SEED_ADMIN_USERNAME || 'david_oluebubechi',
      passwordHash: hashPassword(process.env.SEED_ADMIN_PASSWORD || 'Midaltouch@2007'),
      name: 'David Oluebubechi',
      phone: '07046059865',
      avatar: 'DO',
      role: 'ADMIN',
      active: true,
      createdAt: daysAgo(120),
    },
    {
      id: 'user-customer',
      email: process.env.SEED_CUSTOMER_EMAIL || 'customer@bitehub.test',
      username: process.env.SEED_CUSTOMER_USERNAME || 'customer',
      passwordHash: hashPassword(process.env.SEED_CUSTOMER_PASSWORD || 'Customer123!'),
      name: 'Jamie Customer',
      phone: '+1 (555) 010-0002',
      avatar: 'JC',
      role: 'CUSTOMER',
      active: true,
      createdAt: daysAgo(60),
    },
  ];

  addresses: Address[] = [];

  categories: Category[] = categorySeed.map((c, i) => ({ ...c, gradient: calmGradients[i % calmGradients.length] }));
  products: Product[] = productSeedMap.map((p) => ({ ...p, addOns: [...p.addOns], tags: [...p.tags] }));

  coupons: Coupon[] = [
    { id: 'cpn-welcome', code: 'WELCOME10', type: 'PERCENT', value: 10, minOrder: 0, active: true, expiresAt: null, usageCount: 0, createdAt: daysAgo(90) },
    { id: 'cpn-save5', code: 'SAVE5', type: 'FIXED', value: 2000, minOrder: 15000, active: true, expiresAt: null, usageCount: 0, createdAt: daysAgo(60) },
    { id: 'cpn-freeship', code: 'FREESHIP', type: 'FREE_SHIPPING', value: 0, minOrder: 10000, active: true, expiresAt: null, usageCount: 0, createdAt: daysAgo(45) },
    { id: 'cpn-bite20', code: 'BITE20', type: 'PERCENT', value: 20, minOrder: 30000, active: true, expiresAt: null, usageCount: 0, createdAt: daysAgo(20) },
    { id: 'cpn-summer', code: 'SUMMER15', type: 'PERCENT', value: 15, minOrder: 20000, active: false, expiresAt: daysAgo(5), usageCount: 0, createdAt: daysAgo(150) },
  ];

  orders: Order[] = [];

  notifications: Notification[] = [];

  restaurant: Restaurant = restaurantSeed;

  supportSettings: SupportSettings = supportSettingsSeed;

  nextOrderNumber = 1000;

  makeId = makeId;
  now = now;

  constructor() {
    for (const saved of loadProfileOverrides()) {
      const user = this.users.find((candidate) => candidate.id === saved.id);
      if (user) {
        for (const [key, value] of Object.entries(saved)) {
          if (value !== undefined && key !== 'id') (user as unknown as Record<string, unknown>)[key] = value;
        }
      } else if (saved.email && saved.username && saved.passwordHash && saved.role && saved.active !== undefined && saved.createdAt) {
        this.users.push(saved as User);
      }
    }
    const savedSupport = loadSupportSettings();
    if (savedSupport) {
      this.supportSettings = {
        ...this.supportSettings,
        ...savedSupport,
        faqs: Array.isArray(savedSupport.faqs) ? savedSupport.faqs : this.supportSettings.faqs,
      };
    }
    for (const saved of loadCoupons()) {
      const coupon = this.coupons.find((candidate) => candidate.id === saved.id);
      if (coupon) Object.assign(coupon, saved);
      else this.coupons.push(saved);
    }
  }

  persistProfiles = () => saveProfileOverrides(this.users);
  persistSupport = () => saveSupportSettings(this.supportSettings);
  persistCoupons = () => saveCoupons(this.coupons);
}
