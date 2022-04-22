export const TRC20IsValid = (tcr20: string) => {
  const pattern = /^\d+$/;
  return pattern.test(tcr20);
}

export const WalletIsValid = (wallet: string) => {
  const pattern = /^\d+$/;
  return pattern.test(wallet);
}