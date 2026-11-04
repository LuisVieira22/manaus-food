import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, brl } from '../api';
import { cores } from '../tema';

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setPedidos(await api('/pedidos'));
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={cores.vermelho} />;

  return (
    <FlatList
      style={{ backgroundColor: '#fff' }}
      data={pedidos}
      keyExtractor={(p) => String(p.id)}
      refreshControl={<RefreshControl refreshing={false} onRefresh={carregar} />}
      ListEmptyComponent={<Text style={s.vazio}>{erro || 'Você ainda não fez pedidos.'}</Text>}
      renderItem={({ item }) => (
        <View style={s.card}>
          <View style={s.topo}>
            <Text style={s.loja}>{item.loja_nome}</Text>
            <Text style={s.status}>{item.status}</Text>
          </View>
          {item.itens.map((i, idx) => (
            <Text key={idx} style={s.item}>{i.quantidade}x {i.nome}</Text>
          ))}
          <Text style={s.total}>Total: {brl(item.total)}</Text>
          <Text style={s.data}>{new Date(item.criado_em).toLocaleString('pt-BR')}</Text>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  vazio: { textAlign: 'center', color: cores.cinza, padding: 30 },
  card: { margin: 12, marginBottom: 0, padding: 14, borderWidth: 1, borderColor: cores.borda, borderRadius: 10 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  loja: { fontSize: 16, fontWeight: '700', color: cores.texto },
  status: { color: cores.verde, fontWeight: '700', textTransform: 'capitalize' },
  item: { color: cores.cinza },
  total: { fontWeight: '700', marginTop: 8 },
  data: { color: cores.cinza, fontSize: 12, marginTop: 4 },
});
