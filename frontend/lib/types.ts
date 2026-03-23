export interface DiscountTier {
  min_quantity: number
  discount_percent: number
}

export interface Product {
  id: number
  name: string
  type: string
  quantity: number
  code: string
  price: number
  discount_tiers: DiscountTier[]
}

export interface Client {
  id: number
  name: string
  surname: string
  email: string
  partita_iva: string | null
  azienda: string | null
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  product: Product
}

export interface Order {
  id: number
  client_id: number
  status: 'pending' | 'completed'
  created_at: string
  client: Client
  items: OrderItem[]
}
