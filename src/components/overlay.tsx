/// <reference types="@emotion/react/types/css-prop" />

import { ClassAttributes, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { css } from '@emotion/react'

import { MediaMachineContext } from '../state-machines'
import { MediaPlayerContext } from '../utils/context'

const style = css`
  top: unset !important;
  left: unset !important;
  width: 100%;
  height: 100%;
  margin: auto;
  pointer-events: none;
`

const titleStyle = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin-left: 2.5rem;
  margin-top: 2.5rem;
  font-size: 2rem;
  color: white;
  text-shadow: 0 0 4px rgba(0, 0, 0, 1);
  z-index: 2;
  pointer-events: none;
`

const loadingInformationStyle = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 2rem;
  color: white;
  text-shadow: 0 0 4px rgba(0, 0, 0, 1);
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`

export const Overlay = ({ loadingInformation }: { loadingInformation?: ReactNode }) => {
  const mediaActor = MediaMachineContext.useActorRef()
  const duration = MediaMachineContext.useSelector((state) => state.context.media.duration)
  const mediaPlayerContext = useContext(MediaPlayerContext)

  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>()
  const refFunction: ClassAttributes<HTMLCanvasElement>['ref'] = useCallback((element: HTMLCanvasElement | null) => {
    setCanvasElement(element)
  }, [])

  useEffect(() => {
    if (!canvasElement) return
    mediaActor.send({
      type: 'SET_CANVAS_ELEMENT',
      canvasElement,
    })
  }, [canvasElement])

  return (
    <>
      {
        mediaPlayerContext.title && !mediaPlayerContext.hideUI
          ? <div css={titleStyle}>{mediaPlayerContext.title}</div>
          : undefined
      }
      {
        duration === undefined && loadingInformation
          ? <div css={loadingInformationStyle}>{loadingInformation}</div>
          : undefined
      }
      <canvas ref={refFunction} css={style}/>
    </>
  )
}
