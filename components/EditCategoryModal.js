// /components/EditCategoryModal.js

import React, { useState } from 'react';
import { 
    Modal, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

const EditCategoryModal = ({ 
    visible, 
    category, 
    currency, 
    onClose, 
    onSave 
}) => {
    // Используем 'category' для инициализации локальных состояний
    const [name, setName] = useState(category ? category.name : '');
    const [limit, setLimit] = useState(category ? String(category.limit) : '0'); 

    // Сбрасываем состояния при изменении категории или видимости
    React.useEffect(() => {
        if (category) {
            // Преобразование лимита в строку для TextInput
            setLimit(String(category.limit)); 
            setName(category.name);
        }
    }, [category, visible]);

    const handleSave = () => {
        const newLimit = parseFloat(limit.replace(',', '.')) || 0;
        
        if (name.trim().length === 0) {
            Alert.alert('Error', 'Category name cannot be empty.');
            return;
        }

        // Вызываем функцию сохранения, передавая оригинальное имя, новое имя и новый лимит
        onSave(category.name, name.trim(), newLimit);
    };

    if (!category) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                style={styles.centeredView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Edit "{category.name}"</Text>
                    
                    {/* Input: Category Name */}
                    <Text style={styles.label}>Category Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor="#777"
                        value={name}
                        onChangeText={setName}
                    />

                    {/* Input: Category Limit */}
                    <Text style={styles.label}>Limit ({currency})</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={`Limit (${currency})`}
                        placeholderTextColor="#777"
                        keyboardType="numeric"
                        value={limit}
                        onChangeText={setLimit}
                    />

                    <View style={styles.buttonContainer}>
                        {/* Save Button */}
                        <TouchableOpacity 
                            style={[styles.button, styles.buttonSave]}
                            onPress={handleSave}
                        >
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                        
                        {/* Cancel Button */}
                        <TouchableOpacity 
                            style={[styles.button, styles.buttonClose]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// СТИЛИ ДЛЯ МОДАЛЬНОГО ОКНА
const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        margin: 20,
        backgroundColor: '#1F1F1F',
        borderRadius: 12,
        padding: 25,
        alignItems: 'stretch',
        shadowColor: '#FF702A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        width: '80%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        color: '#FF702A',
        marginTop: 10,
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#2D2D2D', 
        color: '#FFFFFF',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#444444',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        borderRadius: 8,
        padding: 10,
        elevation: 2,
        width: '48%',
        alignItems: 'center',
    },
    buttonSave: {
        backgroundColor: '#FF702A',
    },
    buttonClose: {
        backgroundColor: '#444444',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default EditCategoryModal;