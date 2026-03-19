import { fromCallback } from 'xstate'

type MediaPropertiesEvents =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_TIME', value: number }
  | { type: 'SET_VOLUME', muted: boolean, volume: number }
  | { type: 'SET_PLAYBACK_RATE', playbackRate: number }
  | { type: 'DESTROY' }

type MediaPropertiesEmittedEvents =
  | { type: 'PLAYING' }
  | { type: 'PAUSED' }
  | { type: 'TIME_UPDATE', currentTime: number }
  | { type: 'VOLUME_UPDATE', muted: boolean, volume: number }
  | { type: 'PLAYBACK_RATE_UPDATE', playbackRate: number }
  | { type: 'DURATION_UPDATE', duration: number }
  | { type: 'SEEKING', currentTime: number }
  | { type: 'ENDED' }

type MediaPropertiesInput = { videoElement: HTMLVideoElement }

const addListeners = <T extends EventTarget>(
  target: T,
  listeners: Record<string, EventListener>
) => {
  for (const [event, handler] of Object.entries(listeners)) {
    target.addEventListener(event, handler)
  }
  return () => {
    for (const [event, handler] of Object.entries(listeners)) {
      target.removeEventListener(event, handler)
    }
  }
}

export default fromCallback<MediaPropertiesEvents, MediaPropertiesInput, MediaPropertiesEmittedEvents>(({ sendBack, receive, input }) => {
  const { videoElement } = input

  receive((event) => {
    if (event.type === 'PLAY') {
      videoElement
        .play()
        .then(() => sendBack({ type: 'PLAYING' }))
        .catch((error) => {
          console.error(error)
        })
    }
    if (event.type === 'PAUSE') {
      videoElement.pause()
      sendBack({ type: 'PAUSED' })
    }
    if (event.type === 'SET_TIME') {
      videoElement.currentTime = event.value
      sendBack({ type: 'TIME_UPDATE', currentTime: videoElement.currentTime })
    }
    if (event.type === 'SET_VOLUME') {
      videoElement.volume = event.volume
      videoElement.muted = event.muted
      sendBack({ type: 'VOLUME_UPDATE', muted: videoElement.muted, volume: videoElement.volume })
    }
    if (event.type === 'SET_PLAYBACK_RATE') {
      videoElement.playbackRate = event.playbackRate
      sendBack({ type: 'PLAYBACK_RATE_UPDATE', playbackRate: videoElement.playbackRate })
    }
  })

  return addListeners(videoElement, {
    play: () => sendBack({ type: 'PLAYING' }),
    pause: () => sendBack({ type: 'PAUSED' }),
    ended: () => sendBack({ type: 'ENDED' }),
    timeupdate: () => sendBack({ type: 'TIME_UPDATE', currentTime: videoElement.currentTime }),
    volumechange: () => sendBack({ type: 'VOLUME_UPDATE', muted: videoElement.muted, volume: videoElement.volume }),
    ratechange: () => sendBack({ type: 'PLAYBACK_RATE_UPDATE', playbackRate: videoElement.playbackRate }),
    seeking: () => sendBack({ type: 'SEEKING', currentTime: videoElement.currentTime }),
    durationchange: () => sendBack({ type: 'DURATION_UPDATE', duration: videoElement.duration }),
  })
})
