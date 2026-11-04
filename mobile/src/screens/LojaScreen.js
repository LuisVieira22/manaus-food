import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { api, brl } from '../api';
import { useApp } from '../AppContext';
import { cores } from '../tema';

export default function LojaScreen({ route, navigation }) {
  const { id } = route.params;
  const { adicionar, carrinho, qtdTotal } = useApp();
  const [loja, setLoja] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api('/lojas/' + id).then(setLoja).catch((e) => setErro(e.message));
  }, [id]);

  if (erro) return <Text style={{ padding: 20, color: cores.vermelho }}>{erro}</Text>;
  if (!loja) return <ActivityIndicator style={{ flex: 1 }} size="large" color={cores.vermelho} />;

  const subtotal = carrinho.loja?.id === loja.id
    ? carrinho.itens.reduce((s, i) => s + Number(i.produto.preco) * i.quantidade, 0)
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={loja.produtos}
        keyExtractor={(p) => String(p.id)}
        ListHeaderComponent={
          <View style={s.cabecalho}>
            <Text style={{ fontSize: 40 }}>{loja.emoji}</Text>
            <Text style={s.titulo}>{loja.nome}</Text>
            <Text style={s.info}>{loja.tempo_min}-{loja.tempo_max} min • Entrega {Number(loja.taxa_entrega) === 0 ? 'grátis' : brl(loja.taxa_entrega)}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.produto}>
            <View style={{ flex: 1 }}>
              <Text style={s.pNome}>{item.nome}</Text>
              {!!item.descricao && <Text style={s.pDesc}>{item.descricao}</Text>}
              <Text style={s.pPreco}>{brl(item.preco)}</Text>
            </View>
            <TouchableOpacity style={s.add} onPress={() => adicionar(loja, item)}>
              <Text style={s.addTxt}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      {subtotal > 0 && (
        <TouchableOpacity style={s.barra} onPress={() => navigation.navigate('Carrinho')}>
          <Text style={s.barraTxt}>Ver carrinho ({qtdTotal})</Text>
          <Text style={s.barraTxt}>{brl(subtotal)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  cabecalho: { alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: cores.borda },
  titulo: { fontSize: 22, fontWeight: '800', color: cores.texto, marginTop: 6 },
  info: { color: cores.cinza, marginTop: 4 },
  produto: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: cores.borda },
  pNome: { fontSize: 16, fontWeight: '600', color: cores.texto },
  pDesc: { color: cores.cinza, marginTop: 2 },
  pPreco: { color: cores.verde, fontWeight: '700', marginTop: 6 },
  add: { backgroundColor: cores.vermelho, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addTxt: { color: '#fff', fontSize: 22, lineHeight: 24 },
  barra: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: cores.vermelho, margin: 12, padding: 16, borderRadius: 10 },
  barraTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
