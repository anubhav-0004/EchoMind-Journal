import { Text, StyleSheet } from 'react-native'
import { colors, fontSize } from '../lib/theme'

export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 8,
  },
})