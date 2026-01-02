// --- ReportsScreen.js ---
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { useExpenses } from '../context/ExpenseContext';
import DailyBarChartModal from '../components/DailyBarChartModal'; 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', 
        paddingHorizontal: 10,
    },
    headerContainer: {
        backgroundColor: '#1F1F1F', 
        padding: 20, 
        marginHorizontal: 5,
        marginTop: 15,
        borderRadius: 15, 
        shadowColor: '#FF702A', 
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10, 
        marginBottom: 10,
    },
    headerTopRow: { 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 22, 
        fontWeight: 'bold',
        color: '#FF702A', 
    },
    headerTotal: {
        fontSize: 18, 
        fontWeight: '700', 
        color: '#FFFFFF', 
        marginBottom: 5,
    },
    // Стили для прогресс-бара
    categoryTotals: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#2D2D2D', 
    },
    categoryTotalsLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#AAAAAA',
        marginBottom: 5,
    },
    categoryProgressRow: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2D2D2D',
    },
    categoryProgressLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    categoryNoLimitText: {
        fontSize: 14,
        color: '#BBBBBB',
    },
    progressBarContainer: {
        width: '100%',
        marginTop: 5,
    },
    progressBarBase: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2D2D2D',
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    budgetSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap', // На случай длинных валют
    },
    budgetSpent: {
        fontSize: 11,
        color: '#BBBBBB',
        fontWeight: '500',
    },
    budgetRemaining: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    budgetLimit: {
        fontSize: 11,
        color: '#BBBBBB',
        fontWeight: '500',
    },
    // Стили элементов списка
    expenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15, 
        borderBottomWidth: 1,
        borderBottomColor: '#2D2D2D', 
        backgroundColor: '#1F1F1F', 
        marginHorizontal: 5,
    },
    itemDate: { flex: 1.2, fontSize: 14, color: '#AAAAAA' },
    itemCategory: { flex: 2.5, fontSize: 16, color: '#FFFFFF' },
    itemAmount: { flex: 1.5, fontSize: 16, fontWeight: 'bold', textAlign: 'right', color: '#CF6679' },
    deleteButton: { paddingLeft: 10 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    emptyText: { fontSize: 18, color: '#FFFFFF', marginBottom: 10 }
});

// --- ОБНОВЛЕННЫЙ КОМПОНЕНТ: BudgetProgress ---
const BudgetProgress = ({ spent, limit, currency, onPress, isMainBar = false }) => { 
    if (limit <= 0) return null; 

    const remaining = limit - spent;
    const percentage = (spent / limit) * 100;
    
    // Цвет бара
    let barColor = '#91ff2aff'; // Зеленый
    if (percentage > 75) barColor = '#FFC300'; // Желтый
    if (percentage > 100) barColor = '#CF6679'; // Красный

    // Цвет текста для Remaining
    const remainingColor = remaining < 0 ? '#CF6679' : '#91ff2aff';

    const barWidth = Math.min(percentage, 100); 

    return (
        <TouchableOpacity 
            onPress={onPress} 
            disabled={!onPress}
            style={[styles.progressBarContainer, isMainBar && { marginBottom: 15 }]}
        >
            <View style={[styles.progressBarBase, { height: isMainBar ? 14 : 10, backgroundColor: remaining < 0 ? '#441111' : '#2D2D2D' }]}>
                <View style={[styles.progressBarFill, { width: `${barWidth}%`, backgroundColor: barColor }]} />
            </View>
            
            <View style={styles.budgetSummary}>
                <Text style={styles.budgetSpent}>Spent: {spent.toFixed(0)} {currency}</Text>
                
                <Text style={[styles.budgetRemaining, { color: remainingColor }]}>
                    {remaining >= 0 ? 'Remaining: ' : 'Over: '} 
                    {Math.abs(remaining).toFixed(0)} {currency}
                </Text>

                <Text style={styles.budgetLimit}>Limit: {limit.toFixed(0)} {currency}</Text>
            </View>
        </TouchableOpacity>
    );
};

// --- HELPER FUNCTIONS (остаются без изменений) ---
const getTitle = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1); 
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

const getMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1); 
    return date.toLocaleDateString('en-US', { month: 'short' });
};

const groupExpenses = (expenses) => {
    const groupedData = {};
    expenses.forEach(expense => {
        const monthKey = expense.date.substring(0, 7); 
        if (!groupedData[monthKey]) {
            groupedData[monthKey] = { title: monthKey, total: 0, data: [], categories: {} };
        }
        groupedData[monthKey].total += expense.amount;
        groupedData[monthKey].data.push(expense);
        groupedData[monthKey].categories[expense.category] = (groupedData[monthKey].categories[expense.category] || 0) + expense.amount;
    });
    return Object.values(groupedData).sort((a, b) => b.title.localeCompare(a.title));
};

