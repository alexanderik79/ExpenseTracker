// --- DailyBarChartModal.js (ОБНОВЛЕН ДЛЯ ТРЕХ ГРАФИКОВ) ---
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { BarChart, LineChart } from 'react-native-chart-kit'; // Теперь импортируем LineChart

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
    // Модалка теперь должна быть способна прокручиваться, чтобы вместить 3 графика
    backgroundColor: '#1F1F1F',
    borderRadius: 15,
    padding: 15,
    paddingBottom: 25, 
  },
  // Общий заголовок модалки
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF702A',
    marginBottom: 20, // Увеличим отступ
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
    
  // Проверка на наличие данных категории (основной триггер модалки)
  if (!isVisible || !categoryData || !categoryData.datasets || categoryData.datasets[0].data.length === 0) {
    return null;
  }

  // --- ОБЩАЯ КОНФИГУРАЦИЯ ДЛЯ BAR CHART ---
  const barChartConfig = {
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
  };
  
  // --- ОБЩАЯ КОНФИГУРАЦИЯ ДЛЯ LINE CHART (для годового тренда) ---
  const lineChartConfig = {
    ...barChartConfig,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // Линия будет белой
    propsForDots: {
      r: "4", 
      strokeWidth: "2",
      stroke: "#FF702A" // Точки будут оранжевыми
    },
    // Переопределяем цвет линии для датасета
    datasetColors: [(opacity = 1) => `rgba(255, 112, 42, ${opacity})`],
  };
    
  // --- ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ ДЛЯ РЕНДЕРИНГА ГРАФИКА ---
  const renderChart = (data, chartTitleText, subtitleText, type = 'BarChart') => {
    if (!data || data.datasets[0].data.length === 0) return null;
    
    // Расчет требуемой ширины: 20 пикселей на столбец + 50 пикселей для оси Y
    // Используем меньшую ширину для годового тренда, чтобы он поместился (12 меток)
    const columnWidth = type === 'BarChart' ? 20 : 35; 
    const chartWidth = data.labels.length * columnWidth + 50; 
    const isScrollable = chartWidth > screenWidth * 0.85;

    const Component = type === 'LineChart' ? LineChart : BarChart;
    const config = type === 'LineChart' ? lineChartConfig : barChartConfig;

    return (
      <View style={{marginBottom: 25, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 15}}>
        <Text style={styles.chartTitle}>{chartTitleText}</Text>
        <Text style={styles.chartSubtitle}>{subtitleText}</Text>

        <ScrollView 
          horizontal={isScrollable} 
          showsHorizontalScrollIndicator={isScrollable}
          contentContainerStyle={{ paddingRight: isScrollable ? 20 : 0 }}
        >
          <Component
            data={data}
            width={isScrollable ? chartWidth : screenWidth * 0.85} 
            height={250} 
            yAxisLabel={currency}
            chartConfig={config}
            // Поворот меток только для дневных/месячных баров
            verticalLabelRotation={type === 'LineChart' ? 0 : -45} 
            bezier={type === 'LineChart'} // Сглаживание линии
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
            
          {/* 1. ГРАФИК ПО КОНКРЕТНОЙ КАТЕГОРИИ (Bar Chart) */}
          {renderChart(
            categoryData, 
            `Daily Trend for Category: "${title}"`,
          )}
            
          {/* 2. ГРАФИК ОБЩЕГО МЕСЯЧНОГО ТРЕНДА (Bar Chart) */}
          {monthlyTrendData && monthlyTrendData.datasets[0].data.length > 0 && 
            renderChart(
              monthlyTrendData, 
              `Overall Monthly Daily Trend`,
            )
          }

          {/* 3. ГРАФИК ГОДОВОГО ТРЕНДА (Line Chart) */}
          {yearlyTrendData && yearlyTrendData.datasets[0].data.length > 0 && 
            renderChart(
              yearlyTrendData, 
              `Yearly Spending Trend`,
            )
          }

          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle-outline" size={35} color="#CF6679" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};


export default DailyBarChartModal;