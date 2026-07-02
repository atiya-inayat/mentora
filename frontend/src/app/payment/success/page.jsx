"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import Navbar from "@/app/components/shared/Navbar";
import { CheckCircle, Calendar, Clock, DollarSign, User, Loader, AlertCircle } from "lucide-react";
import usePageTitle from "@/lib/hooks/usePageTitle";
import { toast } from "sonner";

function PaymentSuccessContent() {
  usePageTitle("Payment Successful");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("loading");
  const [booking, setBooking] = useState(null);
  const [amount, setAmount] = useState(0);

  const finalizeBooking = async () => {
    try {
      const res = await api.post("/api/payments/confirm", { session_id: sessionId });
      if (res.data.success && res.data.booking) {
        setBooking(res.data.booking);
        setAmount(res.data.amount);
      }
      setStatus("success");
      toast.success("Payment successful! Your session is confirmed.");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    let pollCount = 0;

    const checkPayment = async () => {
      try {
        const res = await api.get(`/api/payments/success?session_id=${sessionId}`);
        if (cancelled) return;

        if (res.data.success && res.data.status === "paid" && res.data.booking) {
          setBooking(res.data.booking);
          setAmount(res.data.amount);
          setStatus("success");
          toast.success("Payment successful! Your session is confirmed.");
          return;
        }

        pollCount++;
        if (pollCount < 15) {
          setTimeout(checkPayment, 1000);
        } else {
          await finalizeBooking();
        }
      } catch {
        if (!cancelled) await finalizeBooking();
      }
    };

    checkPayment();
    return () => { cancelled = true; };
  }, [sessionId]);

  if (!sessionId) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h1 className="text-xl font-semibold text-foreground">Invalid Link</h1>
            <p className="mt-2 text-sm text-muted">No payment session found.</p>
            <Link href="/bookings" className="inline-block mt-6 px-5 py-2.5 text-sm font-medium btn-primary rounded-full">
              Go to Bookings
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        {status === "loading" && (
          <div className="text-center">
            <Loader className="w-8 h-8 mx-auto animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted">Verifying your payment...</p>
          </div>
        )}

        {status === "error" && (
          <div className="p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted">
              We couldn't verify your payment. If you were charged, please contact support.
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <Link href="/bookings" className="px-5 py-2.5 text-sm font-medium btn-primary rounded-full">
                View My Bookings
              </Link>
              <Link href="/dashboard" className="px-5 py-2.5 text-sm font-medium rounded-full bg-surface text-primary border border-white/5 hover:bg-white/[0.06]">
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="w-full max-w-lg">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">Payment Successful!</h1>
              <p className="mt-1 text-muted">Your session has been confirmed.</p>
            </div>

            {booking && (
              <div className="p-6 mt-8 card rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted">Mentor</p>
                    <p className="text-sm font-medium text-foreground">{booking.mentorName || "Your Mentor"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted">Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(booking.startTime).toLocaleDateString("en-US", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted">Time</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(booking.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      {" — "}
                      {new Date(booking.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      <span className="text-xs text-muted ml-1">{booking.timezone}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted">Amount Paid</p>
                    <p className="text-sm font-medium text-foreground">${amount}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-8">
              <Link
                href={`/bookings`}
                className="w-full py-3 text-sm font-medium text-center text-white btn-primary rounded-xl"
              >
                View My Bookings
              </Link>
              <Link
                href="/dashboard"
                className="w-full py-3 text-sm font-medium text-center rounded-xl bg-surface text-primary border border-white/5 hover:bg-white/[0.06]"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
