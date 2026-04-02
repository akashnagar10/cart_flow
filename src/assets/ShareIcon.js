import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { palette } from "../theme/colors"

function ShareIcon({ color = palette.iconMuted, ...props }) {
  return (
    <Svg
      width={17}
      height={17}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M5.737 9.618A2.49 2.49 0 006 8.5a2.49 2.49 0 00-.263-1.118m0 2.236a2.5 2.5 0 110-2.236m0 2.236l5.526 2.764m-5.526-5l5.526-2.764m0 0a2.5 2.5 0 104.472-2.237 2.5 2.5 0 00-4.472 2.237zm0 7.764a2.5 2.5 0 104.473 2.237 2.5 2.5 0 00-4.473-2.237z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default ShareIcon;
