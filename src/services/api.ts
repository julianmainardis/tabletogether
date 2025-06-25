const API_URL = 'http://localhost:3000/api'; // Cambia esto por tu URL real si es necesario

export interface TableSessionResponse {
  sessionId: string;
  sessionToken: string;
  isOwner: boolean;
  tableNumber: number;
  userName: string;
  tableId: string;
  userId: string;
  cart?: {
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    table_id: string;
    is_active: boolean;
  };
}

export const tableService = {
  getTableInfo: async (tableId: string) => {
    const response = await fetch(`${API_URL}/table/${tableId}/users`);
    if (!response.ok) throw new Error('No se pudo obtener la información de la mesa');
    return response.json();
  },

  startTableSession: async (tableId: string, userName: string) => {
    const response = await fetch(`${API_URL}/table/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, userName })
    });
    if (!response.ok) throw new Error('No se pudo iniciar la sesión en la mesa');
    return response.json();
  },
};

export const productService = {
  getProducts: async () => {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('No se pudieron obtener los productos');
    return response.json();
  },
  getCategories: async () => {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error('No se pudieron obtener las categorías');
    return response.json();
  },
}; 