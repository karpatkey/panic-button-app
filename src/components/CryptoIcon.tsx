import Image from 'next/image'

const WITH_EXT = new Map<string, string>([
  ['aurabal', 'webp'],
  ['aura', 'png'],
  ['wsteth', 'webp'],
  ['xdai', 'webp'],
  ['eure', 'webp'],
  ['agve', 'webp'],
  ['ageur', 'webp'],
  ['gho', 'webp'],
  ['ldo', 'webp'],
])

const SYMLINK = new Map<string, string>([['weth', 'eth']])

export default function CryptoIcon({ symbol, size }: { symbol: string; size?: number }) {
  let name = symbol.toLowerCase()
  name = SYMLINK.get(name) || name
  const s = size || 16
  const ext = WITH_EXT.get(name) || 'svg'
  return <Image src={`/images/crypto/color/${name}.${ext}`} width={s} height={s} alt={symbol} />
}
