/**
 * Splits an expense amount equally among a list of user IDs.
 * Handles rounding so the sum of splits always equals the total amount
 * (any leftover cents go to the first member(s)).
 */
function splitEqually(amount, userIds) {
  const n = userIds.length;
  if (n === 0) return [];

  const baseShare = Math.floor((amount / n) * 100) / 100;
  const totalBase = baseShare * n;
  let remainder = Math.round((amount - totalBase) * 100) / 100;

  return userIds.map((userId, idx) => {
    let amountOwed = baseShare;
    // distribute leftover cents (in 0.01 increments) to the first few members
    if (remainder > 0) {
      amountOwed = Math.round((amountOwed + 0.01) * 100) / 100;
      remainder = Math.round((remainder - 0.01) * 100) / 100;
    }
    return { user: userId, amountOwed, settled: false };
  });
}

function splitCustom(customSplits) {
  return customSplits.map((s) => ({
    user: s.user,
    amountOwed: Number(s.amountOwed),
    settled: false,
  }));
}

module.exports = { splitEqually, splitCustom };
