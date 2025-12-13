// --- DailyBarChartModal.js (Финальное исправление: принудительное добавление 0 в данные и пустой метки) ---
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { BarChart } from 'react-native-chart-kit'; 

const screenWidth = Dimensions.get('window').width;

// --- СТИЛИ ДЛЯ МОДАЛЬНОГО ОКНА ---
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
  // Общий заголовок модалки
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF702A',
    marginBottom: 20, 
    textAlign: 'center',
  },
  // Заголовки графиков
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
});

// --- КОМПОНЕНТ DailyBarChartModal (Отображает ТРИ графика) ---
const DailyBarChartModal = ({ isVisible, onClose, categoryData, monthlyTrendData, yearlyTrendData, title, currency }) => {
    
  if (!isVisible || !categoryData || !categoryData.datasets || categoryData.datasets[0].data.length === 0) {
    return null;
  }

  // --- БАЗОВАЯ КОНФИГУРАЦИЯ С fromZero: true ---
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
    yAxisMin: 0, 
    fromZero: true, 
  };
    
  // --- ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ ДЛЯ РЕНДЕРИНГА ГРАФИКА ---
  const renderChart = (data, chartTitleText, subtitleText, isYearly = false) => {
    if (!data || data.datasets[0].data.length === 0) return null;
    
    // --- ПРИНУДИТЕЛЬНЫЙ СТАРТ ОСИ Y С 0 ДЛЯ ГОДОВОГО ГРАФИКА ---
    let displayData = data;
    
    if (isYearly) {
        const originalData = data.datasets[0].data;
        
        // 1. Создаем модифицированный массив данных, добавляя 0
        const modifiedData = [...originalData, 0];
        
        // 2. Создаем модифицированный массив меток, добавляя пустую строку
        const modifiedLabels = [...data.labels, ""];

        displayData = {
            labels: modifiedLabels,
            datasets: [{
                data: modifiedData,
            }]
        };
        // Мы используем пустую метку "", чтобы не портить внешний вид графика, 
        // но при этом BarChart учитывает это нулевое значение для масштабирования оси Y.
    }
    // -------------------------------------------------------------------

    // Ширина графика рассчитывается на основе КОЛИЧЕСТВА МЕТОК в displayData.labels.
    const isYearlyTrend = displayData.labels.length > 12; // Теперь 12 месяцев + 1 пустая метка
    const columnWidth = isYearlyTrend ? 35 : 20; 
    
    // Учитываем, что меток стало на одну больше (если isYearly)
    const chartWidth = displayData.labels.length * columnWidth + 50; 
    const isScrollable = chartWidth > screenWidth * 0.85;

    return (
      <View style={{marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 15}}>
        <Text style={styles.chartTitle}>{chartTitleText}</Text>
        <Text style={styles.chartSubtitle}>{subtitleText}</Text>

        <ScrollView 
          horizontal={isScrollable} 
          showsHorizontalScrollIndicator={isScrollable}
          contentContainerStyle={{ paddingRight: isScrollable ? 20 : 0 }}
        >
          <BarChart
            data={displayData} 
            width={isScrollable ? chartWidth : screenWidth * 0.85} 
            height={250} 
            yAxisLabel={currency}
            chartConfig={chartConfig} 
            verticalLabelRotation={-45} 
            style={{
              marginVertical: 8,
              borderRadius: 16,
              paddingLeft: 10, 
            }}
          />
        </ScrollView>
        
        {isScrollable && (
          <Text style={{color: '#AAAAAA', fontSize: 12, textAlign: 'center', marginTop: 5}}>
            &lt; Swipe to view all data &gt;
          </Text>
        )}
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          
          {/* ОБЩИЙ ЗАГОЛОВОК МОДАЛКИ */}
          <Text style={styles.modalTitle}>Detail Report</Text>
            
          {/* 1. ГРАФИК ПО КОНКРЕТНОЙ КАТЕГОРИИ (Bar Chart) */}
          {renderChart(
            categoryData, 
            `Daily Trend for Category: "${title}"`,
            `Spending by day in ${currency}`
          )}
            
          {/* 2. ГРАФИК ОБЩЕГО МЕСЯЧНОГО ТРЕНДА (Bar Chart) */}
          {monthlyTrendData && monthlyTrendData.datasets[0].data.length > 0 && 
            renderChart(
              monthlyTrendData, 
              `Overall Monthly Daily Trend`,
              `Total spending by day in ${currency}`
            )
          }

          {/* 3. ГРАФИК ГОДОВОГО ТРЕНДА (Bar Chart) - isYearly=true для принудительного старта с 0 */}
          {yearlyTrendData && yearlyTrendData.datasets[0].data.length > 0 && 
            renderChart(
              yearlyTrendData, 
              `Yearly Spending Trend`,
              `Total spending over 12 months in ${currency}`,
              true // <-- Указываем, что это годовой график
            )
          }

          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle-outline" size={65} color="#CF6679" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};


export default DailyBarChartModal;