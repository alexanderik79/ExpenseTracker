// /components/SettingsModal.js

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// ИЗМЕНЕНИЕ: Импортируем SafeAreaView из react-native-safe-area-context
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useExpenses } from '../context/ExpenseContext'; 

// Список доступных валют (Вы можете расширить этот список)
const currencies = [
    { name: 'US Dollar', symbol: '$' },
    { name: 'Euro', symbol: '€' },
    { name: 'Pound', symbol: '£' },
    { name: 'Гривня', symbol: '₴' },
    { name: 'Zloty', symbol: 'zł' },
];

const SettingsModal = ({ visible, onClose }) => {
    // Получаем текущую валюту и функцию для ее обновления из контекста
    const { currency, setCurrency } = useExpenses();

    const handleSelectCurrency = (newCurrency) => {
        setCurrency(newCurrency.symbol); // Обновляем валюту в контексте
        onClose(); // Закрываем модальное окно
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.currencyItem} 
            onPress={() => handleSelectCurrency(item)}
        >
            <Text style={styles.currencyText}>
                {item.name} ({item.symbol})
            </Text>
            {/* Показываем галочку, если это выбранная валюта */}
            {currency === item.symbol && (
                <Ionicons name="checkmark-circle" size={20} color="#FF702A" />
            )}
        </TouchableOpacity>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >

            <SafeAreaView style={styles.centeredView}>
                <View style={styles.modalView}>
                    
                    <Text style={styles.modalTitle}>Select Currency</Text>
                    
                    <FlatList
                        data={currencies}
                        renderItem={renderItem}
                        keyExtractor={item => item.symbol}
                        style={styles.list}
                    />

                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>

                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Темный фон для модального окна
    },
    modalView: {
        width: '90%',
        backgroundColor: '#1F1F1F', // Темный цвет фона
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
    },
    list: {
        width: '100%',
    },
    currencyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    currencyText: {
        fontSize: 18,
        color: '#BBBBBB',
    },
    closeButton: {
        backgroundColor: '#FF702A',
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginTop: 20,
        width: '50%',
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default SettingsModal;