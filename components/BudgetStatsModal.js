import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ScrollView, Animated } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { PieChart } from 'react-native-chart-kit'; 

const screenWidth = Dimensions.get('window').width;

const FIXED_COLORS = [
  '#FF702A', '#3357FF', '#2ECC71', '#F1C40F', 
  '#E74C3C', '#9B59B6', '#1ABC9C', '#34495E',
  '#E67E22', '#D35400', '#27AE60', '#2980B9'
];

const BudgetStatsModal = ({ isVisible, onClose, allCategories, currency }) => {
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(modalScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const validCategories = (allCategories || []).filter(cat => Number(cat.limit) > 0);
  const totalBudget = validCategories.reduce((sum, cat) => sum + Number(cat.limit), 0);

  const pieData = validCategories.map((cat, index) => ({
    name: cat.name,
    limit: Number(cat.limit),
    color: FIXED_COLORS[index % FIXED_COLORS.length],
    legendFontColor: 'transparent', 
    legendFontSize: 0,
  }));

  return (
    <Modal transparent visible={isVisible} onRequestClose={onClose} animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity }]}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: modalScale }] }]}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            
            <Text style={styles.headerText}>Budget Overview</Text>

            <View style={styles.totalBudgetCard}>
              <View>
                <Text style={styles.totalLabel}>Total Monthly Limit</Text>
                <Text style={styles.totalAmount}>{totalBudget.toFixed(2)} {currency}</Text>
              </View>
              <Ionicons name="wallet-outline" size={32} color="#FF702A" />
            </View>


            
            {pieData.length > 0 ? (
              <View style={styles.chartWrapper}>
                {/* ЦЕНТРИРОВАННЫЙ ПИРОГ */}
                <View style={styles.pieBox}>
                  <PieChart
                    data={pieData}
                    // Даем полную ширину контейнера
                    width={screenWidth * 0.9} 
                    height={280}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    }}
                    accessor={"limit"}
                    backgroundColor={"transparent"}
                    // paddingLeft={(Ширина / 4) выставляет круг по центру, 
                    // компенсируя отсутствие легенды
                    paddingLeft={(screenWidth * 0.9) / 4} 
                    center={[0, 0]} 
                    hasLegend={false}
                    absolute
                  />
                </View>

                {/* ЛЕГЕНДА */}
                <View style={styles.customLegend}>
                  {pieData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                       <View style={styles.legendLeft}>
                        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                        <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
                      </View>
                      <Text style={styles.legendValue}>
                        {item.limit.toFixed(0)} {currency}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>No limits set.</Text>
            )}

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close-circle-outline" size={60} color="#CF6679" />
            </TouchableOpacity>

          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: screenWidth * 0.95, maxHeight: '88%', backgroundColor: '#1A1A1A', borderRadius: 30, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  modalContent: { padding: 15 },
  headerText: { fontSize: 20, fontWeight: '900', color: '#FF702A', marginVertical: 15, textTransform: 'uppercase', textAlign: 'center' },
  totalBudgetCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#252525', borderRadius: 20, padding: 20, width: '100%', marginBottom: 15 },
  totalLabel: { color: '#888', fontSize: 12 },
  totalAmount: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 5, textAlign: 'center' },
  
  chartWrapper: { width: '100%', alignItems: 'center' },
  // Обертка для самого графика
  pieBox: { width: '100%', height: 220, justifyContent: 'center', alignItems: 'center' },
  
  customLegend: { width: '100%', marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, backgroundColor: '#222', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  legendLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  legendName: { color: '#CCC', fontSize: 13, marginRight: 10 },
  legendValue: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  noDataText: { color: '#444', textAlign: 'center', marginVertical: 40 },
  closeBtn: { marginVertical: 20, alignItems: 'center' }
});

export default BudgetStatsModal;