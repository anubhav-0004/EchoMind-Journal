import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../lib/theme'

interface MoodBarProps {
  label: string
  value: number   // 0 to 1
  color?: string
}

export function MoodBar({ label, value, color = colors.sage }: MoodBarProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.pct}>{Math.round(value * 100)}%</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: '#8a9aa8',
    width: 44,
    textTransform: 'capitalize',
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  pct: {
    fontSize: 10,
    color: '#8a9aa8',
    width: 30,
    textAlign: 'right',
  },
})