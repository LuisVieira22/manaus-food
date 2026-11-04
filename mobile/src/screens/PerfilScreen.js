import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../AppContext';
import { cores } from '../tema';

export default function PerfilScreen() {
  const { usuario, sair } = useApp();
  return (
    <View style={s.tela}>
      <Text style={s.avatar}>👤</Text>
      <Text style={s.nome}>{usuario?.nome}</Text>
      <Text style={s.email}>{usuario?.email}</Text>
      <TouchableOpacity style={s.botao} onPress={sair}>
        <Text style={s.botaoTxt}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 24 },
  avatar: { fontSize: 56 },
  nome: { fontSize: 20, fontWeight: '700', marginTop: 8, color: cores.texto },
  email: { color: cores.cinza, marginBottom: 24 },
  botao: { borderWidth: 1, borderColor: cores.vermelho, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 8 },
  botaoTxt: { color: cores.vermelho, fontWeight: '700' },
});
