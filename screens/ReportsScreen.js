// --- ReportsScreen.js (Полная версия с тремя графиками) ---

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert, Dimensions } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { useExpenses } from '../context/ExpenseContext';
import { LineChart } from 'react-native-chart-kit'; 

// <-- ИМПОРТ НОВОГО КОМПОНЕНТА -->
import DailyBarChartModal from '../components/DailyBarChartModal'; 

// --- СТИЛИ ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', 
        paddingHorizontal: 10,
    },
    // SECTION STYLES (MONTH CARD)
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
        color: '#CF6679', 
        marginBottom: 10,
    },
    monthlyTrendBox: { 
        backgroundColor: '#1F1F1F', 
        width: 300, 
        height: 100, 
        borderRadius: 8,
        overflow: 'hidden', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendChartStyle: {
        borderRadius: 8,
    },
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
        paddingVertical: 8,
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
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2D2D2D',
        overflow: 'hidden',
        marginBottom: 5,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
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
    itemDate: {
        flex: 1.2,
        fontSize: 14,
        color: '#AAAAAA', 
        fontWeight: '500',
    },
    itemCategory: {
        flex: 2.5,
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF', 
    },
    itemAmount: {
        flex: 1.5,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
        color: '#CF6679', 
    },
    deleteButton: {
        paddingLeft: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    emptyText: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: '500',
        color: '#FFFFFF',
    }
});
// --- КОНЕЦ СТИЛЕЙ ---


// --- КОМПОНЕНТ: MonthlyTrendChart (Мини-график тренда) ---
const MonthlyTrendChart = ({ data }) => {
    // Требуется минимум 2 точки для отрисовки линии
    if (data.length < 2) {
        return <Text style={{ color: '#AAAAAA', fontSize: 10, textAlign: 'center', padding: 5 }}>2+ months needed</Text>;
    }

    const totals = data.map(d => d.total);
    const minTotal = Math.min(...totals); 
    
    // ДИНАМИЧЕСКИЙ РАСЧЕТ ОСИ Y ДЛЯ МАСШТАБИРОВАНИЯ
    let yAxisMin = 0; 
    if (minTotal > 0) {
        yAxisMin = Math.max(0, minTotal - 5); 
    }

    const chartData = {
        labels: data.map(d => d.month), 
        datasets: [
            {
                data: totals,
                color: (opacity = 1) => `rgba(255, 112, 42, ${opacity})`, 
                strokeWidth: 2
            }
        ]
    };
    
    const chartConfig = {
        backgroundColor: '#1F1F1F', 
        backgroundGradientFrom: 'rgba(0, 0, 0, 0)', // <-- СДЕЛАТЬ ПОЛНОСТЬЮ ПРОЗРАЧНЫМ
        backgroundGradientTo: 'rgba(0, 0, 0, 0)',
        decimalPlaces: 0, 
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 0) => `rgba(255, 255, 255, ${opacity})`, 
        yAxisMin: yAxisMin, 
        propsForDots: {
            r: "1", 
            strokeWidth: "1",
            stroke: "#FF702A"
        },
    };

    return (
        <LineChart
            data={chartData}
            width={300} 
            height={100} 
            chartConfig={chartConfig}
            bezier 
            withHorizontalLabels={false} 
            withVerticalLabels={false} 
            withInnerLines={false}
            withOuterLines={false}
            withShadow={false}
            style={styles.trendChartStyle} 
        />
    );
};
// --- КОНЕЦ MonthlyTrendChart ---


// --- КОМПОНЕНТ: BudgetProgress ---
const BudgetProgress = ({ spent, limit, currency, onPress }) => { 
    if (limit <= 0) return null; 

    const remaining = limit - spent;
    const percentage = (spent / limit) * 100;
    
    let barColor = '#91ff2aff'; 

    if (percentage > 75) barColor = '#FFC300';
    if (percentage > 100) barColor = '#CF6679';

    const barWidth = Math.min(percentage, 100); 

    return (
        <TouchableOpacity 
            onPress={onPress} 
            style={styles.progressBarContainer}
        >
            <View style={[styles.progressBarBase, {backgroundColor: remaining < 0 ? '#330000' : '#2D2D2D'}]}>
                <View style={[styles.progressBarFill, { width: `${barWidth}%`, backgroundColor: barColor }]} />
            </View>
            <View style={styles.budgetSummary}>
                <Text style={styles.budgetSpent}>Spent: {spent.toFixed(2)} {currency}</Text> 
                <Text style={[styles.budgetRemaining, { color: remaining < 0 ? '#CF6679' : '#BBBBBB' }]}>
                    Limit: {limit.toFixed(2)} {currency} 
                </Text>
            </View>
        </TouchableOpacity>
    );
};
// --- КОНЕЦ BudgetProgress ---


