import { Keypair } from '@solana/web3.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bs58 = require('bs58');

export const DEVNET_MINT_1 = 'Fngc3zEeAvcE5yLXBjJrYe2cPSgkzXpfzsktXutgpSRE';
export const DEVNET_MINT_2 = 'Fngc3zEeAvcE5yLXBjJrYe2cPSgkzXpfzsktXutgpSRE';
export const DEVNET_MINT_3 = 'Fngc3zEeAvcE5yLXBjJrYe2cPSgkzXpfzsktXutgpSRE';

export const DEVNET_WALLET_PUBLIC_KEY_1 =
  'J1YW3BL5rB4syzmNnaZW8VFDzUjbXdBw5YCzmXSqUQXe';
export const DEVNET_WALLET_PRIVATE_KEY_1 =
  '2qEza21TGioa5aj9dggfZuSDz11MJtWYrkDJJyFTd5Jmmbr47aVjhMfeC5Uah9NpzZ5UXXPBzL4uVQSTwynHmerx';
export const DEVNET_KEYPAIR_1 = Keypair.fromSecretKey(
  bs58.decode(DEVNET_WALLET_PRIVATE_KEY_1),
);

export const DEVNET_WALLET_PUBLIC_KEY_2 =
  '33LNAPXLGXdRnnjc6Jsm5mx5PYu9BBvTKufvgDmAWczE';
export const DEVNET_WALLET_PRIVATE_KEY_2 =
  'ExroLA4uw5cPL5P9bdo6xNe8QDRhdjMBAo28aztXyikEcYXjkw4URQjS3L5UV2PBwd4tVp23zurHuJykSeBxqcv';
export const DEVNET_KEYPAIR_2 = Keypair.fromSecretKey(
  bs58.decode(DEVNET_WALLET_PRIVATE_KEY_2),
);

export const DEVNET_WALLET_PUBLIC_KEY_3 =
  'GpZmdZepiGG8kvYg5G8JwBUww7mXDfQpwxUvYarHnt78';
export const DEVNET_WALLET_PRIVATE_KEY_3 =
  '3e48sJWPCxcyRBsKviZqsHNMRgKAmKsgLy9bLkU14o6bSKYX7Ku8cUqeCC3xfMuR6KzG6Whkd7rCVXe6mmztY4Dk';
export const DEVNET_KEYPAIR_3 = Keypair.fromSecretKey(
  bs58.decode(DEVNET_WALLET_PRIVATE_KEY_3),
);
