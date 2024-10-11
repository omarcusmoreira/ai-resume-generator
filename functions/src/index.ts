import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { updateUserPlanInFirebase } from './subscriptionManagement';
import Stripe from 'stripe';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize Stripe
const stripeSecretKey = functions.config().stripe.secret_key;
const stripe = new Stripe(stripeSecretKey);  // Make sure to set the Stripe API version

// Webhook Secret Key (for verification)
const webhookSecretKey = functions.config().stripe.webhook_secret;

// Export the stripeWebhook function
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
    let event: Stripe.Event;
  
    try {
      // Verify the webhook signature using Stripe's constructEvent method
      const signature = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.rawBody, signature!, webhookSecretKey);
      //eslint-disable-next-line
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return; // Ensure we return after sending a response
    }
  
    // Process only specific events like 'invoice.payment_succeeded'
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
  
      // Extract relevant details from the invoice
      const customerId = invoice.customer as string;
      const subscriptionId = invoice.subscription as string;
  
      // Retrieve subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
      // Use the subscription's plan ID
      const planId = subscription.items.data[0].plan.id;
  
      // Update user plan in Firebase
      try {
        await updateUserPlanInFirebase(customerId, planId, subscription);
        res.status(200).send('Subscription updated successfully.');
        return; // Ensure we return after sending a response
      } catch (err) {
        console.error('Failed to update user plan in Firebase.', err);
        res.status(500).send('Internal Server Error.');
        return; // Ensure we return after sending a response
      }
    } else {
      // Return 200 for other events to acknowledge receipt
      res.status(200).send('Event received.');
      return; // Ensure we return after sending a response
    }
  });
  
