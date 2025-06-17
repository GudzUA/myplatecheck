export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

const CART_KEY = "cart";

// Отримати корзину з localStorage
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Зберегти корзину в localStorage
function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Додати товар до корзини
export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find((p) => p.id === item.id);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

// Видалити товар
export function removeFromCart(id: string) {
  const cart = getCart().filter((p) => p.id !== id);
  saveCart(cart);
}

// Очистити корзину
export function clearCart() {
  saveCart([]);
}
