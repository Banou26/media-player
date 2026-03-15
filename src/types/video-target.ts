export type VideoTargetEventType =
  | 'play' | 'pause' | 'ended'
  | 'timeupdate' | 'volumechange' | 'ratechange'
  | 'seeking' | 'durationchange' | 'error'

export type VideoTarget = {
  play(): Promise<void>
  pause(): void

  currentTime: number
  volume: number
  muted: boolean
  playbackRate: number

  readonly duration: number
  readonly paused: boolean
  readonly videoWidth: number
  readonly videoHeight: number

  addEventListener(type: VideoTargetEventType, handler: () => void, options?: AddEventListenerOptions): void
  removeEventListener(type: VideoTargetEventType, handler: () => void): void
}
