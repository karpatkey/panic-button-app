import { ethers } from 'ethers'
import { Blockchain } from 'src/config/strategies/manager'
import { chainId } from './executor/mapper'

export function getEthersProvider(blockchain: Blockchain) {
  const { main } = {
    ethereum: {
      production: {
        main: process?.env?.ETHEREUM_RPC_ENDPOINT,
        fallback: process?.env?.ETHEREUM_RPC_ENDPOINT_FALLBACK,
      },
      development: {
        main: `http://${process?.env?.LOCAL_FORK_HOST_ETHEREUM}:${process?.env?.LOCAL_FORK_PORT_ETHEREUM}`,
        fallback: '',
      },
      test: {
        main: '',
        fallback: '',
      },
    },
    gnosis: {
      production: {
        mev: process?.env?.ETHEREUM_RPC_ENDPOINT_MEV,
        main: process?.env?.GNOSIS_RPC_ENDPOINT,
        fallback: process?.env?.GNOSIS_RPC_ENDPOINT_FALLBACK,
      },
      development: {
        main: `http://${process?.env?.LOCAL_FORK_HOST_GNOSIS}:${process?.env?.LOCAL_FORK_PORT_GNOSIS}`,
        fallback: '',
      },
      test: {
        main: '',
        test: '',
      },
    },
  }[blockchain][(process.env.MODE || 'development') as 'development' | 'production']

  const network = chainId(blockchain)
  const options = [network, { staticNetwork: true }] as [
    ethers.Networkish,
    ethers.JsonRpcApiProviderOptions,
  ]
  // console.log({ main, fallback }, options)
  const provider = new ethers.JsonRpcProvider(main, ...options)
  //   [mev, main, fallback]
  //     .filter((url) => url)
  //     .map((url, idx) => ({
  //       priority: idx,
  //       provider: new ethers.JsonRpcProvider(url, ...options),
  //     })),
  // )
  return provider
}
