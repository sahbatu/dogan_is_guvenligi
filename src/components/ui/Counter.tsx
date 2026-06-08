import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface CounterProps {
  value: number
  suffix?: string
  duration?: number
}

export function Counter({ value, suffix = '', duration = 2 }: CounterProps) {
  const [started, setStarted] = useState(false)
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    if (started) spring.set(value)
  }, [started, spring, value])

  return (
    <motion.span
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true }}
    >
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  )
}