// --- HELPER ФУНКЦИИ ---

const getTitle = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1); 
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
};

const getMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1); 
    const options = { month: 'short' };
    return date.toLocaleDateString('en-US', options);
};

const groupExpenses = (expenses, categories) => {
    const groupedData = {};

    expenses.forEach(expense => {
        const [year, month] = expense.date.split('-'); 
        const monthKey = `${year}-${month}`; 

        if (!groupedData[monthKey]) {
            groupedData[monthKey] = {
                title: monthKey, 
                total: 0,
                data: [], 
                categories: {}, 
            };
        }

        groupedData[monthKey].total += expense.amount;
        groupedData[monthKey].data.push(expense);
        
        const categoryName = expense.category;
        if (!groupedData[monthKey].categories[categoryName]) {
            groupedData[monthKey].categories[categoryName] = 0;
        }
        groupedData[monthKey].categories[categoryName] += expense.amount;
    });

    return Object.values(groupedData).sort((a, b) => b.title.localeCompare(a.title));
};

// Функция: Группировка трат по дням для BarChart (по КОНКРЕТНОЙ КАТЕГОРИИ)
const prepareDailyData = (expenses, categoryName) => {
    if (!expenses || expenses.length === 0) return { labels: [], datasets: [{ data: [] }] };

    const dailyTotals = {};
    
    // 1. Сбор данных по дням
    expenses.forEach(exp => {
        if (exp.category === categoryName) {
            const day = exp.date.split('-')[2]; 
            dailyTotals[day] = (dailyTotals[day] || 0) + exp.amount;
        }
    });

    if (Object.keys(dailyTotals).length === 0) {
        return { labels: [], datasets: [{ data: [] }] };
    }

    // 2. Генерация всех дней месяца для правильной оси X
    const firstDayKey = expenses[0].date.substring(0, 7); 
    const [year, month] = firstDayKey.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const labels = [];
    const data = [];

    for (let i = 1; i <= daysInMonth; i++) {
        const dayKey = i.toString().padStart(2, '0');
        labels.push(dayKey);
        data.push(dailyTotals[dayKey] || 0);
    }

    return {
        labels: labels,
        datasets: [{
            data: data,
        }]
    };
};

// Функция: Группировка трат по дням для BarChart (ОБЩИЙ ТРЕНД ЗА МЕСЯЦ)
const prepareMonthlyTrendData = (monthExpenses, monthKey) => {
    if (!monthExpenses || monthExpenses.length === 0) return { labels: [], datasets: [{ data: [] }] };

    const dailyTotals = {};
    
    // 1. Сбор данных по дням для ВСЕХ категорий в месяце
    monthExpenses.forEach(exp => {
        const expenseMonthKey = exp.date.substring(0, 7);
        if (expenseMonthKey === monthKey) {
            const day = exp.date.split('-')[2]; 
            dailyTotals[day] = (dailyTotals[day] || 0) + exp.amount;
        }
    });

    if (Object.keys(dailyTotals).length === 0) {
        return { labels: [], datasets: [{ data: [] }] };
    }

    // 2. Генерация всех дней месяца для правильной оси X
    const [year, month] = monthKey.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const labels = [];
    const data = [];

    for (let i = 1; i <= daysInMonth; i++) {
        const dayKey = i.toString().padStart(2, '0');
        labels.push(dayKey);
        data.push(dailyTotals[dayKey] || 0);
    }

    return {
        labels: labels,
        datasets: [{
            data: data,
        }]
    };
};

// НОВАЯ ФУНКЦИЯ: Группировка трат по месяцам для BarChart (ГОДОВОЙ ТРЕНД)
const prepareYearlyTrendData = (sections) => {
    // Используем последние 12 месяцев
    const dataSlice = sections.slice(0, 12).reverse();
    
    const labels = dataSlice.map(d => getMonthName(d.title));
    const data = dataSlice.map(d => d.total);

    if (data.length === 0) {
        return { labels: [], datasets: [{ data: [] }] };
    }

    return {
        labels: labels,
        datasets: [{
            data: data,
        }]
    };
};
// --- КОНЕЦ HELPER ФУНКЦИЙ ---


