import { RefObject, useContext, useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { Maximize, Minimize, Pause, Play, Settings, Volume1, Volume2, VolumeX } from 'react-feather'

import { MediaMachineContext } from '../state-machines'
import { TooltipDisplay } from './tooltip-display'
import { togglePlay } from '../utils/actor-utils'
import { MediaPlayerContext } from '../utils/context'
import { ProgressBar } from './progress-bar'
import { fonts } from '../utils/fonts'
import VolumeSlider from './volume-slider'
import colors from '../utils/colors'

const volumeContainerStyle = css`
  position: relative;
  display: flex;
  align-items: center;

  .volume-slider-container {
    display: flex;
    align-items: center;

    width: 0;
    margin-right: 0;
    overflow: hidden;
    pointer-events: none;

    transition: margin .2s cubic-bezier(0.4,0,1,1), width .2s cubic-bezier(0.4,0,1,1);
    -webkit-transition: margin .2s cubic-bezier(0.4,0,1,1), width .2s cubic-bezier(0.4,0,1,1);

    .volume-slider-background {
      display: flex;
      flex-direction: row;
      align-items: center;

      border-radius: 4px;

      .volume-value {
        ${fonts.bMedium.regular};
        color: #ffffff;
      }
    }
  }

  &:hover .volume-slider-container {
    width: 9rem;

    transition: margin .2s cubic-bezier(0,0,0.2,1), width .2s cubic-bezier(0,0,0.2,1);
    -webkit-transition: margin .2s cubic-bezier(0,0,0.2,1), width .2s cubic-bezier(0,0,0.2,1);

    pointer-events: auto;
  }
`

const style = css`
  position: absolute;
  bottom: 0;
  width: 100%;

  background: linear-gradient(0deg,#000 0,rgba(0,0,0,.4) 60%,transparent);
  transition: opacity 0.1s cubic-bezier(.4,0,1,1);

  .actions {
    display: flex;
    justify-content: space-between;

    padding: 6px 12px;
    @media (min-width: 768px) {
      padding: 8px 16px;
    }
    @media (min-width: 2560px) {
      padding: 8px 24px;
    }

    .left, .right {
      display: flex;
      align-items: center;

      button {
        display: flex;
        align-items: center;

        outline: none;
        border: none;
        background: none;

        svg {
          width: 14px;
          height: 14px;
          @media (min-width: 768px) {
            width: 24px;
            height: 24px;
          }
          @media (min-width: 2560px) {
            width: 28px;
            height: 28px;
          }
        }
      }

      .play, .sound, .settings, .full-screen {
        border-radius: 4px;

        padding: 8px;
        @media (min-width: 768px) {
          padding: 8px 12px;
        }
        @media (min-width: 2560px) {
          padding: 8px 12px;
        }

        cursor: pointer;

        :hover {
          background-color: ${colors.hover};
        }
      }
    }

    .left {
      .play {

      }
    }
    .right {
      .full-screen {

      }
    }
  }
`

export const ControlBar = ({
  containerRef
}: {
  containerRef: RefObject<HTMLDivElement>
}) => {
  const mediaActor = MediaMachineContext.useActorRef()
  const chromeContext = useContext(MediaPlayerContext)
  const isPaused = MediaMachineContext.useSelector((state) => state.context.media.paused)
  const volume = MediaMachineContext.useSelector((state) => state.context.media.volume)
  const muted = MediaMachineContext.useSelector((state) => state.context.media.muted)

  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current) {
        containerRef.current.requestFullscreen()
      }
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const eventListener = (ev: KeyboardEvent) => {
      if (ev.key === 'f') toggleFullScreen()
      if (ev.key === 'k') togglePlay(mediaActor, isPaused)
      if (ev.key === ' ') togglePlay(mediaActor, isPaused)
      if (ev.key === 'm') {
        mediaActor.send({ type: 'SET_VOLUME', muted: !muted, volume })
      }
      if (ev.key === 'ArrowUp') {
        if (volume <= 0.95) {
          mediaActor.send({ type: 'SET_VOLUME', muted: false, volume: Math.round(volume * 100 + 5) / 100 })
        } else {
          mediaActor.send({ type: 'SET_VOLUME', muted: false, volume: 1 })
        }
      }
      if (ev.key === 'ArrowDown') {
        if (volume >= 0.05) {
          mediaActor.send({ type: 'SET_VOLUME', muted: false, volume: Math.round(volume * 100 - 5) / 100 })
        } else {
          mediaActor.send({ type: 'SET_VOLUME', muted: false, volume: 0 })
        }
      }
    }
    window.addEventListener('keydown', eventListener)
    return () => window.removeEventListener('keydown', eventListener)
  }, [mediaActor, volume, isPaused])

  const setVolume = (newVolume: number, muted: boolean) => {
    mediaActor.send({
      type: 'SET_VOLUME',
      muted,
      volume: Number(newVolume.toFixed(2))
    })
  }

  return (
    <div css={style} style={{ ...chromeContext.hideUI ? { opacity: '0', pointerEvents: 'none' } : {} }}>
      <ProgressBar />
      <div className='actions'>
        <div className='left'>
          <TooltipDisplay
            id='play'
            tooltipPlace='top-start'
            text={
              <button
                className='play'
                type='button'
                onClick={() => togglePlay(mediaActor, isPaused)}
              >
                {
                  isPaused
                    ? <Play size={18} color='#fff' />
                    : <Pause size={18} color='#fff' />
                }
              </button>
            }
            toolTipText={
              <span>
                {
                  isPaused
                    ? 'Play (k)'
                    : 'Pause (k)'
                }
              </span>
            }
          />

          <div css={volumeContainerStyle}>
            <TooltipDisplay
              id='sound'
              text={
                <button
                  className='sound'
                  type='button'
                  onClick={() => setVolume(volume, !muted)}
                >
                  {muted || volume === 0
                    ? <VolumeX size={18} color='#fff' />
                    : volume <= 0.5
                      ? <Volume1 size={18} color='#fff' />
                      : <Volume2 size={18} color='#fff' />
                  }
                </button>
              }
              toolTipText={
                <span>{muted ? 'Unmute (m)' : 'Mute (m)'}</span>
              }
            />
            <div className='volume-slider-container'>
              <div className='volume-slider-background'>
                <VolumeSlider value={muted ? 0 : volume} onChange={volume => setVolume(volume, false)} />
              </div>
            </div>
          </div>
        </div>
        <div className='right'>
          <TooltipDisplay
            id='settings'
            text={
              <button
                className='settings'
                type='button'
              >
                <Settings size={18} color='#fff' />
              </button>
            }
            toolTipText={
              <span>
                Settings
              </span>
            }
          />
          <TooltipDisplay
            id='full-screen'
            tooltipPlace='top-end'
            text={
              <button
                className='full-screen'
                type='button'
                onClick={toggleFullScreen}
              >
                {
                  isFullscreen
                    ? <Minimize size={18} color='#fff' />
                    : <Maximize size={18} color='#fff' />
                }
              </button>
            }
            toolTipText={
              <span>
                {
                  isFullscreen
                    ? 'Exit full screen (f)'
                    : 'Full screen (f)'
                }
              </span>
            }
          />
        </div>
      </div>
    </div>
  )
}

export default ControlBar
