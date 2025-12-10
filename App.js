import React, { useEffect, useState } from 'react'; 
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
import { Linking, TouchableOpacity, StyleSheet, View } from 'react-native'; 
import * as KeepAwake from 'expo-keep-awake'; 
import { StatusBar } from 'expo-status-bar';
// ИЗМЕНЕНИЕ: Импортируем useSafeAreaInsets для отступов
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'; 

// Import the context provider
import { ExpenseProvider } from './context/ExpenseContext'; 

// Import screens
import AddExpenseScreen from './screens/AddExpenseScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsModal from './components/SettingsModal'; 

const Tab = createBottomTabNavigator();

// --- КОМПОНЕНТ КНОПКИ ДЛЯ САЙТА ---
const WebsiteButton = () => {
    const URL = 'https://oleksandr-patsahan.netlify.app/'; 
    
    const handlePress = () => {
        Linking.openURL(URL).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.headerButton}>
            <Ionicons 
                name="globe-outline" 
                size={24} 
                color="#FF702A"
            />
        </TouchableOpacity>
    );
};

// --- КОМПОНЕНТ ДЛЯ ОБЕИХ ИКОНОК В ЗАГОЛОВКЕ ---
const HeaderIcons = ({ onSettingsPress }) => (
    <View style={styles.headerIconContainer}> 
        {/* 1. КНОПКА НАСТРОЕК */}
        <TouchableOpacity onPress={onSettingsPress} style={styles.iconButton}>
            <Ionicons 
                name="settings-outline" 
                size={24} 
                color="#BBBBBB"
            />
        </TouchableOpacity>

        {/* 2. КНОПКА САЙТА */}
        <WebsiteButton /> 
    </View>
);
// --- КОНЕЦ КОМПОНЕНТА HeaderIcons ---


const MainNavigator = () => {
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    
    // НОВОЕ: Получаем текущие инсеты (отступы) безопасной зоны
    const insets = useSafeAreaInsets();
    
    return (
        <>
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Expense') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Categories') {
                        iconName = focused ? 'list-circle' : 'list-circle-outline';
                    } else if (route.name === 'Reports') {
                        iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#FF702A', 
                tabBarInactiveTintColor: '#BBBBBB', 
                tabBarStyle: {
                    backgroundColor: '#1F1F1F', 
                    borderTopWidth: 0,
                    // ИЗМЕНЕНИЕ: Устанавливаем высоту, добавляя отступ снизу
                    height: 60 + insets.bottom, 
                    // ИЗМЕНЕНИЕ: Добавляем paddingBottom, равный нижнему отступу
                    paddingBottom: 5 + insets.bottom, 
                },
                headerShown: true, 
                headerStyle: {
                    backgroundColor: '#1F1F1F', 
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 0,
                },
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 20,
                    color: '#FFFFFF', 
                },
                headerRight: () => (
                    <HeaderIcons onSettingsPress={() => setIsSettingsVisible(true)} />
                ),
            })}
        >
            <Tab.Screen name="Expense" component={AddExpenseScreen} options={{ title: 'New Expense' }} />
            <Tab.Screen name="Categories" component={CategoriesScreen} />
            <Tab.Screen name="Reports" component={ReportsScreen} />
        </Tab.Navigator>
        
        {/* --- МОДАЛЬНОЕ ОКНО НАСТРОЕК --- */}
        <SettingsModal 
            visible={isSettingsVisible} 
            onClose={() => setIsSettingsVisible(false)} 
        />
        </>
    );
};

export default function App() {
    // Активация KeepAwake
    useEffect(() => {
        const activate = async () => {
            try {
                await KeepAwake.activateKeepAwakeAsync();
            } catch (e) {
                console.warn('Failed to keep screen awake:', e);
            }
        };
        activate();

        return () => {
            KeepAwake.deactivateKeepAwake();
        };
    }, []);

    return (
        // Оборачиваем все приложение в SafeAreaProvider
        <SafeAreaProvider> 
            <ExpenseProvider> 
                <NavigationContainer>
                    {/* MainNavigator теперь имеет доступ к useSafeAreaInsets */}
                    <MainNavigator /> 
                    <StatusBar style="light" /> 
                </NavigationContainer>
            </ExpenseProvider>
        </SafeAreaProvider>
    );
}

// --- СТИЛИ ---
const styles = StyleSheet.create({
    headerIconContainer: { 
        flexDirection: 'row',
        marginRight: 15, 
    },
    headerButton: { 
        padding: 5,
    },
    iconButton: {
        padding: 5,
        marginRight: 5, 
    }
});