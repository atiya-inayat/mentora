import { z } from "zod";

// Payment endpoints use Stripe Checkout — no body validation needed for create-checkout
// Webhook uses raw body for Stripe signature verification
