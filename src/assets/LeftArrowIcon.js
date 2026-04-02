import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { palette } from "../theme/colors"

function LeftArrowIcon({ color = palette.iconDark, ...props }) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M12.5 15.833L6.667 10 12.5 4.167"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default LeftArrowIcon;
