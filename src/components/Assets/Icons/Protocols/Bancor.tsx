import React from 'react'

const Bancor = (props: any) => (
  <svg
    style={{ width: 'inherit', height: 'inherit' }}
    {...props}
    viewBox="0 0 360 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="180" cy="180" r="180" fill="black" />
    <g clipPath="url(#clip0_1351_724)">
      <path
        d="M173.059 76L121.219 105.958L173.059 136.065L224.899 105.958L173.059 76Z"
        fill="white"
      />
      <path d="M114.254 177.826L165.973 207.682V147.901L114.254 118.046V177.826Z" fill="white" />
      <path d="M114.254 253.737L165.973 283.593V223.812L114.254 193.961V253.737Z" fill="white" />
      <path d="M231.859 177.826L180.141 207.682V147.901L231.859 118.046V177.826Z" fill="white" />
      <path d="M253.009 181.754V241.539L180.148 283.593V223.813L253.009 181.754Z" fill="white" />
    </g>
    <defs>
      <clipPath id="clip0_1351_724">
        <rect width="138.754" height="208.132" fill="white" transform="translate(114.254 76)" />
      </clipPath>
    </defs>
  </svg>
)

export default Bancor
