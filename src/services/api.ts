const API_URL = 'http://localhost:3000/api'; // Cambia esto por tu URL real si es necesario

const defaultHeaders = {
  'Content-Type': 'application/json',
};

const handleApiError = async (response: Response) => {
  let errorMsg = 'Error desconocido';
  try {
    const data = await response.json();
    errorMsg = data?.message || data?.error || errorMsg;
  } catch {}
  throw new Error(errorMsg);
};

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
    const response = await fetch(`${API_URL}/table/${tableId}/users`, { headers: defaultHeaders });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },

  startTableSession: async (tableId: string, userName: string) => {
    const response = await fetch(`${API_URL}/table/start`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ tableId, userName })
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },
};

export const productService = {
  getProducts: async () => {
    const response = await fetch(`${API_URL}/products`, { headers: defaultHeaders });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },
  getCategories: async () => {
    const response = await fetch(`${API_URL}/categories`, { headers: defaultHeaders });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },
  getProduct: async (productId: string) => {
    const response = await fetch(`${API_URL}/products/${productId}`, { headers: defaultHeaders });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },
};

export const cartService = {
  addToCart: async (cartId: string, productId: string, quantity: number, customizations: string[], userId: string, tableId: string, userName: string) => {
    const response = await fetch(`${API_URL}/cart/${cartId}/items`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        productId,
        quantity,
        customizations,
        userId,
        tableId,
        userName,
        isShared: false
      })
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },
  getCartItems: async (cartId: string) => {
    const response = await fetch(`${API_URL}/cart/${cartId}`, { headers: defaultHeaders });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },
  updateCartItem: async (cartId: string, productId: string, quantity: number, userId: string) => {
    const response = await fetch(`${API_URL}/cart/${cartId}/items/${productId}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify({
        productId,
        quantity,
        userId,
        cartId
      })
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },
  removeFromCart: async (cartId: string, productId: string) => {
    const response = await fetch(`${API_URL}/cart/${cartId}/item/${productId}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },
  createOrder: async (cartId: string) => {
    const response = await fetch(`${API_URL}/orders/from-cart`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ cartId })
    });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },
};

export const orderService = {
  getTableOrderBySession: async (sessionId: string) => {
    const response = await fetch(`${API_URL}/orders/table/session/${sessionId}`, { headers: defaultHeaders });
    if (!response.ok) await handleApiError(response);
    return response.json();
  },
}; 