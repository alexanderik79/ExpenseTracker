import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ScrollView, Animated } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { PieChart } from 'react-native-chart-kit'; 

const screenWidth = Dimensions.get('window').width;

const BudgetStatsModal = ({ isVisible, onClose, allCategories, currency }) => {
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(modalScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    } else {
      modalScale.setValue(0.9);
      opacity.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const totalBudget = (allCategories || []).reduce((sum, cat) => sum + (Number(cat.limit) || 0), 0);

  const pieData = (allCategories || [])
    .filter(cat => cat.limit > 0)
    .map(cat => ({
      name: cat.name,
      limit: Number(cat.limit),
      color: cat.color || '#FF702A',
      legendFontColor: '#BBBBBB',
      legendFontSize: 12,
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
              {/* ВОЗВРАЩЕНА ИКОНКА КОШЕЛЬКА */}
              <Ionicons name="wallet-outline" size={32} color="#FF702A" />
            </View>

            <Text style={styles.chartTitle}>Limit Allocation</Text>
            
            {pieData.length > 0 ? (
              <View style={styles.pieContainer}>
                <PieChart
                  data={pieData}
                  width={screenWidth * 0.85}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  }}
                  accessor={"limit"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  center={[10, 0]}
                  absolute 
                />
              </View>
            ) : (
              <Text style={styles.noDataText}>No limits set for categories.</Text>
            )}

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close-circle-outline" size={60} color="#CF6679" />
                <Text style={{color: '#CF6679', fontWeight: 'bold', marginTop: -5}}>CLOSE</Text>
            </TouchableOpacity>

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
    alignItems: 'center' 
  },
  modalContainer: { 
    width: screenWidth * 0.9, 
    maxHeight: '80%', 
    backgroundColor: '#1A1A1A', 
    borderRadius: 30, 
    borderWidth: 1, 
    borderColor: '#333',
    overflow: 'hidden'
  },
  modalContent: { 
    padding: 20, 
    alignItems: 'center' 
  },
  headerText: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: '#FF702A', 
    marginBottom: 20, 
    textTransform: 'uppercase' 
  },
  totalBudgetCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#252525', 
    borderRadius: 20, 
    padding: 20, 
    width: '100%', 
    marginBottom: 20 
  },
  totalLabel: { color: '#888', fontSize: 12 },
  totalAmount: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  pieContainer: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  noDataText: { color: '#444', marginVertical: 40 },
  closeBtn: { marginTop: 10, alignItems: 'center', paddingBottom: 10 }
});

export default BudgetStatsModal;