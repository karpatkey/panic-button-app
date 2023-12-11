import CustomTypography from 'src/components/CustomTypography'
import Button from '@mui/material/Button'
import * as React from 'react'
import { AccordionBoxWrapper } from 'src/components/Accordion/AccordionBoxWrapper'
import BoxWrapperRow from 'src/components/Wrappers/BoxWrapperRow'
import { SetupItemStatus, SetupStatus } from 'src/contexts/state'
import { useApp } from 'src/contexts/app.context'
import { Box } from '@mui/material'
import { setSetupConfirm, setSetupConfirmStatus, setSetupStatus } from 'src/contexts/reducers'
import BoxWrapperColumn from 'src/components/Wrappers/BoxWrapperColumn'
import { ethers, TransactionReceipt } from 'ethers'

const WaitingExecutingTransaction = () => {
  return (
    <Box sx={{ width: '100%', paddingTop: '16px', paddingBottom: '16px' }}>
      <CustomTypography variant={'body2'} sx={{ color: 'black' }}>
        Executing transaction...
      </CustomTypography>
    </Box>
  )
}

interface ConfirmProps {
  handleClose: () => void
}

export const Confirm = ({ handleClose }: ConfirmProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { dispatch, state } = useApp()

  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const { blockchain } = state?.setup?.create?.value ?? {}
  const { transaction, decodedTransaction } = state?.setup?.transactionBuild?.value ?? {}
  const transactionBuildStatus = state?.setup?.transactionBuild?.status ?? null
  const transactionCheckStatus = state?.setup?.transactionCheck?.status ?? null
  const simulationStatus = state?.setup?.simulation?.status ?? null
  const confirmStatus = state?.setup?.confirm?.status ?? null
  const txHash = state?.setup?.confirm?.value?.txHash ?? null

  // Get env network data
  const ENV_NETWORK_DATA = state?.envNetworkData ?? {}

  const isDisabled = React.useMemo(
    () =>
      !blockchain ||
      !transaction ||
      !decodedTransaction ||
      transactionBuildStatus !== 'success' ||
      transactionCheckStatus !== 'success' ||
      simulationStatus !== 'success',
    [
      blockchain,
      transaction,
      decodedTransaction,
      transactionBuildStatus,
      transactionCheckStatus,
      simulationStatus
    ]
  )

  const onExecute = React.useCallback(async () => {
    try {
      if (isDisabled) {
        throw new Error('Invalid transaction, please check the transaction and try again.')
      }

      setIsLoading(true)

      const parameters = {
        execution_type: 'execute',
        transaction: transaction,
        blockchain
      }

      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parameters)
      })

      const body = await response.json()

      const { status } = response

      if (status === 500) {
        const errorMessage =
          typeof body?.error === 'string' ? body?.error : 'Error trying to execute the transaction'
        throw new Error(errorMessage)
      }

      const { tx_hash } = body?.data ?? {}

      if (!tx_hash) {
        throw new Error('Error trying to execute transaction')
      }

      // create custom rpc provider with ethers to wait for transaction
      const {
        MODE,
        ETHEREUM_RPC_ENDPOINT,
        GNOSIS_RPC_ENDPOINT,
        LOCAL_FORK_PORT_ETHEREUM,
        LOCAL_FORK_PORT_GNOSIS
      } = ENV_NETWORK_DATA

      let url = blockchain === 'Ethereum' ? ETHEREUM_RPC_ENDPOINT : GNOSIS_RPC_ENDPOINT
      if (MODE === 'development') {
        url =
          blockchain === 'Ethereum'
            ? `https://panic.karpatkey.dev:${LOCAL_FORK_PORT_ETHEREUM}`
            : `https://panic.karpatkey.dev:${LOCAL_FORK_PORT_GNOSIS}`
      }
      const provider = new ethers.JsonRpcProvider(url)

      const receipt: Maybe<TransactionReceipt> = await provider.waitForTransaction(tx_hash)
      const hash = receipt?.hash ?? null
      if (!hash) {
        throw new Error('Error trying to execute transaction')
      }

      dispatch(setSetupConfirm({ txHash: hash }))
      dispatch(setSetupConfirmStatus('success' as SetupItemStatus))
      dispatch(setSetupStatus('confirm' as SetupStatus))
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err as Error)
      dispatch(setSetupConfirmStatus('failed' as SetupItemStatus))
    }

    setIsLoading(false)
  }, [blockchain, transaction, dispatch, isDisabled])

  const color =
    confirmStatus === ('success' as SetupItemStatus)
      ? 'green'
      : confirmStatus === ('failed' as SetupItemStatus)
        ? 'red'
        : 'black'

  return (
    <AccordionBoxWrapper
      gap={2}
      sx={{
        m: 3,
        backgroundColor: 'background.default'
      }}
    >
      <BoxWrapperColumn gap={4} sx={{ width: '100%', marginY: '14px', justifyContent: 'center' }}>
        <BoxWrapperRow sx={{ justifyContent: 'space-between' }}>
          <CustomTypography variant={'body2'}>Confirm</CustomTypography>
          <CustomTypography variant={'body2'} sx={{ color, textTransform: 'capitalize' }}>
            {confirmStatus}
          </CustomTypography>
        </BoxWrapperRow>
        <BoxWrapperRow sx={{ justifyContent: 'flex-end' }} gap={'20px'}>
          {isLoading && <WaitingExecutingTransaction />}
          {confirmStatus === ('failed' as SetupItemStatus) && !isLoading && (
            <CustomTypography variant={'body2'} sx={{ color: 'red', overflow: 'auto' }}>
              {error?.message && typeof error?.message === 'string'
                ? error?.message
                : 'Error trying to execute transaction'}
            </CustomTypography>
          )}
          {txHash && !isLoading && (
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                // open transaction hash in an explorer, if is ethereum in etherscan, if is gnosis in gnosisscan
                const txUrl =
                  blockchain === 'Ethereum'
                    ? `https://etherscan.io/tx/${txHash}`
                    : `https://gnosisscan.io/tx/${txHash}`
                window.open(txUrl, '_blank')
              }}
            >
              Open transaction
            </Button>
          )}
          <Button variant="contained" size="small" onClick={() => handleClose()}>
            Cancel
          </Button>
          {!isLoading && (
            <Button variant="contained" disabled={isDisabled} size="small" onClick={onExecute}>
              Execute
            </Button>
          )}
        </BoxWrapperRow>
      </BoxWrapperColumn>
    </AccordionBoxWrapper>
  )
}