const ReportsScreen = () => {
    const { expenses, deleteExpense, categories, currency } = useExpenses(); 
    
    // --- STATE для модального окна (ОБНОВЛЕН) ---
    const [modalVisible, setModalVisible] = useState(false);
    
    // 1. Данные для графика категории (Bar)
    const [categoryChartData, setCategoryChartData] = useState(null); 
    
    // 2. Данные для общего месячного тренда (Bar)
    const [monthlyTrendChartData, setMonthlyTrendChartData] = useState(null); 
    
    // 3. Данные для годового тренда (Line)
    const [yearlyTrendChartData, setYearlyTrendChartData] = useState(null);
    
    const [chartTitle, setChartTitle] = useState('');
    
    const sections = useMemo(() => groupExpenses(expenses, categories), [expenses, categories]);
    
    const categoryLimits = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.name] = cat.limit;
            return acc;
        }, {});
    }, [categories]);

    // Подготовка данных для мини-чарта тренда (последние 12 месяцев)
    const monthlyTrendData = useMemo(() => {
        return sections.slice(0, 12).map(section => ({
            month: getMonthName(section.title),
            total: section.total,
        })).reverse(); 
    }, [sections]);

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short' };
        return new Date(dateString).toLocaleDateString('en-US', options); 
    };
    
    const handleDelete = (id) => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to delete this expense?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteExpense(id) }
            ]
        );
    };

    // --- ОБРАБОТЧИК ДЛЯ ОТКРЫТИЯ МОДАЛЬНОГО ОКНА ---
    const handleBarPress = (monthKey, categoryName) => {
        
        const monthSection = sections.find(s => s.title === monthKey);
        if (!monthSection || monthSection.data.length === 0) return;

        // 1. Готовим данные для графика КАТЕГОРИИ
        const categoryData = prepareDailyData(monthSection.data, categoryName);

        // 2. Готовим данные для графика ОБЩЕГО ТРЕНДА ЗА МЕСЯЦ
        const trendData = prepareMonthlyTrendData(monthSection.data, monthKey); // Используем данные только текущего месяца
        
        // 3. Готовим данные для графика ГОДОВОГО ТРЕНДА
        const yearlyData = prepareYearlyTrendData(sections); 

        // 4. Устанавливаем стейты
        setCategoryChartData(categoryData);
        setMonthlyTrendChartData(trendData); 
        setYearlyTrendChartData(yearlyData);
        setChartTitle(`${categoryName}`);    
        setModalVisible(true);
    };
    // --------------------------------------------------------

    const renderItem = ({ item }) => (
        <View style={styles.expenseItem}>
            <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
            <Text style={styles.itemAmount}>{item.amount.toFixed(2)} {currency}</Text> 
            
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash-bin-outline" size={20} color="#CF6679" />
            </TouchableOpacity>
        </View>
    );

    // Component for the section header (Month and totals)
    const renderSectionHeader = ({ section: { title, total, categories: monthCategories } }) => {
        
        const monthTitle = getTitle(title);
        
        return (
            <View style={styles.headerContainer}>
                {/* Заголовок месяца + График тренда */}
                <View style={styles.headerTopRow}> 
                    <Text style={styles.headerTitle}>{monthTitle}</Text>
                    
                    {/* ТРЕНД ЗА ПОСЛЕДНИЕ 12 МЕСЯЦЕВ (показываем только для самой свежей секции) */}
                    {title === sections[0]?.title && (
                        <View style={styles.monthlyTrendBox}>
                            <MonthlyTrendChart data={monthlyTrendData} />
                        </View>
                    )}
                </View>

                <Text style={styles.headerTotal}>Total for Month: {total.toFixed(2)} {currency}</Text>
                
                <View style={styles.categoryTotals}>
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
                                    // Обеспечиваем возможность нажатия, даже если лимита нет
                                    <TouchableOpacity onPress={() => handleBarPress(title, catName)}>
                                        <Text style={styles.categoryNoLimitText}>Spent: {spent.toFixed(2)} {currency} (No limit)</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    if (expenses.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No expenses recorded yet.</Text>
                <Text style={{color: '#BBBBBB'}}>Go to the "Expense" tab to start tracking!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SectionList
                sections={sections}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item.id}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
            
            {/* --- ИСПОЛЬЗУЕМ ВЫНЕСЕННЫЙ КОМПОНЕНТ --- */}
            <DailyBarChartModal
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                // Передаем все три набора данных
                categoryData={categoryChartData}    
                monthlyTrendData={monthlyTrendChartData} 
                yearlyTrendData={yearlyTrendChartData}
                title={chartTitle}
                currency={currency}
            />
        </View>
    );
};

export default ReportsScreen;