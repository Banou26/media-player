/// <reference types="@emotion/react/types/css-prop" />
import type { Dispatch, DOMAttributes, HTMLAttributes, MouseEvent, MouseEventHandler, MutableRefObject, SetStateAction } from 'react'

import type { ChromeOptions } from '.'
import type { FKNVideoControl, Subtitle, TransmuxError } from '..'

import { css } from '@emotion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Volume, Volume1, Volume2, VolumeX, AlertTriangle } from 'react-feather'

import useScrub from '../use-scrub'
import { tagToLanguage } from '../languages'
import useNamespacedLocalStorage from '../use-local-storage'
import { Tooltip } from 'react-tooltip'

const style = css`
  position: relative;
  grid-column: 1;
  grid-row: 1;
  align-self: end;
  height: calc(4.8rem + var(--background-padding));
  width: 100%;
  padding: 0 2rem;
  margin: 0 auto;

  /* subtle background black gradient for scenes with high brightness to properly display white progress bar */
  padding-top: var(--background-padding);
  background: linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) calc(100% - 1rem), rgba(0,0,0,0) 100%);

  .progress-bar {
    position: relative;
    height: .4rem;
    cursor: pointer;
    user-select: none;
    transition: transform .2s ease-in-out;


    &:hover {
      .background-bar {
        transform: scaleY(1.5);
      }
    }
    .background-bar {
      position: absolute;
      inset: 0;
      background-color: hsla(0, 100%, 100%, .2);
    }

    .cursor-time {
      pointer-events: none;
      position: absolute;
      top: -2rem;
      width: 5rem;
      margin-left: -2.5rem;
      display: flex;
      justify-content: center;
    }

    .load {
      transform-origin: 0 0;
      background-color: hsla(0, 100%, 100%, .4);
      position: absolute;
      bottom: 0;
      height: .4rem;
      width: 100%;
    }
    .play {
      transform-origin: 0 0;
      background-color: hsla(0, 100%, 50%, .8);
      position: absolute;
      bottom: 0;
      height: .4rem;
      width: 100%;
    }
    .padding {
      position: absolute;
      bottom: -4px;
      height: 1.6rem;
      width: 100%;
    }
  }

  .controls {
    height: 100%;
    display: grid;
    align-items: center;
    grid-template-columns: 5rem fit-content(4.8rem) 20rem auto fit-content(10rem) fit-content(10rem) 5rem 5rem;
    grid-gap: 1rem;
    color: #fff;
    user-select: none;

    .picture-in-picture, .fullscreen, .play-button {
      height: 100%;
      color: #fff;
      background-color: transparent;
      border: none;
      cursor: pointer;
    }

    .volume-area {
      display: flex;
      /* grid-template-columns: 4.8rem fit-content(0rem); */
      height: 100%;
      cursor: pointer;

      .mute-button {
        color: #fff;
        border: none;
        background: none;
        height: 100%;
        width: 4.8rem;
        cursor: pointer;
      }

      .volume-panel {
        display: inline-block;
        width: 0;
        /* width: 100%; */
        /* width: 12rem; */
        height: 100%;
        -webkit-transition: margin .2s cubic-bezier(0.4,0,1,1),width .2s cubic-bezier(0.4,0,1,1);
        transition: margin .2s cubic-bezier(0.4,0,1,1),width .2s cubic-bezier(0.4,0,1,1);
        cursor: pointer;
        outline: 0;

        &.volume-control-hover {
          width: 6rem;
          /* width: 52px; */
          margin-right: 3px;
          -webkit-transition: margin .2s cubic-bezier(0,0,0.2,1),width .2s cubic-bezier(0,0,0.2,1);
          transition: margin .2s cubic-bezier(0,0,0.2,1),width .2s cubic-bezier(0,0,0.2,1);
        }

        .slider {
          height: 100%;
          min-height: 36px;
          position: relative;
          overflow: hidden;

          .slider-handle {
            /* left: 40px; */
            position: absolute;
            top: 50%;
            width: 12px;
            height: 12px;
            border-radius: 6px;
            margin-top: -6px;
            margin-left: -5px;
            /* background: #fff; */
          }
          .slider-handle::before, .slider-handle::after {
            content: "";
            position: absolute;
            display: block;
            top: 50%;
            left: 0;
            height: 3px;
            margin-top: -2px;
            width: 64px;
          }
          .slider-handle::before {
            left: -58px;
            background: #fff;
          }
          .slider-handle::after {
            left: 6px;
            background: rgba(255,255,255,.2);
          }
        }
      }
    }

    .time {
      font-family: Roboto;
      padding-bottom: .5rem;
    }

    .custom-controls {
      display: flex;
      justify-content: end;
    }

    .error-area {
      position: relative;
      height: 3.8rem;

      .error-menu {
        position: absolute;
        bottom: 4.8rem;
        left: -10rem;
        width: 25rem;
        /* background: rgba(0, 0, 0, .2); */
        /* background: rgb(35, 35, 35); */
        padding: 1rem;
        background-color: rgb(51, 51, 51);

        &.hide {
          display: none;
        }

        .error-menu-message {
          
        }

        button {
          width: 100%;
          padding: 0.5rem 0;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          text-shadow: 2px 2px #000;
        }
      }

      .error-menu-button {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        height: 100%;
        width: 100%;
        cursor: pointer;
        color: #eb1010;
        font-weight: bold;
        background: none;
        border: none;
      }
    }

    .subtitle-area {
      position: relative;
      height: 3.8rem;

      .subtitle-menu {
        position: absolute;
        bottom: 4.8rem;
        left: calc(-1rem - 50%);
        /* background: rgba(0, 0, 0, .2); */
        /* background: rgb(35, 35, 35); */
        padding: 1rem 0;
        background-color: rgb(17, 17, 17);
        /* background-color: rgb(51, 51, 51); */
        border-radius: .3rem;

        &.hide {
          display: none;
        }

        button {
          width: 100%;
          padding: 1rem;
          /* padding: 0.5rem 0; */
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          text-shadow: 2px 2px #000;
          white-space: nowrap;
          text-align: start;

          &:hover {
            background-color: rgb(51, 51, 51);
          }
        }
      }
      
      .subtitle-menu-button {
        height: 100%;
        width: 100%;
        cursor: pointer;
        color: #fff;
        background: none;
        border: none;
      }
    }
  }
`

