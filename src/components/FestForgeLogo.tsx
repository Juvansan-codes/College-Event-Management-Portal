import React from 'react'

interface LogoProps {
  size?: number
}

const FestForgeLogo: React.FC<LogoProps> = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="1" y="1" width="8" height="8" rx="2" fill="#111" />
    <rect x="13" y="1" width="8" height="8" rx="2" fill="#111" />
    <rect x="1" y="13" width="8" height="8" rx="2" fill="#111" />
    <rect x="13" y="13" width="8" height="8" rx="2" fill="#bbb" />
  </svg>
)

export default FestForgeLogo
