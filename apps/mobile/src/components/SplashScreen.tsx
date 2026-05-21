import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

// Install first:
// npx expo install expo-linear-gradient

const { width, height } = Dimensions.get('window')

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    // Fade in + scale up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()

    // After 2 seconds, fade out and call onFinish
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onFinish())
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a1510', '#0f1e1a', '#1a3530', '#0f1e1a', '#0a1510']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Animated logo */}
        <Animated.View style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoSymbol}>✦</Text>
          </View>
          <Text style={styles.logoText}>EchoMind</Text>
          <Text style={styles.logoSub}>Your AI journaling companion</Text>
        </Animated.View>

        {/* Subtle glow effect */}
        <View style={styles.glow} />
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width, height,
    zIndex: 999,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 80, height: 80,
    borderRadius: 22,
    backgroundColor: 'rgba(74,124,111,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(122,171,156,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoSymbol: {
    fontSize: 40,
    color: '#7aab9c',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#e8f0ec',
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 13,
    color: 'rgba(138,154,168,0.8)',
    marginTop: 4,
  },
  glow: {
    position: 'absolute',
    width: 300, height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(74,124,111,0.06)',
    top: '30%',
    alignSelf: 'center',
  },
})