export type BottomOptions = {
  video: MutableRefObject<HTMLVideoElement | undefined>
  videoReactive: HTMLVideoElement | undefined,
  duration?: number
  currentTime?: number
  togglePlay: () => void
  isSubtitleMenuHidden: boolean
  setIsSubtitleMenuHidden: Dispatch<SetStateAction<boolean>>
  isErrorMenuHidden: boolean
  setIsErrorMenuHidden: Dispatch<SetStateAction<boolean>>
  setCurrentSubtitleTrack: Dispatch<SetStateAction<number | undefined>>
  isFullscreen: boolean
  toggleFullscreen: () => void
  subtitleTrack: Subtitle | undefined
  errors: TransmuxError[]
  customControls?: FKNVideoControl[]
} &
Pick<ChromeOptions, 'seek' | 'setVolume' | 'loadedTime' | 'isPlaying' | 'tracks' | 'pictureInPicture'> &
HTMLAttributes<HTMLDivElement>

export default ({
  video,
  videoReactive,
  duration,
  currentTime,
  togglePlay,
  seek,
  setVolume,
  isSubtitleMenuHidden,
  setIsSubtitleMenuHidden,
  isErrorMenuHidden,
  setIsErrorMenuHidden,
  setCurrentSubtitleTrack,
  loadedTime,
  isPlaying,
  tracks,
  isFullscreen,
  toggleFullscreen,
  subtitleTrack,
  pictureInPicture,
  errors,
  customControls,
  ...rest
}: BottomOptions) => {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const volumeBarRef = useRef<HTMLDivElement>(null)
  const [hiddenVolumeArea, setHiddenVolumeArea] = useState(false)
  const { scrub: seekScrub, value: seekScrubValue, setValue: setSeekValue } = useScrub({ ref: progressBarRef })
  const isPictureInPictureEnabled = useMemo(() => document.pictureInPictureEnabled, [])
  const [hasShownErrorPopup, setHasShownErrorPopup] = useState(false)

  const useStoredValue = useNamespacedLocalStorage<{ volume: number, muted: boolean }>('fkn-media-player')
  const [volume, setStoredVolume] = useStoredValue('volume', 1)
  const [isMuted, setStoredMuted] = useStoredValue('muted', false)
  const { scrub: volumeScrub, value: volumeScrubValue, setValue: updateVolume } = useScrub({ ref: volumeBarRef, defaultValue: volume })

  useEffect(() => {
    if (hasShownErrorPopup) return
    setHasShownErrorPopup(true)
    errorMenuButtonClick(undefined)
  }, [hasShownErrorPopup, errors.length])

  useEffect(() => {
    if (seekScrubValue === undefined) return
    seek(seekScrubValue * (duration ?? 0))
  }, [seekScrubValue])

  useEffect(() => {
    if (isMuted) {
      setVolume(0)
      setStoredMuted(isMuted)
      if (volumeScrubValue) setStoredVolume(volumeScrubValue)
      return
    }
    if (volumeScrubValue === undefined) return
    setVolume(volumeScrubValue ** 2)
    setStoredVolume(volumeScrubValue)
    setStoredMuted(isMuted)
  }, [volumeScrubValue, isMuted])

  const hoverVolumeArea: React.DOMAttributes<HTMLDivElement>['onMouseOver'] = () => {
    setHiddenVolumeArea(false)
  }

  const mouseOutBottom: React.DOMAttributes<HTMLDivElement>['onMouseOut'] = (ev) => {
    if (ev.currentTarget !== ev.relatedTarget && ev.relatedTarget !== null) return
    setHiddenVolumeArea(true)
  }

  const toggleMuteButton = () => {
    setStoredMuted(value => !value)
  }

  const setSubtitleTrack = (ev: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, track: Subtitle | undefined, trackIndex: number) => {
    setCurrentSubtitleTrack(track === undefined ? track : trackIndex)
  }

  const subtitleMenuButtonClick: MouseEventHandler<HTMLButtonElement> = (ev) => {
    if (!isSubtitleMenuHidden && ev.relatedTarget === null) {
      setIsSubtitleMenuHidden(value => !value)
      return
    }
    setIsSubtitleMenuHidden(false)
    const clickListener = (ev: globalThis.MouseEvent) => {
      ev.stopPropagation()
      setIsSubtitleMenuHidden(true)
      document.removeEventListener('click', clickListener)
    }
    setTimeout(() => {
      document.addEventListener('click', clickListener)
    }, 0)
  }
  
  const errorMenuButtonClick = (ev: MouseEvent<HTMLDivElement, globalThis.MouseEvent> | undefined) => {
    if (!isErrorMenuHidden && ev?.relatedTarget === null) {
      setIsErrorMenuHidden(value => !value)
      return
    }
    setIsErrorMenuHidden(false)
    const clickListener = (ev: globalThis.MouseEvent) => {
      ev.stopPropagation()
      setIsErrorMenuHidden(true)
      document.removeEventListener('click', clickListener)
    }
    setTimeout(() => {
      document.addEventListener('click', clickListener)
    }, 0)
  }

  const SubtitleTrackToName = ({ subtitleTrack: subtitle }: { subtitleTrack: Subtitle | undefined }) => {
    if (!subtitle) return <>Disabled</>

    if (!subtitle.title && !subtitle.language) return <>Default</>
    const language =
      subtitle.language === 'jpn' ? 'ja'
      : tagToLanguage(subtitle.language) ? tagToLanguage(subtitle.language)
      : subtitle.language

    if (subtitle.title) {
      return (
        <>
          {subtitle.title?.replace('subs', '').replace(/\(.*\)/, '')}
        </>
      )
    }

    return (
      <>
        {language}
      </>
    )
  }

  const shownErrors = useMemo(() =>
    [
      ...new Set(
        errors
          .map(error =>
            error.message === 'non monotonicaly increasing DTS values'
              ? (
                error.count > 2
                  ? 'The video seems malformatted and might have issues(skipped frames) during playback'
                  : null
              )
              : 'An unexpected error occured while trying to play the video'
          )
      )
    ]
      .filter(Boolean)
      .map(str => <div key={str} className="error-menu-message">{str}</div>)
  , [errors])

  useEffect(() => {
    const eventListener = (ev: KeyboardEvent) => {
      if (ev.key === 'f') toggleFullscreen()
      if (ev.key === 'k') togglePlay()
      if (ev.key === ' ') togglePlay()
      if (ev.key === 'm') toggleMuteButton()
      if (ev.key === 'ArrowUp') {
        if (volume <= 0.95) {
          updateVolume(volume + 0.05)
        } else {
          updateVolume(1)
        }
      }
      if (ev.key === 'ArrowDown') {
        if (volume >= 0.05) {
          updateVolume(volume - 0.05)
        } else {
          updateVolume(0)
        }
      }
      if (ev.key === 'ArrowLeft') {
        if (!videoReactive) return
        videoReactive.currentTime -= (
          ev.shiftKey ? 20
          : ev.ctrlKey ? 2
          : 5
        )
      }
      if (ev.key === 'ArrowRight') {
        if (!videoReactive) return
        videoReactive.currentTime += (
          ev.shiftKey ? 20
          : ev.ctrlKey ? 2
          : 5
        )
      }
    }
    window.addEventListener('keydown', eventListener)
    return () => window.removeEventListener('keydown', eventListener)
  }, [videoReactive, toggleFullscreen, togglePlay, toggleMuteButton])

  const [progressBarOverTime, setProgressBarOverTime] = useState<number | undefined>(undefined)

  const onProgressBarOver: DOMAttributes<HTMLDivElement>['onMouseMove'] = (ev) => {
    const percentage = ev.nativeEvent.offsetX / ev.currentTarget.offsetWidth
    const time = percentage * (duration ?? 0)
    setProgressBarOverTime(time)
  }

  const hideProgressBarTime = () => {
    if (!progressBarRef.current) return
    setProgressBarOverTime(undefined)
  }

  return (
    <div css={style} onMouseOut={mouseOutBottom} {...rest}>
      <div className="preview"></div>
      <div
        ref={progressBarRef}
        className="progress-bar"
        onMouseMove={onProgressBarOver}
        onMouseOut={hideProgressBarTime}
      >
        <div className="background-bar"></div>
        {
          progressBarOverTime
            ? (
              <div className="cursor-time" data-tip={progressBarOverTime} style={{ left: `${1 / ((duration ?? 0) / (progressBarOverTime ?? 1)) * 100}%` }}>
                {
                new Date((progressBarOverTime ?? 0) * 1000)
                  .toISOString()
                  .substr(
                    (duration ?? 0) >= 3600
                      ? 11
                      : 14,
                    (duration ?? 0) >= 3600
                      ? 8
                      : 5
                    
                  )
                }
              </div>
            )
            : undefined
        }
        <div className="progress"></div>
        {/* bar showing the currently loaded progress */}
        <div className="load" style={{ transform: `scaleX(${1 / ((duration ?? 0) / (loadedTime?.[1] ?? 0))})` }}></div>
        {/* bar to show when hovering to potentially seek */}
        <div className="hover"></div>
        {/* bar displaying the current playback progress */}
        <div className="play" style={{
          transform: `scaleX(${
            typeof duration !== 'number' || typeof currentTime !== 'number'
              ? 0
              : 1 / ((duration ?? 0) / (currentTime ?? 0))
          })`
        }}>
        </div>
        <div className="chapters"></div>
        <div className="scrubber"></div>
        <div className="padding" onMouseDown={seekScrub}></div>
      </div>
      <div className="controls">
        <Tooltip id="play-button-tooltip" place="top-start" >
          {
            isPlaying
              ? 'Pause (k)'
              : 'Play (k)'
          }
        </Tooltip>
        <button className="play-button" type="button" data-tip data-tooltip-id="play-button-tooltip" onClick={togglePlay}>
          {
            isPlaying
              ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-play"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          }
        </button>
        <div className="volume-area" onMouseOver={hoverVolumeArea}>
          <Tooltip
            id="mute-button-tooltip"
            place="top"
          >
            {
              isMuted
                ? 'Unmute (m)'
                : 'Mute (m)'
            }
          </Tooltip>
          <button className="mute-button" data-tip data-tooltip-id="mute-button-tooltip" onClick={toggleMuteButton}>
            {
              isMuted ? <VolumeX/>
              : (volume ?? 0) > 0.66 ? <Volume2/>
              : (volume ?? 0) > 0.33 ? <Volume1/>
              : (volume ?? 0) > 0 ? <Volume/>
              : <VolumeX/>
            }
          </button>
          <div ref={volumeBarRef} className={`volume-panel${hiddenVolumeArea ? '' : ' volume-control-hover'}`} onMouseDown={volumeScrub}>
            <div className="slider">
              <div className="slider-handle" style={{ left: `${(volume ?? 0) * 100}%` }}></div>
            </div>
          </div>
        </div>
        <div className="time">
          <span>{new Date((currentTime ?? 0) * 1000).toISOString().substr(11, 8).replace(/^00:/, '')}</span>
          <span> / </span>
          <span>{duration ? new Date(duration * 1000).toISOString().substr(11, 8).replace(/^00:/, '') : ''}</span>
        </div>
        <div className="custom-controls">
          {
            customControls?.length
              ? customControls.map((Control, i) => <Control key={i}/>)
              : null
          }
        </div>
        <div className="error-area">
          {
            shownErrors.length
              ? (
                <>
                  <div className={`error-menu ${isErrorMenuHidden ? 'hide' : ''}`}>
                    {
                      isErrorMenuHidden
                        ? null
                        : shownErrors
                    }
                  </div>
                  <div className="error-menu-button" onClick={errorMenuButtonClick}>
                    <AlertTriangle/>
                    Error
                  </div>
                </>
              )
              : null
          }
        </div>
        <Tooltip
          id="subtitle-button-tooltip"
          globalEventOff="click"
        
          disable={!isSubtitleMenuHidden}
          class="tooltip"
        >
          <span>
            Subtitles
          </span>
        </Tooltip>
        <div className="subtitle-area">
          {
            tracks.length
            ? (
              <>
                <div className={`subtitle-menu ${isSubtitleMenuHidden ? 'hide' : ''}`}>
                  {
                    isSubtitleMenuHidden
                      ? null
                      : (
                        [...tracks, undefined].map((track, i) =>
                          <button key={!track ? 'disabled' : i} onClick={ev => setSubtitleTrack(ev, track, i)}>
                            {
                              track
                                ? <span>{i}. </span>
                                : null
                            }
                            <span><SubtitleTrackToName subtitleTrack={track}/></span>
                          </button>
                        )
                      )
                  }
                </div>
                <button className="subtitle-menu-button" data-tip data-tooltip-id="subtitle-button-tooltip" onClick={subtitleMenuButtonClick}>
                  <SubtitleTrackToName subtitleTrack={subtitleTrack}/>
                </button>
              </>
            )
            : null
          }
        </div>
        <Tooltip
          id="pip-button-tooltip"
        
          place="top"
        >
          Picture in Picture
        </Tooltip>
        {
          isPictureInPictureEnabled
            ? (
              <button className="picture-in-picture" data-tip data-tooltip-id="pip-button-tooltip" onClick={pictureInPicture}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="21" height="14" rx="2" ry="2"></rect><rect x="12.5" y="8.5" width="8" height="6" rx="2" ry="2"></rect></svg>
              </button>
            )
            : null
        }
        <Tooltip id="fullscreen-button-tooltip" place="top-end">
          {
            isFullscreen
              ? 'Exit full screen (f)'
              : 'Full screen (f)'
          }
        </Tooltip>
        <button className="fullscreen" data-tip data-tooltip-id="fullscreen-button-tooltip" onClick={toggleFullscreen}>
          {
            isFullscreen
              ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
              : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
          }
        </button>
      </div>
    </div>
  )
}
 