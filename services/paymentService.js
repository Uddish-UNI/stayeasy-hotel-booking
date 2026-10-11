// Mock payment gateway. It behaves like a real gateway's test mode: certain well-known
// test card numbers (published in Stripe's testing documentation) trigger specific failures.
const FAILURE_CARDS = {
  '4000000000000002': 'Your card was declined.',
  '4000000000009995': 'Your card has insufficient funds.',
  '4000000000000069': 'Your card has expired.',
  '4000000000000127': "Your card's security code is incorrect.",
  '4000000000000119': 'An error occurred while processing your card. Please try again.',
};

export async function processPayment({ cardNumber, amount }) {
  // Pretend to wait for the bank.
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const digits = cardNumber.replace(/\s/g, '');
  if (FAILURE_CARDS[digits]) {
    return { success: false, message: FAILURE_CARDS[digits] };
  }
  return { success: true, transactionId: 'TXN' + Date.now() };
}