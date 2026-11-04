import AsyncStorage from '@react-native-async-storage/async-storage';

// ALTERE AQUI:
// - Emulador Android: http://10.0.2.2:3000
// - Celular físico (Expo Go): http://IP_DO_SEU_PC:3000  (descubra com `ipconfig`, ex.: 192.168.0.15)
export const API_URL = 'http://10.0.2.2:3000';

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
    throw new Error('Não foi possível conectar ao servidor. Verifique a API_URL e se o backend está rodando.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || 'Erro na requisição');
  return data;
}

export const brl = (n) => 'R$ ' + Number(n).toFixed(2).replace('.', ',');
