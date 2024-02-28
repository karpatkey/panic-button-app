function accessKey() {
  return process.env.DEBANK_API_KEY || ''
}

function wait(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

const MAX_RETRIES = 3
function retryBackoff(retriesLeft: number) {
  const randomPart = (Math.floor(Math.random() * 3) + 1) * 100
  const extraSecondPerRetry = (MAX_RETRIES - retriesLeft) * 1000
  return extraSecondPerRetry + randomPart
}

async function getDebankWalletData(wallet: string, retriesLeft: number = MAX_RETRIES) {
  try {
    const url = `https://pro-openapi.debank.com/v1/user/all_complex_protocol_list?id=${wallet}`
    const headers = { accept: 'application/json', AccessKey: accessKey() }
    const response = await fetch(url, { headers })
    const data = await response.json()
    return data
  } catch (error) {
    if (retriesLeft > 0) {
      const backoff = retryBackoff(retriesLeft)
      console.log(`Retrying Debank call ${wallet} in ${Math.round(backoff / 1000)}ms`)
      await wait(backoff)
      return await getDebankWalletData(wallet, retriesLeft - 1)
    } else {
      throw error
    }
  }
}

async function transformData(wallet: string, data: any) {
  return {
    positions: data,
    wallet: wallet
  }
}

export async function getPositions(wallets: string[]) {
  const processWallet = (wallet: string) =>
    getDebankWalletData(wallet).then((data) => transformData(wallet, data))
  const data = await Promise.all(wallets.map(processWallet))

  console.log(JSON.stringify(data, null, 1))
  // console.log(data)
}

getPositions([
  '0x849D52316331967b6fF1198e5E32A0eB168D039d',
  '0x4971DD016127F390a3EF6b956Ff944d0E2e1e462'
])