const prepareDailyData = (expenses, categoryName) => {
    const dailyTotals = {};
    expenses.forEach(exp => {
        if (exp.category === categoryName) {
            const day = exp.date.split('-')[2]; 
            dailyTotals[day] = (dailyTotals[day] || 0) + exp.amount;
        }
    });
    const [year, month] = expenses[0].date.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    const labels = []; const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
        const dayKey = i.toString().padStart(2, '0');
        labels.push(dayKey); data.push(dailyTotals[dayKey] || 0);
    }
    return { labels, datasets: [{ data }] };
};

const prepareMonthlyTrendData = (monthExpenses, monthKey) => {
    const dailyTotals = {};
    monthExpenses.forEach(exp => {
        const day = exp.date.split('-')[2]; 
        dailyTotals[day] = (dailyTotals[day] || 0) + exp.amount;
    });
    const [year, month] = monthKey.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    const labels = []; const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
        const dayKey = i.toString().padStart(2, '0');
        labels.push(dayKey); data.push(dailyTotals[dayKey] || 0);
    }
    return { labels, datasets: [{ data }] };
};

const prepareYearlyTrendData = (sections) => {
    const dataSlice = sections.slice(0, 12).reverse();
    return {
        labels: dataSlice.map(d => getMonthName(d.title)),
        datasets: [{ data: dataSlice.map(d => d.total) }]
    };
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---
const ReportsScreen = () => {
    const { expenses, deleteExpense, categories, currency } = useExpenses(); 
    const [modalVisible, setModalVisible] = useState(false);
    const [categoryChartData, setCategoryChartData] = useState(null); 
    const [monthlyTrendChartData, setMonthlyTrendChartData] = useState(null); 
    const [yearlyTrendChartData, setYearlyTrendChartData] = useState(null);
    const [chartTitle, setChartTitle] = useState('');
    
    const sections = useMemo(() => groupExpenses(expenses), [expenses]);
    
    const categoryLimits = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.name] = cat.limit;
            return acc;
        }, {});
    }, [categories]);

    // Общий лимит для всего месяца (сумма всех лимитов категорий)
    const totalMonthlyLimit = useMemo(() => {
        return categories.reduce((sum, cat) => sum + (Number(cat.limit) || 0), 0);
    }, [categories]);

    const handleBarPress = (monthKey, categoryName) => {
        const monthSection = sections.find(s => s.title === monthKey);
        if (!monthSection) return;

        setCategoryChartData(prepareDailyData(monthSection.data, categoryName));
        setMonthlyTrendChartData(prepareMonthlyTrendData(monthSection.data, monthKey)); 
        setYearlyTrendChartData(prepareYearlyTrendData(sections));
        setChartTitle(categoryName); setModalVisible(true);
    };

    const renderItem = ({ item }) => (
        <View style={styles.expenseItem}>
            <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString('en-US', {day: 'numeric', month: 'short'})}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
            <Text style={styles.itemAmount}>{item.amount.toFixed(0)} {currency}</Text> 
            <TouchableOpacity onPress={() => deleteExpense(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash-bin-outline" size={18} color="#CF6679" />
            </TouchableOpacity>
        </View>
    );

    const renderSectionHeader = ({ section: { title, total, categories: monthCategories } }) => (
        <View style={styles.headerContainer}>
            <View style={styles.headerTopRow}> 
                <Text style={styles.headerTitle}>{getTitle(title)}</Text>
            </View>

            <Text style={styles.headerTotal}>Total Spent: {total.toFixed(0)} {currency}</Text>
            
            {/* ГЛАВНЫЙ БАР МЕСЯЦА */}
            <BudgetProgress 
                spent={total} 
                limit={totalMonthlyLimit} 
                currency={currency} 
                isMainBar={true}
            />

            <View style={styles.categoryTotals}>
                <Text style={styles.categoryTotalsLabel}>Category Breakdown:</Text>
                {Object.keys(monthCategories).map(catName => {
                    const spent = monthCategories[catName];
                    const limit = categoryLimits[catName] || 0; 
                    return (
                        <View key={catName} style={styles.categoryProgressRow}>
                            <Text style={styles.categoryProgressLabel}>{catName}</Text>
                            {limit > 0 ? (
                                <BudgetProgress 
                                    spent={spent} 
                                    limit={limit} 
                                    currency={currency} 
                                    onPress={() => handleBarPress(title, catName)} 
                                />
                            ) : (
                                <TouchableOpacity onPress={() => handleBarPress(title, catName)}>
                                    <Text style={styles.categoryNoLimitText}>Spent: {spent.toFixed(0)} {currency} (No limit)</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <SectionList
                sections={sections}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item.id}
                stickySectionHeadersEnabled={false}
            />
            <DailyBarChartModal
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                categoryData={categoryChartData}    
                monthlyTrendData={monthlyTrendChartData} 
                yearlyTrendData={yearlyTrendChartData}
                title={chartTitle}
                currency={currency}
                allCategories={categories} 
            />
        </View>
    );
};

export default ReportsScreen;