export interface ShopItem {
  itemId: string;
  price: number;
  quantity: number;
}

export interface Shop {
  id: string;
  name: string;
  items: ShopItem[];
}
