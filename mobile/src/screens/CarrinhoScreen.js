import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { api, brl } from '../api';
import { useApp } from '../AppContext';
import { cores } from '../tema';

export default function CarrinhoScreen({ navigation }) {
  const { carrinho, adicionar, remover, limparCarrinho } = useApp();
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(false);

  if (!carrinho.itens.length) {
    return (
      <View style={s.vazio}>
        <Text style={{ fontSize: 48 }}>🛒</Text>
        <Text style={s.vazioTxt}>Seu carrinho está vazio</Text>
      </View>
    );
  }

  const subtotal = carrinho.itens.reduce((t, i) => t + Number(i.produto.preco) * i.quantidade, 0);
  const taxa = Number(carrinho.loja.taxa_entrega);
  const total = subtotal + taxa;

  async function finalizar() {
    if (!endereco.trim()) return Alert.alert('Atenção', 'Informe o endereço de entrega');
    setLoading(true);
    try {
      await api('/pedidos', {
        method: 'POST',
        body: {
          loja_id: carrinho.loja.id,
          endereco,
          itens: carrinho.itens.map((i) => ({ produto_id: i.produto.id, quantidade: i.quantidade })),
        },
      });
      limparCarrinho();
      setEndereco('');
      Alert.alert('Pedido enviado!', 'Acompanhe na aba Pedidos.');
      navigation.navigate('Pedidos');
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Text style={s.loja}>{carrinho.loja.nome}</Text>
      <FlatList
        data={carrinho.itens}
        keyExtractor={(i) => String(i.produto.id)}
        renderItem={({ item }) => (
          <View style={s.item}>
            <View style={{ flex: 1 }}>
              <Text style={s.nome}>{item.produto.nome}</Text>
              <Text style={s.preco}>{brl(Number(item.produto.preco) * item.quantidade)}</Text>
            </View>
            <View style={s.qtd}>
              <TouchableOpacity onPress={() => remover(item.produto.id)}><Text style={s.qBtn}>−</Text></TouchableOpacity>
              <Text style={s.qNum}>{item.quantidade}</Text>
              <TouchableOpacity onPress={() => adicionar(carrinho.loja, item.produto)}><Text style={s.qBtn}>+</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={s.rodape}>
        <TextInput style={s.input} placeholder="Endereço de entrega" value={endereco} onChangeText={setEndereco} />
        <View style={s.linha}><Text>Subtotal</Text><Text>{brl(subtotal)}</Text></View>
        <View style={s.linha}><Text>Entrega</Text><Text>{taxa === 0 ? 'Grátis' : brl(taxa)}</Text></View>
        <View style={s.linha}><Text style={s.total}>Total</Text><Text style={s.total}>{brl(total)}</Text></View>
        <TouchableOpacity style={s.botao} onPress={finalizar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.botaoTxt}>Finalizar pedido</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  vazioTxt: { marginTop: 8, color: cores.cinza, fontSize: 16 },
  loja: { fontSize: 18, fontWeight: '700', padding: 16, color: cores.texto },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: cores.borda },
  nome: { fontSize: 15, fontWeight: '600', color: cores.texto },
  preco: { color: cores.cinza, marginTop: 2 },
  qtd: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: cores.borda, borderRadius: 8 },
  qBtn: { fontSize: 22, color: cores.vermelho, paddingHorizontal: 12 },
  qNum: { fontWeight: '700', minWidth: 20, textAlign: 'center' },
  rodape: { padding: 16, borderTopWidth: 1, borderColor: cores.borda },
  input: { borderWidth: 1, borderColor: cores.borda, borderRadius: 8, padding: 10, marginBottom: 10 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  total: { fontWeight: '800', fontSize: 16 },
  botao: { backgroundColor: cores.vermelho, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  botaoTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
