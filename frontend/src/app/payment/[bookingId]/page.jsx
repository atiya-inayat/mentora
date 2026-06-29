"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMyBookings } from "@/lib/hooks/useBookings";
import { useInitiatePayment } from "@/lib/hooks/usePayments";
import api from "@/lib/axios";
import Navbar from "@/app/components/shared/Navbar";
import { CreditCard, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

function PaymentForm({ bookingId, onSuccess, onConfirm }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/${bookingId}/success`,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message);
      setProcessing(false);
    } else {
      await onConfirm();
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 border rounded-2xl bg-background border-white/5">
        <PaymentElement />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm rounded-xl bg-red-50 text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 font-medium transition-all btn-primary rounded-xl"
      >
        {processing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const { data: bookingsData } = useMyBookings();
  const { mutate: initiatePayment, isPending, data: paymentData } = useInitiatePayment();
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");

  const booking = (bookingsData?.data || []).find((b) => b._id === bookingId);

  useEffect(() => {
    if (paymentData?.clientSecret) {
      setClientSecret(paymentData.clientSecret);
    }
  }, [paymentData]);

  const handleInitiate = () => {
    setError("");
    initiatePayment(bookingId, {
      onError: (err) => {
        setError(err?.response?.data?.message || "Failed to initiate payment");
      },
    });
  };

  if (!booking) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <p className="text-white/40">Loading booking details...</p>
        </div>
      </main>
    );
  }

  if (booking.status === "payment_held" || booking.status === "completed") {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="w-full max-w-md p-8 text-center glass-card rounded-3xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.06]">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-primary">Payment Complete</h2>
            <p className="mt-2 text-white/60">Your session has been confirmed</p>
            <Link
              href="/my-bookings"
              className="inline-block mt-6 px-5 py-2.5 text-sm font-medium btn-primary rounded-full"
            >
              Back to Bookings
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="px-4 py-12 mx-auto max-w-lg sm:px-6 lg:px-8">
        <Link
          href="/my-bookings"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium transition text-white/40 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to bookings
        </Link>

        <div className="p-8 glass-card rounded-3xl">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-primary font-fugaz">
              Complete Payment
            </h1>
            <p className="mt-1 text-sm text-white/60">Session with {booking.mentorId?.name}</p>
            <p className="text-sm text-white/60">
              {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {!clientSecret ? (
            <div>
              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 text-sm rounded-xl bg-red-50 text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <button
                onClick={handleInitiate}
                disabled={isPending}
                className="w-full py-3 font-medium transition-all btn-primary rounded-xl"
              >
                {isPending ? "Preparing payment..." : "Proceed to Pay"}
              </button>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                bookingId={bookingId}
                onConfirm={() => api.post(`/api/payments/confirm/${bookingId}`)}
                onSuccess={() => router.push("/my-bookings")}
              />
            </Elements>
          )}
        </div>
      </div>
    </main>
  );
}
