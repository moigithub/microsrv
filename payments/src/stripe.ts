import Stripe from 'stripe'
console.log('stripekey', process.env.STRIPE_KEY)
export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  //@ts-ignore
  apiVersion: '2020-03-02'
})
