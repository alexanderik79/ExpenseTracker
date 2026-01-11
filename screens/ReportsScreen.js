import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { useExpenses } from '../context/ExpenseContext';

import DailyBarChartModal from '../components/DailyBarChartModal'; 
import BudgetStatsModal from '../components/BudgetStatsModal'; 

// --- Вспомогательный компонент прогресс-бара (Вынесен вверх для стабильности) ---
const BudgetProgress = ({ spent, limit, currency, onPress, isMainBar = false }) => { 
    if (!limit || limit <= 0) return null; 
    
    const spentNum = Number(spent) || 0;
    const limitNum = Number(limit) || 0;
    const remaining = limitNum - spentNum;
    const percentage = (spentNum / limitNum) * 100;
    const barWidth = Math.min(percentage, 100); 

    let barColor = '#91ff2aff'; 
    if (percentage > 75) barColor = '#FFC300';
    if (percentage > 100) barColor = '#CF6679';

    return (
        <TouchableOpacity onPress={onPress} style={[styles.progressContainer, isMainBar && { marginBottom: 10 }]}>
            <View style={[styles.progressBase, isMainBar && { height: 12 }]}>
                {/* Использован обычный View вместо Animated.View во избежание краша */}
                <View style={[styles.progressFill, { width: `${barWidth}%`, backgroundColor: barColor }]} />
            </View>
            <View style={styles.progressLabels}>
                <Text style={styles.progressSubText}>Spent: {spentNum.toFixed(2)}</Text>
                <Text style={[styles.progressRemaining, { color: remaining < 0 ? '#CF6679' : '#91ff2aff' }]}>
                    {remaining < 0 ? 'Over: ' : 'Rem: '}{Math.abs(remaining).toFixed(2)}
                </Text>
                <Text style={styles.progressSubText}>Limit: {limitNum.toFixed(2)} {currency}</Text>
            </View>
        </TouchableOpacity>
    );
};

