import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { supabase } from '../lib/supabase';
import { safeQuery } from '../lib/safeSupabase';
import { useAuth } from '../contexts/AuthContext';

const screenWidth = Dimensions.get('window').width;

export function ProgressScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [workouts, setWorkouts] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);

  // Computed analytics
  const [weeklyCounts, setWeeklyCounts] = useState<number[]>([]);
  const [monthlyCounts, setMonthlyCounts] = useState<number[]>([]);
  const [bodyPartDistribution, setBodyPartDistribution] = useState<any[]>([]);
  const [volumeOverTime, setVolumeOverTime] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch workouts safely
      const workoutsData = await safeQuery(
        supabase
          .from('workouts')
          .select('id, date, body_parts')
          .eq('user_id', user.id)
          .order('date', { ascending: true })
      );

      setWorkouts(workoutsData || []);

      // Fetch exercises safely
      const workoutIds = (workoutsData || []).map((w) => w.id);

      const exercisesData = await safeQuery(
        supabase
          .from('workout_exercises')
          .select('*')
          .in('workout_id', workoutIds)
      );

      setExercises(exercisesData || []);

      computeAnalytics(workoutsData || [], exercisesData || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const computeAnalytics = (workouts: any[], exercises: any[]) => {
    computeWeeklyCounts(workouts);
    computeMonthlyCounts(workouts);
    computeBodyPartDistribution(workouts);
    computeVolumeOverTime(workouts, exercises);
  };

  // --- WEEKLY WORKOUT FREQUENCY ---
  const computeWeeklyCounts = (workouts: any[]) => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Sun → Sat

    workouts.forEach((w) => {
      const day = new Date(w.date).getDay();
      counts[day] += 1;
    });

    setWeeklyCounts(counts);
  };

  // --- MONTHLY WORKOUT FREQUENCY ---
  const computeMonthlyCounts = (workouts: any[]) => {
    const counts = Array(12).fill(0);

    workouts.forEach((w) => {
      const month = new Date(w.date).getMonth();
      counts[month] += 1;
    });

    setMonthlyCounts(counts);
  };

  // --- BODY PART DISTRIBUTION ---
  const computeBodyPartDistribution = (workouts: any[]) => {
    const map: any = {};

    workouts.forEach((w) => {
      w.body_parts.forEach((bp: string) => {
        map[bp] = (map[bp] || 0) + 1;
      });
    });

    const pieData = Object.keys(map).map((key, index) => ({
      name: key,
      population: map[key],
      color: chartColors[index % chartColors.length],
      legendFontColor: '#1f2937',
      legendFontSize: 14,
    }));

    setBodyPartDistribution(pieData);
  };

  // --- VOLUME OVER TIME ---
  const computeVolumeOverTime = (workouts: any[], exercises: any[]) => {
    const map: any = {};

    exercises.forEach((ex) => {
      const w = workouts.find((w) => w.id === ex.workout_id);
      if (!w) return;

      const dateKey = w.date.split('T')[0];

      const volume = ex.weight
        ? ex.sets * ex.reps * ex.weight
        : ex.sets * ex.reps;

      map[dateKey] = (map[dateKey] || 0) + volume;
    });

    const sortedDates = Object.keys(map).sort();

    const chartData = sortedDates.map((date) => ({
      date,
      volume: map[date],
    }));

    setVolumeOverTime(chartData);
  };

  const chartColors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>Progress Dashboard</Text>

      {/* WEEKLY FREQUENCY */}
      <Text style={styles.sectionTitle}>Workouts This Week</Text>
      <BarChart
        data={{
          labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [{ data: weeklyCounts }],
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
      />

      {/* MONTHLY FREQUENCY */}
      <Text style={styles.sectionTitle}>Workouts Per Month</Text>
      <BarChart
        data={{
          labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
          datasets: [{ data: monthlyCounts }],
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
      />

      {/* BODY PART DISTRIBUTION */}
      <Text style={styles.sectionTitle}>Body Part Distribution</Text>
      <PieChart
        data={bodyPartDistribution}
        width={screenWidth - 32}
        height={260}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="16"
        chartConfig={chartConfig}
      />

      {/* VOLUME OVER TIME */}
      <Text style={styles.sectionTitle}>Training Volume Over Time</Text>
      <LineChart
        data={{
          labels: volumeOverTime.map((v) => v.date.slice(5)),
          datasets: [{ data: volumeOverTime.map((v) => v.volume) }],
        }}
        width={screenWidth - 32}
        height={260}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: () => '#6b7280',
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#3b82f6',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 10,
  },
  chart: {
    borderRadius: 12,
    marginBottom: 20,
  },
});