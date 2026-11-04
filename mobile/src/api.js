import AsyncStorage from '@react-native-async-storage/async-storage';

// ALTERE AQUI:
// - Emulador Android: https://manaus-food.onrender.com
// - Celular fÃ­sico (Expo Go): http://IP_DO_SEU_PC:3000  (descubra com `ipconfig`, ex.: 192.168.0.15)
export const API_URL = 'https://manaus-food.onrender.com';

export async function api(path, { method = 'GET', body } = {}) {
  const token = await AsyncStorage.getItem('token');
  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('NÃ£o foi possÃ­vel conectar ao servidor. Verifique a API_URL e se o backend estÃ¡ rodando.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || 'Erro na requisiÃ§Ã£o');
  return data;
}

export const brl = (n) => 'R$ ' + Number(n).toFixed(2).replace('.', ',');
