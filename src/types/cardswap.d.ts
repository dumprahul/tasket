declare module '@/components/CardSwap' {
  import * as React from 'react'

  export const Card: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >

  export type CardSwapProps = {
    width?: number
    height?: number
    cardDistance?: number
    verticalDistance?: number
    delay?: number
    pauseOnHover?: boolean
    onCardClick?: (index: number) => void
    skewAmount?: number
    easing?: string
    children: React.ReactNode
  }

  const CardSwap: React.FC<CardSwapProps>
  export default CardSwap
}


