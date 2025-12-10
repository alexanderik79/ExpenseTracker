import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, StyleSheet } from 'react-native'; 
import 'react-native-get-random-values'; 
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const ExpenseContext = createContext();

// --- AsyncStorage Keys ---
const EXPENSES_KEY = '@expenseTracker:expenses';
const CATEGORIES_KEY = '@expenseTracker:categories';
const CURRENCY_KEY = '@expenseTracker:currency'; 

// Updated initial categories structure from your original code
const INITIAL_CATEGORIES = [
    { name: 'Food', limit: 500, color: '#FF6347' }, 
    { name: 'Fuel', limit: 200, color: '#FFA500' },
    { name: 'Rent', limit: 1200, color: '#4682B4' }
];

export const ExpenseProvider = ({ children }) => {
    // --- ОСНОВНЫЕ СОСТОЯНИЯ ---
    const [categories, setCategories] = useState([]); 
    const [expenses, setExpenses] = useState([]);
    const [currency, setCurrency] = useState('€'); 
    const [loading, setLoading] = useState(true); 

    // --- SAVE FUNCTIONS ---
    const saveCategories = async (newCategories) => {
        try {
            await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories));
            setCategories(newCategories); 
        } catch (error) {
            console.error('Error saving categories:', error);
        }
    };

    const saveExpenses = async (newExpenses) => {
        try {
            await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(newExpenses));
            setExpenses(newExpenses); 
        } catch (error) {
            console.error('Error saving expenses:', error);
        }
    };

    // --- CURRENCY LOGIC ---
    const updateCurrency = async (newCurrency) => {
        try {
            await AsyncStorage.setItem(CURRENCY_KEY, newCurrency);
            setCurrency(newCurrency);
        } catch (e) {
            console.error("Failed to save currency to storage", e);
        }
    };

    // --- ADD/DELETE CATEGORY ---
    const addCategory = (categoryName, limitAmount = 0, color = '#FFFFFF') => {
        const name = categoryName.trim();
        if (!categories.some(cat => cat.name === name) && name !== '') {
            const newCategory = { name, limit: parseFloat(limitAmount) || 0, color };
            const updatedCategories = [...categories, newCategory];
            saveCategories(updatedCategories);
            return true;
        }
        return false;
    };
    
    const deleteCategory = (categoryName) => {
        const updatedCategories = categories.filter(cat => cat.name !== categoryName);
        const updatedExpenses = expenses.filter(exp => exp.category !== categoryName);

        saveCategories(updatedCategories);
        saveExpenses(updatedExpenses);
    };
    
    // --- НОВАЯ ФУНКЦИЯ: UPDATE CATEGORY ---
    const updateCategory = (originalName, newName, newLimit) => {
        // 1. Проверка на дубликат имени (кроме самой редактируемой категории)
        const trimmedNewName = newName.trim();

        if (trimmedNewName === '') {
            return false; // Имя не может быть пустым
        }

        const isDuplicate = categories.some(
            cat => cat.name === trimmedNewName && cat.name !== originalName
        );
        
        if (isDuplicate) {
            return false; // Имя занято другой категорией
        }

        let updatedCategories;
        let updatedExpenses = expenses;

        // 2. Обновление списка категорий
        const categoryToUpdate = categories.find(cat => cat.name === originalName);
        let categoryColor = categoryToUpdate ? categoryToUpdate.color : '#FFFFFF'; 

        updatedCategories = categories.map(cat => {
            if (cat.name === originalName) {
                return {
                    ...cat,
                    name: trimmedNewName, // Обновленное имя
                    limit: newLimit,     // Обновленный лимит
                    color: categoryColor,
                };
            }
            return cat;
        });

        // 3. Обновление расходов (только если имя категории изменилось)
        if (originalName !== trimmedNewName) {
            updatedExpenses = expenses.map(exp => {
                if (exp.category === originalName) {
                    return {
                        ...exp,
                        category: trimmedNewName,
                    };
                }
                return exp;
            });
            saveExpenses(updatedExpenses); // Сохраняем обновленные расходы
        }
        
        saveCategories(updatedCategories); // Сохраняем обновленные категории
        
        return true; // Успех!
    };
    // ------------------------------------

    // --- ADD/DELETE EXPENSE ---
    const addExpense = (amount, category) => {
        const newExpense = {
            id: uuidv4(), // Используем uuidv4 для уникального ID
            amount: parseFloat(amount), 
            category: category,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        };

        const updatedExpenses = [newExpense, ...expenses]; 
        saveExpenses(updatedExpenses); 
    };
    
    const deleteExpense = (id) => {
        const updatedExpenses = expenses.filter(exp => exp.id !== id);
        saveExpenses(updatedExpenses);
    };

    // --- LOAD FUNCTION ---
    const loadData = async () => {
        try {
            // 1. Загрузка категорий
            const storedCategories = await AsyncStorage.getItem(CATEGORIES_KEY);
            if (storedCategories) {
                let parsed = JSON.parse(storedCategories);
                if (parsed.length > 0 && typeof parsed[0] === 'string') {
                    parsed = parsed.map(name => ({ name, limit: 0, color: '#FFFFFF' }));
                }
                setCategories(parsed);
            } else {
                await saveCategories(INITIAL_CATEGORIES);
            }
            
            // 2. Загрузка расходов
            const storedExpenses = await AsyncStorage.getItem(EXPENSES_KEY);
            if (storedExpenses) {
                setExpenses(JSON.parse(storedExpenses));
            }

            // 3. Загрузка валюты
            const storedCurrency = await AsyncStorage.getItem(CURRENCY_KEY);
            if (storedCurrency !== null) {
                setCurrency(storedCurrency);
            }
            
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- useEffect для загрузки данных при монтировании ---
    useEffect(() => {
        loadData();
    }, []);

    const contextValue = {
        categories,
        expenses,
        currency, 
        loading,
        addCategory,
        deleteCategory,
        updateCategory, // <-- ДОБАВЛЕНО
        addExpense,
        deleteExpense,
        setCurrency: updateCurrency, 
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading Data...</Text>
            </View>
        );
    }

    return (
        <ExpenseContext.Provider value={contextValue}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => {
    return useContext(ExpenseContext);
};

// --- STYLES ---
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#121212'
    },
    loadingText: {
        fontSize: 18,
        color: '#FFFFFF', 
        marginTop: 50
    }
});