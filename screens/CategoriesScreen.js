import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// ОБНОВЛЕНИЕ: Импортируем updateCategory из контекста
import { useExpenses } from '../context/ExpenseContext'; 
// НОВЫЙ ИМПОРТ: Импортируем модальное окно
import EditCategoryModal from '../components/EditCategoryModal'; 

const CategoriesScreen = ({ navigation }) => {
    // Получаем updateCategory из контекста
    const { categories, addCategory, deleteCategory, updateCategory, currency } = useExpenses(); 
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryLimit, setNewCategoryLimit] = useState(''); 

    // НОВОЕ СОСТОЯНИЕ: для модального окна редактирования
    const [editingCategory, setEditingCategory] = useState(null); 

    const handleAddCategory = () => {
        if (newCategoryName.trim().length > 0) {
            // Parse the limit amount
            const limit = parseFloat(newCategoryLimit.replace(',', '.')) || 0;
            
            addCategory(newCategoryName.trim(), limit);
            
            setNewCategoryName(''); 
            setNewCategoryLimit(''); 
        }
    };

    const handleDeleteCategory = (name) => {
        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to delete the category "${name}"? This will also delete all associated expenses.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteCategory(name) }
            ]
        );
    };

    // НОВАЯ ФУНКЦИЯ: Обработка сохранения изменений в категории
    const handleUpdateCategory = (originalName, newName, newLimit) => {
        const success = updateCategory(originalName, newName, newLimit);
        
        if (success) {
            Alert.alert('Success', `Category "${newName}" updated.`);
            setEditingCategory(null); // Закрываем модальное окно
        } else {
            // Эта ошибка обычно возникает, если новое имя уже существует
            Alert.alert('Error', `Failed to update category. The name "${newName}" might already exist.`);
        }
    };

    const renderCategoryItem = ({ item }) => (
        <View style={styles.categoryItem}>
            <Text style={styles.categoryText}>{item.name}</Text>
            
            {/* Display Limit (используем {currency}) */}
            <Text style={styles.categoryLimit}>
                Limit: {item.limit > 0 ? `${item.limit.toFixed(2)} ${currency}` : 'N/A'}
            </Text>
            
            {/* Контейнер для кнопок редактирования и удаления */}
            <View style={styles.actionsContainer}>
                {/* НОВАЯ КНОПКА: Edit Button */}
                <TouchableOpacity 
                    onPress={() => setEditingCategory(item)} // Устанавливаем категорию для редактирования
                    style={styles.actionButton}
                >
                    <Ionicons name="pencil-outline" size={20} color="#CF6679" />
                </TouchableOpacity>
                
                {/* Delete Button */}
                <TouchableOpacity 
                    onPress={() => handleDeleteCategory(item.name)} 
                    style={styles.actionButton} // Используем общий стиль для отступов
                >
                    <Ionicons name="trash-bin-outline" size={20} color="#CF6679" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            
            {/* Input section for adding new category and limit */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.inputName}
                    placeholder="Category Name"
                    placeholderTextColor="#777"
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                />
                <TextInput
                    style={styles.inputLimit}
                    // Placeholder (используем {currency})
                    placeholder={`Limit (${currency})`} 
                    placeholderTextColor="#777"
                    keyboardType="numeric"
                    value={newCategoryLimit}
                    onChangeText={setNewCategoryLimit}
                />
                <TouchableOpacity 
                    onPress={handleAddCategory} 
                    style={[styles.addButton, { opacity: newCategoryName.trim().length === 0 ? 0.5 : 1 }]}
                    disabled={newCategoryName.trim().length === 0}
                >
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
                
            </View>

            <Text style={styles.listHeader}>Existing Categories:</Text>
            
            {/* Displaying the list of categories */}
            <FlatList
                data={categories} 
                keyExtractor={(item) => item.name}
                renderItem={renderCategoryItem}
            />

            {/* НОВЫЙ КОМПОНЕНТ: Модальное окно редактирования */}
            <EditCategoryModal
                visible={!!editingCategory} // Видимость, если категория выбрана
                category={editingCategory}
                currency={currency}
                onClose={() => setEditingCategory(null)}
                onSave={handleUpdateCategory}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#121212', 
    },
    // ... (стили header, inputContainer, inputName, inputLimit, addButton, addButtonText, listHeader без изменений)
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#FFFFFF', 
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#1F1F1F', 
        borderRadius: 12,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5, 
        shadowRadius: 5,
        elevation: 8, 
        alignItems: 'center', 
    },
    inputName: {
        flex: 2, 
        backgroundColor: '#2D2D2D', 
        color: '#FFFFFF',
        padding: 10,
        marginRight: 10,
        borderRadius: 8,
        fontSize: 16,
    },
    inputLimit: {
        flex: 1, 
        backgroundColor: '#2D2D2D', 
        color: '#FFFFFF',
        padding: 10,
        marginRight: 10,
        borderRadius: 8,
        fontSize: 16,
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: '#FF702A', 
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        height: 48, 
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#121212', 
        fontSize: 16,
        fontWeight: 'bold',
    },
    listHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 10,
        color: '#FF702A', 
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#1F1F1F', 
        borderBottomWidth: 1,
        borderBottomColor: '#2D2D2D',
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2, 
        shadowRadius: 3,
        elevation: 4, 
    },
    categoryText: {
        flex: 2,
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    categoryLimit: {
        flex: 1.5,
        fontSize: 14,
        color: '#AAAAAA',
        textAlign: 'right',
        marginRight: 10,
    },
    // НОВЫЕ СТИЛИ ДЛЯ КОНТЕЙНЕРА ДЕЙСТВИЙ
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        paddingLeft: 10, // Отступ между кнопками
    },
    deleteButton: {
        // Убрали paddingLeft: 10 отсюда, заменив его на actionButton
    }
});

export default CategoriesScreen;