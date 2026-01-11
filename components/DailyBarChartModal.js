import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  ScrollView, 
  Animated 
} from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { BarChart } from 'react-native-chart-kit'; 

const screenWidth = Dimensions.get('window').width;

const DailyBarChartModal = ({ 
    isVisible, 
    onClose, 
    categoryData, 
    monthlyTrendData, 
    yearlyTrendData, 
    title, 
    currency 
}) => {
    
  // --- АНИМАЦИИ ---
  const modalScale = useRef(new Animated.Value(0.9)).current; 
  const chartSpring = useRef(new Animated.Value(100)).current; 
  const opacity = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        // Появление фона
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        // Пружинистый масштаб окна
        Animated.spring(modalScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        // Вылет контента снизу
        Animated.spring(chartSpring, { toValue: 0, friction: 7, tension: 35, delay: 150, useNativeDriver: true })
      ]).start();
    } else {
      // Сброс при закрытии
      modalScale.setValue(0.9);
      chartSpring.setValue(100);
      opacity.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  // Конфигурация графиков (фиксированные цвета для телефона)
  const chartConfig = {
    backgroundGradientFrom: '#1F1F1F',
    backgroundGradientTo: '#1F1F1F',
    decimalPlaces: 2, 
    color: (op = 1) => `rgba(255, 112, 42, ${op})`, // Оранжевый основной
    labelColor: (op = 1) => `rgba(255, 255, 255, ${op})`, // Белые подписи
    propsForLabels: { fontSize: 9 },
    propsForYLabels: { fontSize: 10 },
    barPercentage: 0.7, 
    fromZero: true, 
  };
    
  const renderBarChart = (data, chartTitleText, subtitleText, isYearly = false) => {
    if (!data || !data.datasets || data.datasets[0].data.length === 0) return null;
    
    let displayData = data;
    // Добавляем пустую колонку в конце для годового графика, чтобы последняя подпись не обрезалась
    if (isYearly) {
        displayData = {
            labels: [...data.labels, ""],
            datasets: [{ data: [...data.datasets[0].data, 0] }]
        };
    }

    const isLongData = displayData.labels.length > 12;
    const chartWidth = displayData.labels.length * (isLongData ? 35 : 30) + 60; 
    const isScrollable = chartWidth > screenWidth * 0.85;

    return (
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>{chartTitleText}</Text>
        <Text style={styles.chartSubtitle}>{subtitleText}</Text>

        <ScrollView horizontal={isScrollable} showsHorizontalScrollIndicator={false}>
          <BarChart
            data={displayData} 
            width={isScrollable ? chartWidth : screenWidth * 0.85} 
            height={220} 
            yAxisLabel="" // Убираем из оси, добавим в текст если нужно
            yAxisSuffix={` ${currency}`}
            chartConfig={chartConfig} 
            verticalLabelRotation={-45} 
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </ScrollView>
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <Modal transparent visible={isVisible} onRequestClose={onClose} animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity }]}>
        <Animated.View 
          style={[
            styles.modalContainer, 
            { transform: [{ scale: modalScale }] }
          ]}
        >
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.header}>
              <Ionicons name="analytics" size={28} color="#FF702A" />
              <Text style={styles.headerText}>Trend Analysis</Text>
            </View>

            <Animated.View style={{ transform: [{ translateY: chartSpring }] }}>
              
              {/* 1. График по конкретной категории (на которую нажали) */}
              {renderBarChart(
                categoryData, 
                `Category: ${title}`, 
                `Daily spending patterns this month`
              )}

              {/* 2. Общий тренд месяца (все категории вместе по дням) */}
              {renderBarChart(
                monthlyTrendData, 
                `Monthly Flow`, 
                `Total daily volume for all categories`
              )}

              {/* 3. Годовой график (сравнение месяцев) */}
              {renderBarChart(
                yearlyTrendData, 
                `12-Month History`, 
                `Comparison of total monthly spending`, 
                true
              )}

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close-circle-outline" size={60} color="#CF6679" />
                  <Text style={styles.closeBtnText}>BACK TO REPORTS</Text>
              </TouchableOpacity>

            </Animated.View>

          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth * 0.95,
    height: '90%',
    backgroundColor: '#1A1A1A',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF702A',
    marginLeft: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chartSection: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  chartSubtitle: {
    color: '#888', 
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
    width: '100%',
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  closeBtnText: {
    color: '#CF6679', 
    fontWeight: 'bold', 
    fontSize: 12, 
    marginTop: -5 
  }
});

export default DailyBarChartModal;