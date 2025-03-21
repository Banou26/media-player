import { useEffect, useMemo, useRef, useState } from "react"
import { css } from "@emotion/react"
import { ChevronRight, Settings } from "react-feather"

import { MediaMachineContext } from "../state-machines"
import { TooltipDisplay } from "./tooltip-display"
import { fonts } from "../utils/fonts"

const style = css`
position: relative;

.popover {
  position: absolute;
  right: 50%;
  transform: translateX(50%);

  width: 180px;
  height: 160px;
  top: -180px;
  @media (min-width: 768px) {
    width: 250px;
    height: 160px;
  }

  display: flex;
  flex-direction: column;

  border-radius: 8px;
  background-color: rgba(28,28,28,0.95);
  ${fonts.bMedium.regular}

  z-index: 4;

  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;

    color: #fff;
    outline: none;

    padding: 8px 6px 8px 12px;

    width: 100%;
    height: 100%;
    cursor: pointer;

    :first-of-type {
      border-radius: 8px 8px 0 0;
    }
    :last-of-type {
      border-radius: 0 0 8px 8px;
    }
    :hover {
      background-color: rgba(255,255,255,.1);
    }

    > div {
      display: flex;
      align-items: center;
      justify-content: center;

      .secondary {
        color: #eee;
        ${fonts.bSmall.regular}
      }
    }
  }
}
`

enum PopoverContent {
  Default,
  PlaybackRate,
  Advanced,
  SelectNewSources,
  Subtitles
}

const SettingsAction = () => {
  const mediaActor = MediaMachineContext.useActorRef()
  const playbackRate = MediaMachineContext.useSelector((state) => state.context.media.playbackRate)
  const subtitleStreams = MediaMachineContext.useSelector((state) => state.context.subtitleStreams)
  const selectedSubtitleStreamIndex = MediaMachineContext.useSelector((state) => state.context.selectedSubtitleStreamIndex)

  const [isOpenPopover, setIsOpenPopover] = useState(false)
  const [popoverContent, setPopoverContent] = useState(PopoverContent.Default)
  const settingsContainerRef = useRef<HTMLDivElement>(null)

  const togglePopover = () => {
    setIsOpenPopover(!isOpenPopover)
    setPopoverContent(PopoverContent.Default)
  }

  const setPlaybackRate = (rate: number) => {
    mediaActor.send({ type: 'SET_PLAYBACK_RATE', playbackRate: rate })
    setPopoverContent(PopoverContent.Default)
  }

  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (
        isOpenPopover &&
        settingsContainerRef.current &&
        !settingsContainerRef.current.contains(ev.target as Node)
      ) {
        togglePopover()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpenPopover])

  const languagesWithStreamIndex = useMemo(
    () => subtitleStreams.map(({ header }) => ({ streamIndex: header.streamIndex, language: header.parsed.info.Title })),
    [subtitleStreams.length]
  )

  const setLanguage = (languageWithStreamIndex: { streamIndex: number, language: string }) => () => {
    mediaActor.send({ type: 'SELECT_SUBTITLE_STREAM', streamIndex: languageWithStreamIndex.streamIndex })
    togglePopover()
  }

  const changePopoverContent = (newPopoverContent: PopoverContent) => () => {
    setPopoverContent(newPopoverContent)
  }

  return (
    <div css={style} ref={settingsContainerRef}>
      <TooltipDisplay
        id='settings'
        disabled={isOpenPopover}
        text={
          <button
            className='settings'
            type='button'
            onClick={togglePopover}
          >
            <Settings />
          </button>
        }
        toolTipText={
          <span>
            Settings
          </span>
        }
      />
      {
        isOpenPopover && popoverContent === PopoverContent.Default && (
          <div className='popover'>
            <div onClick={changePopoverContent(PopoverContent.Advanced)}>
              <span>Advanced</span>
              <div>
                <ChevronRight />
              </div>
            </div>
            <div onClick={changePopoverContent(PopoverContent.SelectNewSources)}>
              <div>Select new sources</div>
              <div>
                <ChevronRight />
              </div>
            </div>
            <div onClick={changePopoverContent(PopoverContent.Subtitles)}>
              <div>Subtitles</div>
              <div>
                <ChevronRight />
              </div>
            </div>
            <div onClick={changePopoverContent(PopoverContent.PlaybackRate)}>
              <div>Playback speed</div>
              <div>
                <span className='secondary'>
                  {
                    playbackRate === 1
                      ? '(Default)'
                      : playbackRate.toFixed(2)
                  }
                </span>
                <ChevronRight />
              </div>
            </div>
          </div>
        )
      }
      {
        isOpenPopover && popoverContent === PopoverContent.PlaybackRate && (
          <div className='popover'>
            <div onClick={changePopoverContent(PopoverContent.Default)}>
              <div>Back</div>
              <div></div>
            </div>
            <div>
              <div>Playback speed</div>
              <div>
                <button
                  type='button'
                  onClick={() => setPlaybackRate(0.5)}
                >
                  0.5x
                </button>
                <button
                  type='button'
                  onClick={() => setPlaybackRate(1)}
                >
                  1x
                </button>
                <button
                  type='button'
                  onClick={() => setPlaybackRate(1.5)}
                >
                  1.5x
                </button>
                <button
                  type='button'
                  onClick={() => setPlaybackRate(2)}
                >
                  2x
                </button>
              </div>
            </div>
          </div>
        )
      }
      {
        isOpenPopover && popoverContent === PopoverContent.Advanced && (
          <div className='popover'>
            <div onClick={changePopoverContent(PopoverContent.Default)}>
              <div>Back</div>
              <div></div>
            </div>
          </div>
        )
      }
      {
        isOpenPopover && popoverContent === PopoverContent.SelectNewSources && (
          <div className='popover'>
            <div onClick={changePopoverContent(PopoverContent.Default)}>
              <div>Back</div>
              <div></div>
            </div>
          </div>
        )
      }
      {
        isOpenPopover && popoverContent === PopoverContent.Subtitles && (
          <div className='popover'>
            {
              languagesWithStreamIndex.map((languageWithStreamIndex) => (
                <div
                  key={languageWithStreamIndex.streamIndex}
                  onClick={setLanguage(languageWithStreamIndex)}
                >
                  <div>{languageWithStreamIndex.language}</div>
                  <div>{selectedSubtitleStreamIndex === languageWithStreamIndex.streamIndex ? '✓' : ''}</div>
                </div>
              ))
            }
            <div onClick={changePopoverContent(PopoverContent.Default)}>
              <div>Back</div>
              <div></div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default SettingsAction