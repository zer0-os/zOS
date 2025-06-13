import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useMutation } from '@tanstack/react-query';
import { BillingDetails } from '.';
import { post } from '../../../../lib/api/rest';

export function useZeroProSubscription(billingDetails: BillingDetails | null) {
  const stripe = useStripe();
  const elements = useElements();

  const {
    mutateAsync: subscribe,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: async () => {
      if (!stripe || !elements || !billingDetails) {
        throw new Error('Stripe is not loaded or billing details missing.');
      }

      // Create payment method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card input not found.');
      }

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          address: {
            line1: billingDetails.address,
            city: billingDetails.city,
            postal_code: billingDetails.postalCode,
            country: billingDetails.country,
          },
        },
      });

      if (pmError || !paymentMethod) {
        throw new Error(pmError?.message || 'Failed to create payment method.');
      }

      // Call backend using post utility
      const response = await post('/zero-pro').send({
        billingDetails: {
          email: billingDetails.email,
          name: billingDetails.name,
          address: {
            line1: billingDetails.address,
            city: billingDetails.city,
            postal_code: billingDetails.postalCode,
            country: billingDetails.country,
          },
        },
        paymentMethodId: paymentMethod.id,
      });

      const { clientSecret } = response.body;

      // Confirm payment with Stripe
      const confirmResult = await stripe.confirmCardPayment(clientSecret);
      if (confirmResult.error) {
        throw new Error(confirmResult.error.message || 'Payment failed.');
      }

      if (confirmResult.paymentIntent?.status === 'succeeded') {
        return true;
      } else {
        throw new Error('Payment not completed.');
      }
    },
  });

  return {
    subscribe,
    isLoading,
    error: error instanceof Error ? error.message : error,
  };
}
