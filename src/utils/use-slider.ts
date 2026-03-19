import { useRef, useState, useEffect, useCallback } from 'react'

export type UseSliderOptions = {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}

export default ({ value, min = 0, max = 1, step = 0.05, onChange }: UseSliderOptions) => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const range = max - min

  const getValueFromClientX = useCallback((clientX: number): number => {
    if (!sliderRef.current) return value
    const rect = sliderRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(clientX - rect.left, rect.width)) / rect.width
    const raw = min + percent * range
    return Math.round(raw / step) * step
  }, [value, min, range, step])

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    onChange(getValueFromClientX(e.clientX))
  }, [getValueFromClientX, onChange])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => onChange(getValueFromClientX(e.clientX))
    const onUp = () => setIsDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, getValueFromClientX, onChange])

  useEffect(() => {
    const el = sliderRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const direction = e.deltaY < 0 ? 1 : -1
      const newValue = Math.max(min, Math.min(max, value + direction * step))
      onChange(newValue)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [value, min, max, step, onChange])

  const fillPercent = ((value - min) / range) * 100

  return {
    sliderRef,
    isDragging,
    onMouseDown,
    fillPercent
  }
}
