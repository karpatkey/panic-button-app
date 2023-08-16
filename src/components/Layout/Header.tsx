import LogoKarpatkey from 'src/components/LogoKarpatkey'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import React from 'react'

export const HEADER_HEIGHT = 100

const Header = () => {
  return (
    <BoxWrapperRow
      sx={{
        backgroundColor: 'background.default',
        justifyContent: 'space-between',
        paddingX: '26px',
        paddingRight: '48px',
        paddingLeft: '48px',
        height: HEADER_HEIGHT
      }}
    >
      <LogoKarpatkey />
      <>Connection should be here</>
    </BoxWrapperRow>
  )
}

export default Header
