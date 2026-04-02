import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { palette } from "../theme/colors"

function LocationIcon({ color = palette.teal700, ...props }) {
  return (
    <Svg
      width={30}
      height={30}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.575 6.075c4.1-4.1 10.75-4.1 14.85 0s4.1 10.75 0 14.85L15 28.349l-7.425-7.424c-4.1-4.1-4.1-10.75 0-14.85zM15 16.5a3 3 0 100-6 3 3 0 000 6z"
        fill={color}
      />
    </Svg>
  )
}

export default LocationIcon;