const ReportsScreen = () => {
    const { expenses = [], deleteExpense, categories = [], currency } = useExpenses(); 
    
    const [trendModalVisible, setTrendModalVisible] = useState(false);
    const [statsModalVisible, setStatsModalVisible] = useState(false);
    
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

    const totalMonthlyLimit = useMemo(() => {
        return categories.reduce((sum, cat) => sum + (Number(cat.limit) || 0), 0);
    }, [categories]);

    const handleCategoryPress = (monthKey, categoryName) => {
        const monthSection = sections.find(s => s.title === monthKey);
        if (!monthSection) return;

        setCategoryChartData(prepareDailyData(monthSection.data, categoryName));
        setMonthlyTrendChartData(prepareMonthlyTrendData(monthSection.data, monthKey)); 
        setYearlyTrendChartData(prepareYearlyTrendData(sections));
        setChartTitle(categoryName);
        setTrendModalVisible(true);
    };

    const handleMainBarPress = () => setStatsModalVisible(true);

    const handleDelete = (id) => {
        Alert.alert("Delete", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteExpense(id) }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.expenseItem}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString('en-US', {day: 'numeric', month: 'short'})}</Text>
            </View>
            <Text style={styles.itemAmount}>{Number(item.amount).toFixed(2)} {currency}</Text> 
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color="#CF6679" />
            </TouchableOpacity>
        </View>
    );

    const renderSectionHeader = ({ section: { title, total, categories: monthCategories } }) => (
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>{getTitle(title)}</Text>
            <Text style={styles.headerTotal}>Total: {total.toFixed(2)} {currency}</Text>
            
            <BudgetProgress 
                spent={total} 
                limit={totalMonthlyLimit} 
                currency={currency} 
                onPress={handleMainBarPress}
                isMainBar={true}
            />

            <View style={styles.categoryTotals}>
                {Object.keys(monthCategories).map(catName => {
                    const spent = monthCategories[catName];
                    const limit = categoryLimits[catName] || 0; 
                    return (
                        <View key={catName} style={styles.categoryProgressRow}>
                            <Text style={styles.categoryLabel}>{catName}</Text>
                            {limit > 0 ? (
                                <BudgetProgress 
                                    spent={spent} 
                                    limit={limit} 
                                    currency={currency} 
                                    onPress={() => handleCategoryPress(title, catName)} 
                                />
                            ) : (
                                <TouchableOpacity onPress={() => handleCategoryPress(title, catName)}>
                                    <Text style={styles.noLimitText}>Spent: {spent.toFixed(2)} {currency}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );

    if (!expenses || expenses.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={64} color="#333" />
                <Text style={styles.emptyText}>No expenses yet</Text>
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
            />
            
            <DailyBarChartModal
                isVisible={trendModalVisible}
                onClose={() => setTrendModalVisible(false)}
                categoryData={categoryChartData}    
                monthlyTrendData={monthlyTrendChartData} 
                yearlyTrendData={yearlyTrendChartData}
                title={chartTitle}
                currency={currency}
            />

            <BudgetStatsModal 
                isVisible={statsModalVisible}
                onClose={() => setStatsModalVisible(false)}
                allCategories={categories}
                currency={currency}
            />
        </View>
    );
};

// --- Вспомогательные функции ---
const groupExpenses = (expenses) => {
    const grouped = {};
    expenses.forEach(exp => {
        const key = exp.date.substring(0, 7);
        if (!grouped[key]) grouped[key] = { title: key, total: 0, data: [], categories: {} };
        grouped[key].total += exp.amount;
        grouped[key].data.push(exp);
        grouped[key].categories[exp.category] = (grouped[key].categories[exp.category] || 0) + exp.amount;
    });
    return Object.values(grouped).sort((a, b) => b.title.localeCompare(a.title));
};

const getTitle = (key) => {
    const [y, m] = key.split('-');
    return new Date(y, m - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

const prepareDailyData = (expenses, categoryName) => {
    const daily = {};
    expenses.filter(e => e.category === categoryName).forEach(e => {
        const d = e.date.split('-')[2];
        daily[d] = (daily[d] || 0) + e.amount;
    });
    const labels = Array.from({length: 31}, (_, i) => (i+1).toString().padStart(2, '0'));
    return { labels, datasets: [{ data: labels.map(l => daily[l] || 0) }] };
};

const prepareMonthlyTrendData = (expenses, key) => {
    const daily = {};
    expenses.forEach(e => {
        const d = e.date.split('-')[2];
        daily[d] = (daily[d] || 0) + e.amount;
    });
    const labels = Array.from({length: 31}, (_, i) => (i+1).toString().padStart(2, '0'));
    return { labels, datasets: [{ data: labels.map(l => daily[l] || 0) }] };
};

const prepareYearlyTrendData = (sections) => {
    const slice = sections.slice(0, 12).reverse();
    return {
        labels: slice.map(s => new Date(s.title + '-01').toLocaleDateString('en-US', {month: 'short'})),
        datasets: [{ data: slice.map(s => s.total) }]
    };
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    headerContainer: { backgroundColor: '#1F1F1F', padding: 20, margin: 10, borderRadius: 20 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FF702A' },
    headerTotal: { fontSize: 16, color: '#FFF', marginVertical: 10 },
    categoryTotals: { borderTopWidth: 1, borderTopColor: '#333', marginTop: 10, paddingTop: 10 },
    categoryProgressRow: { marginBottom: 15 },
    categoryLabel: { color: '#FFF', fontSize: 16, marginBottom: 5 },
    noLimitText: { color: '#888', fontSize: 14 },
    progressContainer: { width: '100%' },
    progressBase: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    progressSubText: { fontSize: 10, color: '#888' },
    progressRemaining: { fontSize: 11, fontWeight: 'bold' },
    expenseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1F1F1F', padding: 15, marginHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#2D2D2D' },
    itemCategory: { color: '#FFF', fontSize: 16 },
    itemDate: { color: '#666', fontSize: 12 },
    itemAmount: { color: '#CF6679', fontWeight: 'bold' },
    deleteButton: { padding: 5 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#666', marginTop: 10, fontSize: 18 }
});

export default ReportsScreen;