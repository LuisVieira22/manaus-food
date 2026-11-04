import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useApp } from '../AppContext';
import { cores } from '../tema';

export default function LoginScreen() {
  const { login, cadastrar } = useApp();
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function enviar() {
    setLoading(true);
    try {
      if (modoCadastro) await cadastrar(nome, email, senha);
      else await login(email, senha);
    } catch (e) {
      Alert.alert('Ops', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={s.logo}>Manaus Food</Text>
      <Text style={s.sub}>{modoCadastro ? 'Crie sua conta' : 'Entre para pedir'}</Text>

      {modoCadastro && <TextInput style={s.input} placeholder="Nome" value={nome} onChangeText={setNome} />}
      <TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={s.input} placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />

      <TouchableOpacity style={s.botao} onPress={enviar} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.botaoTxt}>{modoCadastro ? 'Cadastrar' : 'Entrar'}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setModoCadastro(!modoCadastro)}>
        <Text style={s.link}>{modoCadastro ? 'Já tenho conta' : 'Criar uma conta'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  logo: { fontSize: 34, fontWeight: '800', color: cores.vermelho, textAlign: 'center' },
  sub: { textAlign: 'center', color: cores.cinza, marginBottom: 24, marginTop: 4 },
  input: { borderWidth: 1, borderColor: cores.borda, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  botao: { backgroundColor: cores.vermelho, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  botaoTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: cores.vermelho, textAlign: 'center', marginTop: 18, fontWeight: '600' },
});
