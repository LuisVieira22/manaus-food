import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const Ctx = createContext();
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [carrinho, setCarrinho] = useState({ loja: null, itens: [] }); // itens: [{ produto, quantidade }]

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('usuario');
      if (u) setUsuario(JSON.parse(u));
      setCarregando(false);
    })();
  }, []);

  async function entrar(path, body) {
    const data = await api(path, { method: 'POST', body });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }

  const login = (email, senha) => entrar('/auth/login', { email, senha });
  const cadastrar = (nome, email, senha) => entrar('/auth/cadastro', { nome, email, senha });

  async function sair() {
    await AsyncStorage.multiRemove(['token', 'usuario']);
    setUsuario(null);
    setCarrinho({ loja: null, itens: [] });
  }

  // Carrinho só aceita itens de uma loja por vez (como no iFood).
  function adicionar(loja, produto) {
    setCarrinho((c) => {
      const base = c.loja && c.loja.id !== loja.id ? { loja, itens: [] } : { loja, itens: c.itens };
      const existe = base.itens.find((i) => i.produto.id === produto.id);
      const itens = existe
        ? base.itens.map((i) => (i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i))
        : [...base.itens, { produto, quantidade: 1 }];
      return { loja, itens };
    });
  }

  function remover(produtoId) {
    setCarrinho((c) => {
      const itens = c.itens
        .map((i) => (i.produto.id === produtoId ? { ...i, quantidade: i.quantidade - 1 } : i))
        .filter((i) => i.quantidade > 0);
      return itens.length ? { ...c, itens } : { loja: null, itens: [] };
    });
  }

  const limparCarrinho = () => setCarrinho({ loja: null, itens: [] });
  const qtdTotal = carrinho.itens.reduce((s, i) => s + i.quantidade, 0);

  return (
    <Ctx.Provider
      value={{ usuario, carregando, login, cadastrar, sair, carrinho, adicionar, remover, limparCarrinho, qtdTotal }}
    >
      {children}
    </Ctx.Provider>
  );
}
