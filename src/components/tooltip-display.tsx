import { ReactNode } from 'react'
import { css } from '@emotion/react'
import { PlacesType, Tooltip } from 'react-tooltip'

import { fonts } from '../utils/fonts'
import colors from '../utils/colors'

const style = (size: buttonSize) => css`
  display: flex;
  justify-content: flex-end;

  border-radius: 0.4rem;

  overflow: hidden;
  overflow-wrap: anywhere;
  z-index: 10;

  * {
    ${fonts.bSmall.regular}
  }

  ${size === buttonSize.sm && css`
    padding: 0.4rem!important;
  `}
  ${size === buttonSize.md && css`
    padding: 0.6rem!important;
  `}
  ${size === buttonSize.lg && css`
    padding: 1.2rem!important;
  `}
`

interface TooltipDisplayProps {
  id: string
  toolTipText: ReactNode
  text: ReactNode
  delayShow?: number
  closeDelay?: number
  offset?: number
  tooltipPlace?: PlacesType
  size?: buttonSize
}

export enum buttonSize {
  sm = 'sm',
  md = 'md',
  lg = 'lg'
}

export const TooltipDisplay = ({
  id,
  toolTipText,
  text,
  delayShow = 0,
  closeDelay = 0,
  offset = 20,
  tooltipPlace = 'top',
  size = buttonSize.md
}: TooltipDisplayProps) => {
  

  return (
    <>
      <div
        data-tooltip-id={id}
        data-open={true}
        data-tooltip-offset={offset}
        data-tooltip-delay-show={delayShow}
        data-tooltip-delay-hide={closeDelay}
        data-tooltip-place={tooltipPlace}
      >
        {text}
      </div>
      <Tooltip css={style(size)} id={id}>
        {toolTipText}
      </Tooltip>
    </>
  )
}
