/**
 * Rich public-page demo: many vendors, menu items with dish photos, RSVPs.
 * Targets community-picnic-free (run after seed:matrix or seed:demo).
 *
 * Usage: npm run seed:showcase
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const EVENT_SLUG = 'community-picnic-free';
const VENDOR_EMAIL_DOMAIN = '@picnic-showcase.popmarket.dev';
const GRID_ROWS = 5;
const GRID_COLS = 5;

function svgDataUrl(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function dishPlaceholder(hue, accentHue = hue + 18) {
  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" fill="hsl(${hue} 42% 94%)"/>
  <ellipse cx="48" cy="52" rx="30" ry="22" fill="hsl(${hue} 48% 88%)"/>
  <circle cx="48" cy="38" r="16" fill="hsl(${accentHue} 55% 58%)"/>
  <ellipse cx="40" cy="34" rx="4" ry="3" fill="hsl(${accentHue} 40% 72%)" opacity="0.7"/>
  <ellipse cx="56" cy="36" rx="3" ry="2.5" fill="hsl(${accentHue} 40% 72%)" opacity="0.7"/>
</svg>`);
}

const FOOD_IMAGES = [
  dishPlaceholder(24),
  dishPlaceholder(32),
  dishPlaceholder(8),
  dishPlaceholder(145),
  dishPlaceholder(350),
  dishPlaceholder(95),
  dishPlaceholder(12),
  dishPlaceholder(200),
  dishPlaceholder(280),
  dishPlaceholder(40),
  dishPlaceholder(170),
  dishPlaceholder(310),
  dishPlaceholder(55),
  dishPlaceholder(120),
  dishPlaceholder(5),
];

const COVER_IMAGE = svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef3e8"/>
      <stop offset="45%" stop-color="#fde8d4"/>
      <stop offset="100%" stop-color="#e8f5ee"/>
    </linearGradient>
    <linearGradient id="sun" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="400" fill="url(#bg)"/>
  <circle cx="980" cy="90" r="120" fill="url(#sun)"/>
  <ellipse cx="200" cy="320" rx="180" ry="50" fill="#2d6a4f" opacity="0.12"/>
  <ellipse cx="600" cy="330" rx="220" ry="55" fill="#e85d04" opacity="0.1"/>
  <ellipse cx="950" cy="325" rx="160" ry="45" fill="#2d6a4f" opacity="0.1"/>
  <rect x="140" y="210" width="140" height="72" rx="14" fill="#e85d04" opacity="0.85"/>
  <rect x="155" y="225" width="110" height="42" rx="8" fill="#fff7ed" opacity="0.9"/>
  <circle cx="210" cy="246" r="12" fill="#2d6a4f" opacity="0.75"/>
  <rect x="420" y="195" width="160" height="88" rx="16" fill="#2d6a4f" opacity="0.88"/>
  <rect x="438" y="212" width="124" height="54" rx="8" fill="#ecfdf5" opacity="0.92"/>
  <circle cx="500" cy="239" r="14" fill="#e85d04" opacity="0.8"/>
  <rect x="720" y="205" width="150" height="78" rx="14" fill="#d4510a" opacity="0.9"/>
  <rect x="738" y="222" width="114" height="44" rx="8" fill="#fff7ed" opacity="0.9"/>
  <circle cx="795" cy="244" r="11" fill="#2d6a4f" opacity="0.75"/>
  <text x="600" y="120" text-anchor="middle" font-family="system-ui,sans-serif" font-size="42" font-weight="700" fill="#1c1917" opacity="0.88">Community Food Market</text>
  <text x="600" y="162" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="#57534e">Food trucks · Stalls · Live menus</text>
</svg>`);

function buildMenu(entries) {
  return entries.map(([name, price], i) => ({
    name,
    price,
    imageUrl: FOOD_IMAGES[i % FOOD_IMAGES.length],
  }));
}

const SHOWCASE_VENDORS = [
  {
    token: 'picnicvendorindian01',
    business_name: 'Mumbai Masala Truck',
    truck_name: 'MM Express',
    owner_name: 'Priya Sharma',
    email: `masala${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Indian',
    vendor_type: 'food_truck',
    stallCode: 'A1',
    payment: 'paid',
    menu_description: 'North Indian street food, chaat, and hearty bowls.',
    menu_items: buildMenu([
      ['Butter Chicken Bowl', 180],
      ['Paneer Tikka Wrap', 150],
      ['Masala Dosa', 120],
      ['Chole Bhature', 130],
      ['Dal Makhani Rice', 160],
      ['Pani Puri (6 pcs)', 60],
      ['Aloo Tikki Chaat', 80],
      ['Chicken Biryani', 220],
      ['Garlic Naan', 50],
      ['Mango Lassi', 70],
      ['Gulab Jamun (2 pcs)', 55],
      ['Masala Chai', 30],
    ]),
  },
  {
    token: 'picnicvendorbbq0001',
    business_name: 'Smoke & Soul BBQ',
    truck_name: 'Smokehouse 42',
    owner_name: 'Jay Patel',
    email: `bbq${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'American BBQ',
    vendor_type: 'food_truck',
    stallCode: 'A2',
    payment: 'paid',
    menu_description: 'Slow-smoked meats, classic sides, and house sauces.',
    menu_items: buildMenu([
      ['Pulled Pork Sandwich', 220],
      ['BBQ Ribs (half rack)', 350],
      ['Brisket Plate', 380],
      ['Mac & Cheese', 90],
      ['Coleslaw', 60],
      ['Cornbread', 75],
      ['Smoked Chicken Wings (6)', 200],
      ['Loaded Fries', 140],
      ['BBQ Jackfruit Bowl', 170],
      ['Peach Iced Tea', 65],
      ['Brownie Bite', 80],
      ['Pickle Jar', 40],
    ]),
  },
  {
    token: 'picnicvendortaco0001',
    business_name: 'Tacos El Camino',
    truck_name: 'El Camino',
    owner_name: 'Carlos Mendez',
    email: `tacos${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Mexican',
    vendor_type: 'food_stall',
    stallCode: 'A3',
    payment: 'paid',
    menu_description: 'Authentic tacos, quesadillas, and aguas frescas.',
    menu_items: buildMenu([
      ['Al Pastor Tacos (3)', 160],
      ['Carnitas Quesadilla', 140],
      ['Veggie Burrito Bowl', 155],
      ['Guacamole & Chips', 110],
      ['Elote Cup', 90],
      ['Churros (4 pcs)', 85],
      ['Horchata', 60],
      ['Jamaica Agua Fresca', 55],
      ['Fish Taco Plate', 175],
      ['Nachos Supreme', 195],
      ['Mexican Rice', 70],
      ['Refried Beans', 65],
    ]),
  },
  {
    token: 'picnicvendorkorean01',
    business_name: 'Seoul Kitchen',
    truck_name: 'K-Street',
    owner_name: 'Min-jun Kim',
    email: `korean${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Korean',
    vendor_type: 'food_stall',
    stallCode: 'A4',
    payment: 'paid',
    menu_description: 'Korean fried chicken, bibimbap, and street snacks.',
    menu_items: buildMenu([
      ['Bibimbap', 200],
      ['KFC Wings (6pc)', 180],
      ['Kimchi Fried Rice', 165],
      ['Tteokbokki', 120],
      ['Korean Corn Dog', 95],
      ['Bulgogi Bowl', 210],
      ['Japchae', 150],
      ['Mandu (6 dumplings)', 130],
      ['Soju Mocktail', 90],
      ['Bingsu Cup', 110],
      ['Pickled Radish Side', 35],
      ['Gochujang Fries', 125],
    ]),
  },
  {
    token: 'picnicvendorthai0001',
    business_name: 'Spice Route',
    truck_name: 'Bangkok Bites',
    owner_name: 'Anita Desai',
    email: `thai${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Thai',
    vendor_type: 'food_stall',
    stallCode: 'A5',
    payment: 'pending',
    menu_description: 'Pad thai, curries, and fresh Thai salads.',
    menu_items: buildMenu([
      ['Pad Thai', 170],
      ['Green Curry Rice', 190],
      ['Tom Yum Soup', 140],
      ['Mango Sticky Rice', 120],
      ['Thai Basil Chicken', 185],
      ['Papaya Salad', 130],
      ['Spring Rolls (4)', 95],
      ['Massaman Curry', 200],
      ['Coconut Water', 50],
      ['Thai Iced Tea', 65],
      ['Satay Skewers (4)', 155],
      ['Jasmine Rice', 45],
    ]),
  },
  {
    token: 'picnicvendorjapan01',
    business_name: 'Tokyo Roll Co.',
    truck_name: 'Sushi Sprint',
    owner_name: 'Yuki Tanaka',
    email: `japanese${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Japanese',
    vendor_type: 'food_stall',
    stallCode: 'B1',
    payment: 'paid',
    menu_description: 'Sushi rolls, ramen cups, and karaage.',
    menu_items: buildMenu([
      ['California Roll (8pc)', 180],
      ['Spicy Tuna Roll', 210],
      ['Chicken Karaage', 160],
      ['Miso Ramen Cup', 175],
      ['Edamame', 70],
      ['Gyoza (6 pcs)', 130],
      ['Salmon Nigiri (4pc)', 195],
      ['Veg Tempura', 145],
      ['Matcha Mochi', 85],
      ['Yuzu Soda', 75],
      ['Tonkotsu Ramen', 220],
      ['Seaweed Salad', 90],
    ]),
  },
  {
    token: 'picnicvendoritaly01',
    business_name: 'Nonna\'s Pasta Cart',
    truck_name: 'Pasta Pronto',
    owner_name: 'Marco Rossi',
    email: `italian${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Italian',
    vendor_type: 'food_stall',
    stallCode: 'B2',
    payment: 'paid',
    menu_description: 'Fresh pasta, wood-fired slices, and gelato.',
    menu_items: buildMenu([
      ['Margherita Slice', 120],
      ['Truffle Mushroom Pasta', 240],
      ['Pesto Penne', 190],
      ['Caprese Panini', 155],
      ['Meatball Sub', 210],
      ['Garlic Bread', 65],
      ['Tiramisu Cup', 110],
      ['Affogato', 95],
      ['Arancini (3)', 130],
      ['Limoncello Spritz (NA)', 80],
      ['Lasagna Bowl', 225],
      ['Bruschetta Plate', 100],
    ]),
  },
  {
    token: 'picnicvendorchina01',
    business_name: 'Dragon Wok Express',
    truck_name: 'Wok Star',
    owner_name: 'Li Wei',
    email: `chinese${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Chinese',
    vendor_type: 'food_truck',
    stallCode: 'B3',
    payment: 'paid',
    menu_description: 'Wok-fried noodles, dumplings, and Szechuan bowls.',
    menu_items: buildMenu([
      ['Veg Hakka Noodles', 150],
      ['Chicken Dumplings (6)', 140],
      ['Kung Pao Bowl', 185],
      ['Mapo Tofu Rice', 170],
      ['Spring Onion Pancake', 90],
      ['Hot & Sour Soup', 85],
      ['Chilli Garlic Fried Rice', 160],
      ['Honey Chilli Potato', 120],
      ['Bubble Tea', 95],
      ['Fortune Cookie (3)', 30],
      ['Szechuan Chicken', 195],
      ['Steamed Bao (2)', 110],
    ]),
  },
  {
    token: 'picnicvendormed0001',
    business_name: 'Olive & Za\'atar',
    truck_name: 'Med Mezze',
    owner_name: 'Fatima Hassan',
    email: `mediterranean${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Mediterranean',
    vendor_type: 'food_stall',
    stallCode: 'B4',
    payment: 'paid',
    menu_description: 'Falafel, shawarma, hummus, and fresh mezze.',
    menu_items: buildMenu([
      ['Chicken Shawarma Wrap', 175],
      ['Falafel Plate', 150],
      ['Hummus & Pita', 120],
      ['Greek Salad', 140],
      ['Lamb Kofta Bowl', 210],
      ['Baba Ganoush', 110],
      ['Stuffed Grape Leaves', 95],
      ['Baklava (2 pcs)', 85],
      ['Mint Lemonade', 60],
      ['Tabbouleh', 100],
      ['Halloumi Wrap', 165],
      ['Turkish Coffee', 55],
    ]),
  },
  {
    token: 'picnicvendorburger01',
    business_name: 'Burger Barn',
    truck_name: 'Smash Patrol',
    owner_name: 'Tom Wilson',
    email: `burger${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'American',
    vendor_type: 'food_truck',
    stallCode: 'B5',
    payment: 'paid',
    menu_description: 'Smash burgers, loaded fries, and milkshakes.',
    menu_items: buildMenu([
      ['Classic Smash Burger', 150],
      ['Double Bacon Burger', 220],
      ['Veggie Black Bean Burger', 160],
      ['Truffle Fries', 130],
      ['Onion Rings', 95],
      ['Chicken Tenders (5)', 175],
      ['Mac & Cheese Bites', 110],
      ['Chocolate Shake', 120],
      ['Strawberry Shake', 120],
      ['Coleslaw Cup', 55],
      ['BBQ Burger', 195],
      ['Kids Meal', 140],
    ]),
  },
  {
    token: 'picnicvendorvegan01',
    business_name: 'Green Bowl Collective',
    truck_name: 'Plant Power',
    owner_name: 'Sara Mehta',
    email: `vegan${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Plant-Based',
    vendor_type: 'food_stall',
    stallCode: 'C1',
    payment: 'paid',
    menu_description: 'Vegan bowls, wraps, and cold-pressed juices.',
    menu_items: buildMenu([
      ['Buddha Bowl', 180],
      ['Avocado Toast', 140],
      ['Tempeh Wrap', 165],
      ['Quinoa Salad', 155],
      ['Vegan Buddha Burger', 175],
      ['Sweet Potato Fries', 110],
      ['Acai Bowl', 190],
      ['Green Smoothie', 120],
      ['Coconut Yogurt Parfait', 130],
      ['Kale Chips', 75],
      ['Chickpea Curry Bowl', 170],
      ['Cold Brew', 85],
    ]),
  },
  {
    token: 'picnicvendordessert1',
    business_name: 'Sweet Street Cart',
    truck_name: 'Sugar Rush',
    owner_name: 'Emily Chen',
    email: `dessert${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Desserts',
    vendor_type: 'food_stall',
    stallCode: 'C2',
    payment: 'paid',
    menu_description: 'Artisan desserts, waffles, and specialty coffees.',
    menu_items: buildMenu([
      ['Belgian Waffle', 150],
      ['Nutella Crepe', 130],
      ['Red Velvet Cupcake', 90],
      ['Cheesecake Slice', 140],
      ['Affogato', 110],
      ['Chocolate Brownie', 85],
      ['Kulfi Stick', 60],
      ['Fruit Tart', 125],
      ['Caramel Latte', 95],
      ['Iced Mocha', 100],
      ['Cookie Box (3)', 75],
      ['Soft Serve Cone', 65],
    ]),
  },
  {
    token: 'picnicvendorcoffee1',
    business_name: 'Brew & Bite',
    truck_name: 'Morning Grind',
    owner_name: 'Arjun Nair',
    email: `coffee${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Cafe',
    vendor_type: 'food_stall',
    stallCode: 'C3',
    payment: 'paid',
    menu_description: 'Specialty coffee, sandwiches, and bakery.',
    menu_items: buildMenu([
      ['Flat White', 90],
      ['Cold Brew', 100],
      ['Cappuccino', 85],
      ['Avocado Toast', 145],
      ['Egg & Cheese Croissant', 130],
      ['Banana Bread Slice', 75],
      ['Granola Bowl', 120],
      ['Iced Latte', 95],
      ['Masala Chai Latte', 80],
      ['Blueberry Muffin', 70],
      ['Ham & Cheese Panini', 155],
      ['Oat Milk Add-on', 20],
    ]),
  },
  {
    token: 'picnicvendorstreet1',
    business_name: 'Mumbai Street Bites',
    truck_name: 'Chaat Corner',
    owner_name: 'Ravi Nair',
    email: `street${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Street Food',
    vendor_type: 'food_truck',
    stallCode: 'C4',
    payment: 'paid',
    menu_description: 'Iconic Mumbai street snacks and chaat platters.',
    menu_items: buildMenu([
      ['Pani Puri (6)', 60],
      ['Bhel Puri', 70],
      ['Sev Puri', 75],
      ['Dahi Puri', 80],
      ['Vada Pav', 45],
      ['Misal Pav', 95],
      ['Pav Bhaji', 110],
      ['Bombay Sandwich', 85],
      ['Frankie Roll', 90],
      ['Cutting Chai', 25],
      ['Kulfi Falooda', 100],
      ['Samosa Chaat', 65],
    ]),
  },
  {
    token: 'picnicvendorpizza01',
    business_name: 'Fire Oven Pizza',
    truck_name: 'Slice Society',
    owner_name: 'Dan Cooper',
    email: `pizza${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Italian',
    vendor_type: 'food_truck',
    stallCode: 'C5',
    payment: 'paid',
    menu_description: 'Wood-fired personal pizzas and garlic knots.',
    menu_items: buildMenu([
      ['Margherita Personal', 180],
      ['Pepperoni Personal', 210],
      ['BBQ Chicken Pizza', 225],
      ['Four Cheese Pizza', 200],
      ['Veggie Supreme', 195],
      ['Garlic Knots (6)', 90],
      ['Caesar Side Salad', 110],
      ['Tiramisu Cup', 95],
      ['Sparkling Water', 40],
      ['Chilli Oil Dip', 25],
      ['Buffalo Wings (6)', 170],
      ['Nutella Pizza Bite', 120],
    ]),
  },
  {
    token: 'picnicvendorseafood1',
    business_name: 'Coastal Catch',
    truck_name: 'Bay Grill',
    owner_name: 'Nina D\'Souza',
    email: `seafood${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Seafood',
    vendor_type: 'food_truck',
    stallCode: 'D1',
    payment: 'paid',
    menu_description: 'Grilled fish, prawn tacos, and coastal small plates.',
    menu_items: buildMenu([
      ['Grilled Fish Plate', 240],
      ['Prawn Tacos (3)', 195],
      ['Fish & Chips', 210],
      ['Calamari Rings', 165],
      ['Crab Cake Slider', 180],
      ['Lemon Butter Rice', 120],
      ['Coleslaw Cup', 55],
      ['Mango Salsa Bowl', 90],
      ['Coconut Prawn Curry', 225],
      ['Iced Lemonade', 60],
      ['Grilled Octopus Skewer', 260],
      ['Sea Salt Fries', 95],
    ]),
  },
  {
    token: 'picnicvendorlebanon1',
    business_name: 'Beirut Bites',
    truck_name: 'Manousheh Co.',
    owner_name: 'Layla Khoury',
    email: `lebanese${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Lebanese',
    vendor_type: 'food_stall',
    stallCode: 'D2',
    payment: 'paid',
    menu_description: 'Manousheh, shawarma, and Lebanese pastries.',
    menu_items: buildMenu([
      ['Chicken Shawarma Plate', 185],
      ['Za\'atar Manousheh', 110],
      ['Falafel Wrap', 140],
      ['Hummus Trio', 125],
      ['Fattoush Salad', 130],
      ['Kibbeh (4 pcs)', 150],
      ['Baklava Box', 90],
      ['Labneh & Olives', 95],
      ['Lamb Kafta Skewer', 200],
      ['Rose Lemonade', 70],
      ['Spinach Fatayer', 85],
      ['Garlic Sauce Side', 30],
    ]),
  },
  {
    token: 'picnicvendorindo0001',
    business_name: 'Nasi Goreng Wagon',
    truck_name: 'Island Spice',
    owner_name: 'Budi Santoso',
    email: `indonesian${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Indonesian',
    vendor_type: 'food_stall',
    stallCode: 'D3',
    payment: 'paid',
    menu_description: 'Nasi goreng, satay, and sambal-forward street food.',
    menu_items: buildMenu([
      ['Nasi Goreng', 160],
      ['Chicken Satay (5)', 145],
      ['Gado-Gado', 150],
      ['Rendang Rice Bowl', 210],
      ['Mie Goreng', 155],
      ['Tempeh Skewers', 120],
      ['Pisang Goreng', 75],
      ['Es Cendol', 80],
      ['Sambal Fried Rice', 165],
      ['Krupuk Crackers', 35],
      ['Beef Bakso Soup', 175],
      ['Coconut Rice', 60],
    ]),
  },
  {
    token: 'picnicvendorethio001',
    business_name: 'Addis Kitchen',
    truck_name: 'Injera House',
    owner_name: 'Hanna Bekele',
    email: `ethiopian${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Ethiopian',
    vendor_type: 'food_stall',
    stallCode: 'D4',
    payment: 'paid',
    menu_description: 'Injera platters, wots, and vegan combos.',
    menu_items: buildMenu([
      ['Doro Wat Plate', 220],
      ['Veg Combo (4 wots)', 195],
      ['Misir Wat', 150],
      ['Tibs Beef', 210],
      ['Shiro Wat', 140],
      ['Injera Side (2)', 50],
      ['Sambusa (3)', 90],
      ['Ethiopian Coffee', 65],
      ['Gomen Collard Greens', 120],
      ['Kitfo Bowl', 230],
      ['Honey Wine (NA)', 85],
      ['Chickpea Stew', 135],
    ]),
  },
  {
    token: 'picnicvendorfilipino1',
    business_name: 'Lumpia & Grill',
    truck_name: 'Manila Nights',
    owner_name: 'Maria Santos',
    email: `filipino${VENDOR_EMAIL_DOMAIN}`,
    cuisine_type: 'Filipino',
    vendor_type: 'food_stall',
    stallCode: 'D5',
    payment: 'paid',
    menu_description: 'Lumpia, adobo bowls, and grilled skewers.',
    menu_items: buildMenu([
      ['Chicken Adobo Bowl', 175],
      ['Pork Sisig', 190],
      ['Lumpia Shanghai (8)', 120],
      ['Halo-Halo', 110],
      ['Garlic Fried Rice', 95],
      ['Lechon Kawali Plate', 220],
      ['Pancit Canton', 145],
      ['Turon (2)', 70],
      ['Grilled Pork Skewer', 160],
      ['Calamansi Juice', 55],
      ['Sinigang Cup', 155],
      ['Ube Ice Cream', 85],
    ]),
  },
];

async function ensureStallGrid(supabase, eventId) {
  await supabase
    .from('events')
    .update({ stall_rows: GRID_ROWS, stall_cols: GRID_COLS })
    .eq('id', eventId);

  const { data: existing } = await supabase
    .from('stalls')
    .select('stall_code')
    .eq('event_id', eventId);

  const existingCodes = new Set((existing ?? []).map((s) => s.stall_code));
  const letters = 'ABCDE';
  const toInsert = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const code = `${letters[r]}${c + 1}`;
      if (!existingCodes.has(code)) {
        toInsert.push({
          event_id: eventId,
          stall_code: code,
          row_index: r,
          col_index: c,
          zone: 'food_truck',
          has_power: true,
          is_available: true,
        });
      }
    }
  }

  if (toInsert.length) {
    const { error } = await supabase.from('stalls').insert(toInsert);
    if (error) throw new Error(`Stalls: ${error.message}`);
    console.log(`  + ${toInsert.length} stall bays (${GRID_ROWS}×${GRID_COLS} grid)`);
  } else {
    console.log(`  Stall grid: ${GRID_ROWS}×${GRID_COLS} (${GRID_ROWS * GRID_COLS} bays)`);
  }
}

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

async function seedPublicShowcase() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, stall_fee, visitor_capacity')
    .eq('slug', EVENT_SLUG)
    .maybeSingle();

  if (eventError || !event) {
    console.error(`Event "${EVENT_SLUG}" not found. Run: npm run seed:matrix`);
    process.exit(1);
  }

  console.log(`\nSeeding public showcase on: ${EVENT_SLUG}\n`);

  await supabase
    .from('events')
    .update({
      description:
        'Free community picnic with 20 food vendors on a 25-stall floor plan — browse full menus with dish photos, RSVP, and explore the market map.',
      cover_image_url: COVER_IMAGE,
      visitor_capacity: 500,
      stall_rows: GRID_ROWS,
      stall_cols: GRID_COLS,
    })
    .eq('id', event.id);

  await ensureStallGrid(supabase, event.id);

  const { data: existing } = await supabase
    .from('vendor_applications')
    .select('id')
    .eq('event_id', event.id)
    .like('email', `%${VENDOR_EMAIL_DOMAIN}`);

  if (existing?.length) {
    const ids = existing.map((v) => v.id);
    await supabase.from('payments').delete().in('application_id', ids);
    await supabase.from('stall_assignments').delete().in('application_id', ids);
    await supabase.from('vendor_applications').delete().in('id', ids);
    console.log(`  Removed ${existing.length} previous showcase vendors`);
  }

  const { data: stalls } = await supabase
    .from('stalls')
    .select('id, stall_code, is_available')
    .eq('event_id', event.id);

  const stallByCode = Object.fromEntries((stalls ?? []).map((s) => [s.stall_code, s.id]));

  const stallFee = Number(event.stall_fee) || 2500;

  for (const vendor of SHOWCASE_VENDORS) {
    const { data: app, error: appError } = await supabase
      .from('vendor_applications')
      .insert({
        event_id: event.id,
        business_name: vendor.business_name,
        truck_name: vendor.truck_name,
        owner_name: vendor.owner_name,
        email: vendor.email,
        phone: `98765${String(SHOWCASE_VENDORS.indexOf(vendor) + 1).padStart(5, '0')}`,
        cuisine_type: vendor.cuisine_type,
        vendor_type: vendor.vendor_type,
        menu_description: vendor.menu_description,
        menu_items: vendor.menu_items,
        status: 'approved',
        access_token: vendor.token,
        needs_power: vendor.vendor_type === 'food_truck',
      })
      .select('id')
      .single();

    if (appError) throw new Error(`Vendor ${vendor.business_name}: ${appError.message}`);

    const stallId = stallByCode[vendor.stallCode];
    if (stallId) {
      await supabase.from('stall_assignments').insert({
        stall_id: stallId,
        application_id: app.id,
      });
      await supabase.from('stalls').update({ is_available: false }).eq('id', stallId);
    }

    if (vendor.payment) {
      const platformFee = Math.round((stallFee * 10) / 100);
      await supabase.from('payments').insert({
        event_id: event.id,
        application_id: app.id,
        amount: stallFee,
        platform_fee_amount: platformFee,
        organizer_net_amount: stallFee - platformFee,
        status: vendor.payment,
        paid_at: vendor.payment === 'paid' ? new Date().toISOString() : null,
        razorpay_payment_id:
          vendor.payment === 'paid' ? `pay_picnic_${vendor.token.slice(-8)}` : null,
      });
    }
  }

  console.log(
    `  + ${SHOWCASE_VENDORS.length} vendors on ${SHOWCASE_VENDORS.length} stalls (${GRID_ROWS * GRID_COLS} total bays)`,
  );

  await supabase
    .from('visitor_rsvps')
    .delete()
    .eq('event_id', event.id)
    .like('email', '%@picnic-guest.popmarket.dev');

  const rsvpRows = [];
  for (let i = 1; i <= 45; i++) {
    rsvpRows.push({
      event_id: event.id,
      name: `Picnic Guest ${i}`,
      email: `guest${String(i).padStart(2, '0')}@picnic-guest.popmarket.dev`,
      phone: `91234${String(10000 + i).slice(-5)}`,
      party_size: (i % 4) + 1,
      status: i % 19 === 0 ? 'waitlisted' : 'confirmed',
      access_token: `picnicrsvp${String(i).padStart(8, '0')}`,
      entry_fee_amount: 0,
      payment_status: 'none',
    });
  }

  const { error: rsvpError } = await supabase.from('visitor_rsvps').insert(rsvpRows);
  if (rsvpError) throw new Error(`RSVPs: ${rsvpError.message}`);

  const totalGuests = rsvpRows
    .filter((r) => r.status === 'confirmed')
    .reduce((sum, r) => sum + r.party_size, 0);

  console.log(`  + ${rsvpRows.length} RSVPs (${totalGuests} confirmed guests)`);
  console.log(`\nPublic showcase ready:\n  ${appUrl}/e/${EVENT_SLUG}\n`);
}

seedPublicShowcase().catch((err) => {
  console.error(err);
  process.exit(1);
});
