import type { VideoTarget } from '../types/video-target'

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

type MediaPropertiesInput = { videoTarget: VideoTarget }

export default fromCallback<MediaPropertiesEvents, MediaPropertiesInput, MediaPropertiesEmittedEvents>(({ sendBack, receive, input }) => {
  const { videoTarget } = input

  receive((event) => {
    if (event.type === 'PLAY') {
      videoTarget
        .play()
        .then(() => handlePlay())
        .catch((error) => {
          console.error(error)
        })
    }
    if (event.type === 'PAUSE') {
      videoTarget.pause()
      handlePause()
    }
    if (event.type === 'SET_TIME') {
      videoTarget.currentTime = event.value
      handleTimeUpdate()
    }
    if (event.type === 'SET_VOLUME') {
      videoTarget.volume = event.volume
      videoTarget.muted = event.muted
      handleVolumeUpdate()
    }
    if (event.type === 'SET_PLAYBACK_RATE') {
      videoTarget.playbackRate = event.playbackRate
      handlePlaybackRateUpdate()
    }
  })

  const handlePlay = () => sendBack({ type: 'PLAYING' })
  const handlePause = () => sendBack({ type: 'PAUSED' })
  const handleEnded = () => sendBack({ type: 'ENDED' })
  const handleTimeUpdate = () => sendBack({ type: 'TIME_UPDATE', currentTime: videoTarget.currentTime })
  const handleVolumeUpdate = () => sendBack({ type: 'VOLUME_UPDATE', muted: videoTarget.muted, volume: videoTarget.volume })
  const handlePlaybackRateUpdate = () => sendBack({ type: 'PLAYBACK_RATE_UPDATE', playbackRate: videoTarget.playbackRate })
  const handleSeeking = () => sendBack({ type: 'SEEKING', currentTime: videoTarget.currentTime })
  const handleDurationChange = () => sendBack({ type: 'DURATION_UPDATE', duration: videoTarget.duration })

  videoTarget.addEventListener('play', handlePlay)
  videoTarget.addEventListener('pause', handlePause)
  videoTarget.addEventListener('ended', handleEnded)
  videoTarget.addEventListener('timeupdate', handleTimeUpdate)
  videoTarget.addEventListener('volumechange', handleVolumeUpdate)
  videoTarget.addEventListener('ratechange', handlePlaybackRateUpdate)
  videoTarget.addEventListener('seeking', handleSeeking)
  videoTarget.addEventListener('durationchange', handleDurationChange)

  return () => {
    videoTarget.removeEventListener('play', handlePlay)
    videoTarget.removeEventListener('pause', handlePause)
    videoTarget.removeEventListener('ended', handleEnded)
    videoTarget.removeEventListener('timeupdate', handleTimeUpdate)
    videoTarget.removeEventListener('volumechange', handleVolumeUpdate)
    videoTarget.removeEventListener('ratechange', handlePlaybackRateUpdate)
    videoTarget.removeEventListener('seeking', handleSeeking)
    videoTarget.removeEventListener('durationchange', handleDurationChange)
  }
})
