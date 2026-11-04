import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { api } from '../api';
import { cores } from '../tema';

const CATEGORIAS = [
  { nome: 'Restaurantes', emoji: '🍽️' },
  { nome: 'Mercados', emoji: '🛒' },
  { nome: 'Farmácias', emoji: '💊' },
  { nome: 'Pet shops', emoji: '🐶' },
  { nome: 'Bebidas', emoji: '🍺' },
];

export default function HomeScreen({ navigation }) {
  const [lojas, setLojas] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const q = categoria ? `?categoria=${encodeURIComponent(categoria)}` : '';
      setLojas(await api('/lojas' + q));
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [categoria]);

  useEffect(() => {
    setLoading(true);
    carregar();
  }, [carregar]);

  const Topo = (
    <View>
      <View style={s.categorias}>
        {CATEGORIAS.map((c) => {
          const ativa = categoria === c.nome;
          return (
            <TouchableOpacity
              key={c.nome}
              style={[s.cat, ativa && s.catAtiva]}
              onPress={() => setCategoria(ativa ? null : c.nome)}
            >
              <Text style={s.catEmoji}>{c.emoji}</Text>
              <Text style={s.catNome}>{c.nome}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={s.banner}>
        <Text style={s.bannerTitulo}>Bora pedir de novo?</Text>
        <Text style={s.bannerTxt}>Entrega grátis em lojas selecionadas</Text>
      </View>
      <Text style={s.secao}>{categoria || 'Todas as lojas'}</Text>
      {erro && <Text style={s.erro}>{erro}</Text>}
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={cores.vermelho} />;

  return (
    <FlatList
      style={{ backgroundColor: '#fff' }}
      data={lojas}
      keyExtractor={(l) => String(l.id)}
      ListHeaderComponent={Topo}
      refreshControl={<RefreshControl refreshing={false} onRefresh={carregar} />}
      renderItem={({ item }) => (
        <TouchableOpacity style={s.loja} onPress={() => navigation.navigate('Loja', { id: item.id, nome: item.nome })}>
          <View style={s.lojaFoto}><Text style={{ fontSize: 30 }}>{item.emoji}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.lojaNome}>{item.nome}</Text>
            <Text style={s.lojaInfo}>
              {item.tempo_min}-{item.tempo_max} min •{' '}
              <Text style={Number(item.taxa_entrega) === 0 ? { color: cores.verde } : {}}>
                {Number(item.taxa_entrega) === 0 ? 'Grátis' : 'R$ ' + Number(item.taxa_entrega).toFixed(2).replace('.', ',')}
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={!erro && <Text style={s.vazio}>Nenhuma loja encontrada.</Text>}
    />
  );
}

const s = StyleSheet.create({
  categorias: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  cat: { width: '22%', backgroundColor: cores.fundo, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  catAtiva: { borderColor: cores.vermelho, backgroundColor: '#FDECEE' },
  catEmoji: { fontSize: 24 },
  catNome: { fontSize: 11, marginTop: 4, color: cores.texto },
  banner: { backgroundColor: cores.verde, margin: 12, borderRadius: 12, padding: 18 },
  bannerTitulo: { color: '#fff', fontSize: 20, fontWeight: '800' },
  bannerTxt: { color: '#fff', marginTop: 4 },
  secao: { fontSize: 18, fontWeight: '700', paddingHorizontal: 16, paddingVertical: 8, color: cores.texto },
  loja: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  lojaFoto: { width: 64, height: 64, borderRadius: 10, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center' },
  lojaNome: { fontSize: 16, fontWeight: '600', color: cores.texto },
  lojaInfo: { color: cores.cinza, marginTop: 2 },
  erro: { color: cores.vermelho, padding: 16 },
  vazio: { textAlign: 'center', color: cores.cinza, padding: 24 },
});
