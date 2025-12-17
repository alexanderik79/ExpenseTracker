// --- DailyBarChartModal.js ---
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { BarChart, PieChart } from 'react-native-chart-kit'; 

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: screenWidth * 0.95,
    backgroundColor: '#1F1F1F',
    borderRadius: 15,
    padding: 15,
    paddingBottom: 45, 
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF702A',
    marginBottom: 20, 
    textAlign: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF702A',
    marginBottom: 5,
    textAlign: 'center',
  },
  chartSubtitle: {
    color: '#BBBBBB', 
    marginBottom: 10, 
    textAlign: 'center'
  },
  closeButtonContainer: { 
    alignItems: 'center', 
    marginTop: 25, 
  },
  closeButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#333333', 
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
    width: '100%'
  }
});

const DailyBarChartModal = ({ 
    isVisible, 
    onClose, 
    categoryData, 
    monthlyTrendData, 
    yearlyTrendData, 
    title, 
    currency,
    allCategories // <-- Добавьте этот пропс при вызове в ReportsScreen
}) => {
    
  if (!isVisible) return null;

  // --- 1. ПОДГОТОВКА ДАННЫХ ДЛЯ PIE CHART (Лимиты) ---
  const pieData = (allCategories || [])
    .filter(cat => cat.limit > 0)
    .map(cat => ({
      name: cat.name,
      limit: cat.limit,
      color: cat.color || '#FF702A',
      legendFontColor: '#BBBBBB',
      legendFontSize: 12,
    }));

  // --- БАЗОВАЯ КОНФИГУРАЦИЯ ДЛЯ ГРАФИКОВ ---
  const chartConfig = {
    backgroundGradientFrom: '#1F1F1F',
    backgroundGradientTo: '#1F1F1F',
    decimalPlaces: 0, 
    color: (opacity = 1) => `rgba(255, 112, 42, ${opacity})`, 
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForLabels: { fontSize: 8 },
    propsForYLabels: { fontSize: 10 },
    style: { borderRadius: 16 },
    barPercentage: 0.8, 
    fromZero: true, 
  };
    
  // --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ РЕНДЕРИНГА BAR CHART ---
  const renderBarChart = (data, chartTitleText, subtitleText, isYearly = false) => {
    if (!data || !data.datasets || data.datasets[0].data.length === 0) return null;
    
    let displayData = data;
    if (isYearly) {
        displayData = {
            labels: [...data.labels, ""],
            datasets: [{ data: [...data.datasets[0].data, 0] }]
        };
    }

    const isLongData = displayData.labels.length > 12;
    const columnWidth = isLongData ? 35 : 25; 
    const chartWidth = displayData.labels.length * columnWidth + 60; 
    const isScrollable = chartWidth > screenWidth * 0.85;

    return (
      <View style={{ marginBottom: 25 }}>
        <Text style={styles.chartTitle}>{chartTitleText}</Text>
        <Text style={styles.chartSubtitle}>{subtitleText}</Text>

        <ScrollView 
          horizontal={isScrollable} 
          showsHorizontalScrollIndicator={isScrollable}
        >
          <BarChart
            data={displayData} 
            width={isScrollable ? chartWidth : screenWidth * 0.85} 
            height={220} 
            yAxisLabel={currency}
            chartConfig={chartConfig} 
            verticalLabelRotation={-45} 
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </ScrollView>
        {isScrollable && (
          <Text style={{color: '#777', fontSize: 10, textAlign: 'center'}}>&lt; Swipe to scroll &gt;</Text>
        )}
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={{ flex: 1, width: '100%' }}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              
              <Text style={styles.modalTitle}>Financial Analysis</Text>

              {/* --- КРУГОВАЯ ДИАГРАММА ЛИМИТОВ --- */}
              <Text style={styles.chartTitle}>Budget Structure</Text>
              <Text style={styles.chartSubtitle}>Limit allocation by categories ({currency})</Text>
              
              {pieData.length > 0 ? (
                <PieChart
                  data={pieData}
                  width={screenWidth * 0.9}
                  height={200}
                  chartConfig={chartConfig}
                  accessor={"limit"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  center={[10, 0]}
                  absolute // Показывать числа, а не проценты
                />
              ) : (
                <Text style={{ color: '#777', textAlign: 'center', marginVertical: 20 }}>No limits set for categories.</Text>
              )}

              <View style={styles.divider} />

              {/* --- СТОЛБЧАТЫЕ ГРАФИКИ --- */}
              {renderBarChart(
                categoryData, 
                `Daily Trend: ${title}`,
                `Spending by day in ${currency}`
              )}
                
              {renderBarChart(
                monthlyTrendData, 
                `Total Monthly Trend`,
                `All categories combined by day`
              )}

              {renderBarChart(
                yearlyTrendData, 
                `12-Month Spending History`,
                `Total per month`,
                true
              )}

              <TouchableOpacity onPress={onClose} style={styles.closeButtonContainer}>
                <View style={styles.closeButton}>
                  <Ionicons name="close-circle-outline" size={60} color="#CF6679" />
                </View>
              </TouchableOpacity>

            </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default DailyBarChartModal;