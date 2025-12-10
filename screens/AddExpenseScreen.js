import React, { useState, useEffect, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    Alert, 
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useExpenses } from '../context/ExpenseContext'; // Обновили импорт на useExpenses

// Helper component for the budget bar
// ДОБАВИЛИ prop currency
const BudgetProgress = ({ spent, limit, currency }) => { 
    if (limit <= 0) return null; 

    const remaining = limit - spent;
    const percentage = (spent / limit) * 100;
    
    // let barColor = '#FF702A'; // Orange (Good progress)
    let barColor = '#91ff2aff'; 

    if (percentage > 75) barColor = '#FFC300'; // Yellow (Warning)
    if (percentage > 100) barColor = '#CF6679'; // Red (Over budget)

    const barWidth = Math.min(percentage, 100); 

    return (
        <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBase, {backgroundColor: remaining < 0 ? '#330000' : '#2D2D2D'}]}>
                <View style={[styles.progressBarFill, { width: `${barWidth}%`, backgroundColor: barColor }]} />
            </View>
            <View style={styles.budgetSummary}>
                {/* ИСПОЛЬЗУЕМ currency */}
                <Text style={styles.budgetSpent}>Spent: {spent.toFixed(2)} {currency}</Text>
                <Text style={[styles.budgetRemaining, { color: remaining < 0 ? '#CF6679' : '#BBBBBB' }]}>
                    {/* ИСПОЛЬЗУЕМ currency */}
                    Remaining: {remaining.toFixed(2)} {currency}
                </Text>
            </View>
        </View>
    );
};


const AddExpenseScreen = ({ navigation }) => {
    // ПОЛУЧАЕМ currency ИЗ КОНТЕКСТА
    const { categories, expenses, addExpense, currency } = useExpenses(); 

    const [amount, setAmount] = useState('');
    const [selectedCategoryName, setSelectedCategoryName] = useState(null); 
    
    // Calculate budget status
    const { spentThisMonth, currentLimit } = useMemo(() => {
        const currentMonth = new Date().toISOString().substring(0, 7); 
        
        const currentCategory = categories.find(c => c.name === selectedCategoryName);
        const currentLimit = currentCategory ? currentCategory.limit : 0;
        
        const spent = expenses
            .filter(exp => exp.category === selectedCategoryName && exp.date.startsWith(currentMonth))
            .reduce((sum, exp) => sum + exp.amount, 0);

        return { spentThisMonth: spent, currentLimit };
    }, [expenses, selectedCategoryName, categories]);


    useEffect(() => {
        if (categories.length > 0 && selectedCategoryName === null) {
            setSelectedCategoryName(categories[0].name);
        }
    }, [categories]);

    const handleAddExpense = () => {
        const amountValue = parseFloat(amount.replace(',', '.')); 
        if (isNaN(amountValue) || amountValue <= 0 || !selectedCategoryName) {
            Alert.alert('Error', 'Please check the amount and category.');
            return;
        }

        addExpense(amountValue.toFixed(2), selectedCategoryName); 

        setAmount('');
        // ИСПОЛЬЗУЕМ currency В СООБЩЕНИИ
        Alert.alert('Success', `${amountValue.toFixed(2)} ${currency} added to "${selectedCategoryName}"`); 
    };

    if (categories.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Categories Found.</Text>
                <Text style={{color: '#BBBBBB', textAlign: 'center'}}>Please go to the "Categories" tab and create some.</Text>
                <TouchableOpacity
                    style={[styles.actionButton, { marginTop: 20 }]}
                    onPress={() => navigation.navigate('Categories')}
                >
                    <Text style={styles.actionButtonText}>Go to Categories</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.container}>
                
                {/* Amount Input Field */}
                <View style={styles.inputGroup}>
                    {/* ИСПОЛЬЗУЕМ currency В МЕТКЕ */}
                    <Text style={styles.label}>Amount ({currency})</Text> 
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor="#777"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>

                {/* Category Picker */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            style={styles.picker} 
                            selectedValue={selectedCategoryName}
                            onValueChange={(itemValue) => setSelectedCategoryName(itemValue)}
                            mode={Platform.OS === 'android' ? 'dropdown' : 'default'} 
                            dropdownIconColor="#FF702A"
                        >
                            {categories.map((cat, index) => (
                                <Picker.Item 
                                    label={cat.name} 
                                    value={cat.name} 
                                    key={cat.name} 
                                    color="#FFFFFF" 
                                    style={Platform.OS === 'android' ? {backgroundColor: '#2D2D2D', color: '#FFFFFF'} : {}}
                                />
                            ))}
                        </Picker>
                    </View>
                    
                    {/* BUDGET PROGRESS BAR */}
                    {currentLimit > 0 && (
                        <View style={styles.budgetCard}>
                            {/* ИСПОЛЬЗУЕМ currency В БЮДЖЕТЕ */}
                            <Text style={styles.budgetLabel}>Monthly Budget: {currentLimit.toFixed(2)} {currency}</Text>
                            <BudgetProgress 
                                spent={spentThisMonth} 
                                limit={currentLimit} 
                                currency={currency} // ПЕРЕДАЕМ currency В КОМПОНЕНТ
                            />
                        </View>
                    )}
                </View>
                
                {/* Submit Button (Custom TouchableOpacity) */}
                <TouchableOpacity
                    style={[styles.actionButton, { opacity: (!selectedCategoryName || amount.length === 0) ? 0.5 : 1 }]}
                    onPress={handleAddExpense} 
                    disabled={!selectedCategoryName || amount.length === 0}
                >
                    <Text style={styles.actionButtonText}>Record Expense</Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#121212',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#FFFFFF',
    },
    inputGroup: {
        marginBottom: 20,
        backgroundColor: '#1F1F1F', 
        borderRadius: 12, 
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 8, 
    },
    label: {
        fontSize: 14, 
        marginBottom: 5,
        fontWeight: '600',
        color: '#FF702A', // Orange Accent
    },
    input: {
        backgroundColor: '#2D2D2D', 
        borderWidth: 1,
        borderColor: '#444444',
        padding: 10,
        fontSize: 18,
        borderRadius: 8,
        color: '#FFFFFF',
    },
    pickerContainer: {
        backgroundColor: '#2D2D2D', 
        borderWidth: 1,
        borderColor: '#444444',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 15,
    },
    picker: {
        height: 50,
        color: '#FFFFFF', 
        backgroundColor: Platform.OS === 'android' ? '#2D2D2D' : 'transparent',
    },
    // --- BUDGET BAR STYLES ---
    budgetCard: {
        backgroundColor: '#121212',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#444444',
    },
    budgetLabel: {
        fontSize: 14,
        color: '#BBBBBB',
        marginBottom: 8,
        fontWeight: '500',
    },
    progressBarContainer: {
        width: '100%',
    },
    progressBarBase: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2D2D2D',
        overflow: 'hidden',
        marginBottom: 5,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    budgetSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    budgetSpent: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    budgetRemaining: {
        fontSize: 12,
        fontWeight: '500',
    },
    // --- CUSTOM BUTTON STYLES FOR HIGH CONTRAST ---
    actionButton: {
        backgroundColor: '#FF702A', // Orange Button
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#FF702A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 8,
    },
    actionButtonText: {
        color: '#121212', 
        fontSize: 18,
        fontWeight: 'bold',
    },
    // --- END CUSTOM BUTTON STYLES ---
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#121212',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#FFFFFF',
    }
});

export default AddExpenseScreen;