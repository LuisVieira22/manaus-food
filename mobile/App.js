import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider, useApp } from './src/AppContext';
import { cores } from './src/tema';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import LojaScreen from './src/screens/LojaScreen';
import CarrinhoScreen from './src/screens/CarrinhoScreen';
import PedidosScreen from './src/screens/PedidosScreen';
import PerfilScreen from './src/screens/PerfilScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icones = { Inicio: 'home', Carrinho: 'cart', Pedidos: 'receipt', Perfil: 'person' };

function Tabs() {
  const { qtdTotal } = useApp();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: cores.vermelho,
        tabBarIcon: ({ color, size }) => <Ionicons name={icones[route.name]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} options={{ title: 'Início', headerTitle: 'Manaus Food' }} />
      <Tab.Screen name="Carrinho" component={CarrinhoScreen} options={{ tabBarBadge: qtdTotal || undefined }} />
      <Tab.Screen name="Pedidos" component={PedidosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

function Rotas() {
  const { usuario, carregando } = useApp();

  if (carregando) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color={cores.vermelho} /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {usuario ? (
          <>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="Loja" component={LojaScreen} options={({ route }) => ({ title: route.params.nome })} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Rotas />
    </AppProvider>
  );
}
