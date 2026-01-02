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
import { BarChart, PieChart } from 'react-native-chart-kit'; 

const screenWidth = Dimensions.get('window').width;

const DailyBarChartModal = ({ 
    isVisible, 
    onClose, 
    categoryData, 
    monthlyTrendData, 
    yearlyTrendData, 
    title, 
    currency,
    allCategories 
}) => {
    
  // --- НАСТРОЙКИ АНИМАЦИЙ ---
  const modalScale = useRef(new Animated.Value(0.9)).current; // Масштаб всей модалки
  const budgetBounce = useRef(new Animated.Value(-100)).current; // Позиция карточки бюджета
  const chartSpring = useRef(new Animated.Value(100)).current; // Позиция графиков
  const opacity = useRef(new Animated.Value(0)).current; // Прозрачность

  useEffect(() => {
    if (isVisible) {
      // Запуск каскада пружинных анимаций
      Animated.parallel([
        // 1. Появление фона и модалки
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(modalScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        
        // 2. Вылет карточки бюджета (сверху)
        Animated.spring(budgetBounce, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
        
        // 3. Вылет графиков (снизу) с задержкой
        Animated.spring(chartSpring, { toValue: 0, friction: 7, tension: 35, delay: 200, useNativeDriver: true })
      ]).start();
    } else {
      // Сброс значений при закрытии
      modalScale.setValue(0.9);
      budgetBounce.setValue(-100);
      chartSpring.setValue(100);
      opacity.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  // Расчет общей суммы лимитов
  const totalBudget = (allCategories || []).reduce((sum, cat) => sum + (Number(cat.limit) || 0), 0);

  const pieData = (allCategories || [])
    .filter(cat => cat.limit > 0)
    .map(cat => ({
      name: cat.name,
      limit: cat.limit,
      color: cat.color || '#FF702A',
      legendFontColor: '#BBBBBB',
      legendFontSize: 12,
    }));

  const chartConfig = {
    backgroundGradientFrom: '#1F1F1F',
    backgroundGradientTo: '#1F1F1F',
    decimalPlaces: 0, 
    color: (op = 1) => `rgba(255, 112, 42, ${op})`, 
    labelColor: (op = 1) => `rgba(255, 255, 255, ${op})`,
    propsForLabels: { fontSize: 8 },
    propsForYLabels: { fontSize: 10 },
    barPercentage: 0.8, 
    fromZero: true, 
  };
    
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
    const chartWidth = displayData.labels.length * (isLongData ? 35 : 25) + 60; 
    const isScrollable = chartWidth > screenWidth * 0.85;

    return (
      <View style={{ marginBottom: 25 }}>
        <Text style={styles.chartTitle}>{chartTitleText}</Text>
        <Text style={styles.chartSubtitle}>{subtitleText}</Text>

        <ScrollView horizontal={isScrollable} showsHorizontalScrollIndicator={false}>
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
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <Modal transparent visible={isVisible} onRequestClose={onClose}>
      <Animated.View style={[styles.modalOverlay, { opacity }]}>
        <Animated.View 
          style={[
            styles.modalContainer, 
            { transform: [{ scale: modalScale }] }
          ]}
        >
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            
            <Text style={styles.headerText}>Financial Insight</Text>

            {/* --- КАРТОЧКА БЮДЖЕТА С ПРУЖИНКОЙ --- */}
            <Animated.View style={[styles.totalBudgetCard, { transform: [{ translateY: budgetBounce }] }]}>
              <View>
                <Text style={styles.totalLabel}>Plan for Month</Text>
                <Text style={styles.totalAmount}>{totalBudget.toLocaleString()} {currency}</Text>
              </View>
              <Ionicons name="wallet-outline" size={32} color="#FF702A" />
            </Animated.View>

            <Animated.View style={{ transform: [{ translateY: chartSpring }] }}>
              <Text style={styles.chartTitle}>Limit Distribution</Text>
              
              {pieData.length > 0 ? (
                <PieChart
                  data={pieData}
                  width={screenWidth * 0.9}
                  height={180}
                  chartConfig={chartConfig}
                  accessor={"limit"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  center={[0, 0]}
                  absolute 
                />
              ) : (
                <Text style={styles.noDataText}>Set category limits in Edit menu</Text>
              )}

              <View style={styles.divider} />

              {/* ГРАФИКИ ТРЕНДОВ */}
              {renderBarChart(categoryData, `Category: ${title}`, `Daily Spending`)}
              {renderBarChart(monthlyTrendData, `Overall Monthly`, `Daily Total`)}
              {renderBarChart(yearlyTrendData, `12-Month History`, `Monthly Trend`, true)}

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close-circle-outline" size={60} color="#CF6679" />
                  <Text style={{color: '#CF6679', fontWeight: 'bold'}}>CLOSE</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
  headerText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF702A',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  totalBudgetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#FF702A',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  totalLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  totalAmount: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  chartSubtitle: {
    color: '#666', 
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 25,
  },
  noDataText: {
    color: '#444',
    textAlign: 'center',
    marginVertical: 20,
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: 20,
  }
});

export default DailyBarChartModal;