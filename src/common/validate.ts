export const TRC20IsValid = (tcr20: string) => {
  const pattern = /.+/;
  return pattern.test(tcr20);
}