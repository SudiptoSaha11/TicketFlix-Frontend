// src/PaymentPage.js
import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const stripePromise = loadStripe('pk_test_51PyTTVBPFFoOUNzJLfc5ptRLapKTmjsd0weZJdHrSBV6IvsCafsdthGEsNw92wlp8Agg1VV8fDYqudB4fLLjOymd004Zx6Yw6c');

const safeGet = (key) => {
    try { return JSON.parse(sessionStorage.getItem(key) || 'null'); }
    catch { return null; }
};

// ----- Reusable Promo section (collapsible on mobile, open on desktop) -----
function PromoSection({
    promoOpen, setPromoOpen,
    promoCode, setPromoCode,
    appliedCode, isApplying, error,
    onApply, onRemove, onKeyDown,
}) {
    return (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <button
                type="button"
                onClick={() => setPromoOpen((v) => !v)}
                className="w-full flex items-center justify-between bg-orange-400 text-black px-4 py-2 font-semibold lg:cursor-default"
                aria-expanded={promoOpen}
            >
                <span>Promo Code</span>
                <span
                    className={`lg:hidden inline-block transform transition-transform duration-200 ${promoOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                >
                    <ChevronDownIcon className="h-5 w-5 text-black" />
                </span>
            </button>

            {/* One body: hidden on mobile when collapsed, always visible on lg */}
            <div className={`px-4 pb-4 ${promoOpen ? 'block' : 'hidden'} lg:block`}>
                <div className="text-center my-4">
                    <strong className="font-semibold">
                        Apply for Ticket <span className="text-orange-500">Flix</span> Offer/Discount
                    </strong>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
                    <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        onKeyDown={onKeyDown}
                        placeholder="Enter your offer code"
                        aria-label="Promo code"
                        disabled={!!appliedCode}
                        className={`px-4 py-2 sm:w-[250px] w-full rounded border border-gray-300 shadow-sm transition-colors ${appliedCode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-text'
                            }`}
                    />

                    <button
                        type="button"
                        onClick={appliedCode ? onRemove : onApply}
                        disabled={!appliedCode && isApplying}
                        className={`px-5 py-2.5 rounded font-bold transition text-white ${appliedCode
                                ? 'bg-gray-600 hover:bg-gray-700'
                                : isApplying
                                    ? 'bg-orange-300 cursor-not-allowed'
                                    : 'bg-orange-400 hover:bg-rose-600'
                            }`}
                        title={appliedCode ? 'Change promo code' : 'Apply promo code'}
                    >
                        {appliedCode ? 'Change' : isApplying ? 'Applying…' : 'Apply'}
                    </button>
                </div>

                {appliedCode && (
                    <div className="mt-3 flex justify-center">
                        <div className="flex items-center gap-2 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full w-fit">
                            APPLIED: {appliedCode.code} — Saved Rs.&nbsp;{Number(appliedCode.discount || 0).toFixed(2)}
                            <button onClick={onRemove} className="underline">Remove</button>
                        </div>
                    </div>
                )}

                {error && <div className="text-red-500 text-xs mt-2 text-center">{error}</div>}
            </div>
        </div>
    );
}



const Payment = () => {
    const [summary, setSummary] = useState(null);
    const [showConvenienceDetails, setShowConvenienceDetails] = useState(false);
    const [showAddOnDetails, setShowAddOnDetails] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [food, setFood] = useState([]);
    const [promoCode, setPromoCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [error, setError] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [appliedCode, setAppliedCode] = useState(null); // { code, discount }
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [isPaying, setIsPaying] = useState(false);
    const [missingData, setMissingData] = useState(false);
    const [promoOpen, setPromoOpen] = useState(false); // mobile accordion

    // Clear promo snapshot on navigate away/hide/unmount
    useEffect(() => {
        const clearPromoInStorage = () => {
            sessionStorage.removeItem('appliedPromo');
            const saved = safeGet('paymentSummary');
            if (saved?.summary) {
                const subtotal = Number(saved.summary?.subtotal ?? saved.summary?.subTotal ?? saved.summary?.baseFee ?? 0);
                const foodTotal = Number(saved.summary?.foodTotal ?? saved.summary?.foodFee ?? 0);
                const cfBase = Number(saved.summary?.convenienceFee?.baseFee ?? 0);
                const cfTax = Number(saved.summary?.convenienceFee?.tax ?? 0);
                const cfTotal = Number(saved.summary?.convenienceFee?.total ?? (cfBase + cfTax));
                const finalPayable = Math.max(0, subtotal) + foodTotal + cfTotal;
                sessionStorage.setItem('paymentSummary', JSON.stringify({
                    ...saved,
                    promo: undefined,
                    summary: { ...saved.summary, finalPayable },
                }));
            }
        };
        const onPopState = () => clearPromoInStorage();
        const onPageHide = () => clearPromoInStorage();
        window.addEventListener('popstate', onPopState);
        window.addEventListener('pagehide', onPageHide);
        return () => {
            window.removeEventListener('popstate', onPopState);
            window.removeEventListener('pagehide', onPageHide);
            clearPromoInStorage();
        };
    }, []);

    // Load snapshot
    useEffect(() => {
        const saved = safeGet('paymentSummary');
        if (!saved?.bookingDetails || !saved?.summary) { setMissingData(true); return; }

        setBookingDetails(saved.bookingDetails);
        setFood(saved.food || []);

        const subtotal = Number(saved.summary?.subtotal ?? saved.summary?.subTotal ?? saved.summary?.baseFee ?? 0);
        const foodTotal = Number(saved.summary?.foodTotal ?? saved.summary?.foodFee ?? 0);
        const cfBase = Number(saved.summary?.convenienceFee?.baseFee ?? 0);
        const cfTax = Number(saved.summary?.convenienceFee?.tax ?? 0);
        const cfTot = Number(saved.summary?.convenienceFee?.total ?? (cfBase + cfTax));
        const finalPayable = Number(saved.summary?.finalPayable ?? saved.summary?.total ?? (subtotal + foodTotal + cfTot));

        setSummary({ subtotal, foodTotal, convenienceFee: { baseFee: cfBase, tax: cfTax, total: cfTot }, finalPayable });

        const restored = safeGet('appliedPromo');
        if (restored?.code) { setAppliedCode(restored); setDiscountAmount(Number(restored.discount || 0)); }
    }, []);

    // Recompute final payable when inputs change
    useEffect(() => {
        if (!summary) return;
        const subtotal = Number(summary?.subtotal ?? summary?.subTotal ?? 0);
        const extras = Number(summary?.foodTotal ?? 0) + Number(summary?.convenienceFee?.total ?? 0);
        const discount = Number(appliedCode?.discount ?? 0);
        const newPayable = Math.max(0, subtotal - discount) + extras;
        setSummary(prev => prev && prev.finalPayable !== newPayable ? { ...prev, finalPayable: newPayable } : prev);
    }, [summary?.subtotal, summary?.subTotal, summary?.foodTotal, summary?.convenienceFee?.total, appliedCode?.discount]);

    const onPromoKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyPromo(); } };

    const handleApplyPromo = async () => {
        const code = (promoCode || '').trim().toUpperCase();
        const subtotal = Number(summary?.subtotal ?? summary?.subTotal ?? 0);
        const extras = Number(summary?.foodTotal ?? 0) + Number(summary?.convenienceFee?.total ?? 0);
        if (!code) return setError('Please enter a promo code');
        if (!Number.isFinite(subtotal) || subtotal <= 0) return setError('Invalid subtotal');

        try {
            setIsApplying(true); setError('');
            const response = await axios.post('http://localhost:5000/api/promocode/apply', { code, orderTotal: subtotal });
            const data = response.data;
            const discount = Number(data.discount ?? data.discountAmount ?? 0);
            const finalPayable = Math.max(0, subtotal - discount) + extras;

            setAppliedCode({ code, discount });
            setDiscountAmount(discount);
            setSummary(prev => ({ ...prev, finalPayable }));

            sessionStorage.setItem('appliedPromo', JSON.stringify({ code, discount }));
            sessionStorage.setItem('paymentSummary', JSON.stringify({
                summary: { ...summary, finalPayable },
                bookingDetails, food, promo: { code, discount },
            }));
        } catch (err) {
            setAppliedCode(null); setDiscountAmount(0);
            setError(err.response?.data?.error || err.message || 'Could not apply promo');
            sessionStorage.removeItem('appliedPromo');
        } finally {
            setIsApplying(false);
        }
    };

    const removePromo = () => {
        const subtotal = Number(summary?.subtotal ?? summary?.subTotal ?? 0);
        const extras = Number(summary?.foodTotal ?? 0) + Number(summary?.convenienceFee?.total ?? 0);
        setAppliedCode(null); setPromoCode(''); setDiscountAmount(0);
        setSummary(prev => ({ ...prev, finalPayable: subtotal + extras }));
        sessionStorage.removeItem('appliedPromo');
        const saved = safeGet('paymentSummary');
        if (saved?.summary) {
            sessionStorage.setItem('paymentSummary', JSON.stringify({
                ...saved, promo: undefined, summary: { ...saved.summary, finalPayable: subtotal + extras },
            }));
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
          if (document.getElementById('razorpay-sdk')) return resolve(true);
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.id = 'razorpay-sdk';
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error('Razorpay SDK failed to load.'));
          document.body.appendChild(script);
        });
      };

      const handlePayClick = async () => {
        try {
          setIsPaying(true);
          if (paymentMethod === 'stripe') await handlePayment(); // existing Stripe call
          else if (paymentMethod === 'razorpay') await handleRazorpayPayment();
        } finally {
          setIsPaying(false);
        }
      };
      
      const handleRazorpayPayment = async () => {
        try {
          const finalAmount = Number(summary?.finalPayable ?? summary?.total ?? 0);
          if (!finalAmount || finalAmount <= 0) throw new Error('Invalid amount');
      
          // prepare payload similar to Stripe create-checkout-session (so notes have booking info)
          const promo = appliedCode || safeGet('appliedPromo');
          const payload = { Name: bookingDetails?.Name, seats: bookingDetails?.seats, food, totalAmount: finalAmount, promo, bookingDate: bookingDetails?.date };
      
          // 1) create order on server
          const resp = await fetch('http://localhost:5000/api/razorpay/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const order = await resp.json();
          if (!resp.ok) throw new Error(order.error || 'Failed to create Razorpay order');
      
          // 2) load SDK
          await loadRazorpayScript();
      
          // 3) open Razorpay Checkout
          const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;if (!RAZORPAY_KEY) throw new Error('Missing REACT_APP_RAZORPAY_KEY_ID');
          
          const options = {
            key: RAZORPAY_KEY,              // ← MUST be the real publishable key like rzp_test_...
            amount: order.amount,
            currency: order.currency || 'INR',
            name: bookingDetails?.Name || 'Ticketflix',
            description: `Booking - ${bookingDetails?.Name || ''}`,
            order_id: order.id,
            prefill: {
              name: bookingDetails?.userName || localStorage.getItem('userName') || '',
              email: localStorage.getItem('userEmail') || '',
              contact: localStorage.getItem('userPhone') || ''
            },
            handler: async function (response) {
                console.log('Razorpay handler response:', response);
                const paymentId = response.razorpay_payment_id;
                try {
                  // Try to verify immediately on server (best-effort)
                  const verifyResp = await fetch('http://localhost:5000/api/razorpay/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(response),
                  });
                  const verifyJson = await verifyResp.json().catch(()=>null);
                  console.log('verify-response', verifyResp.status, verifyJson);
              
                  if (!verifyResp.ok) {
                    // Log but continue — webhook or SuccessPage will reconcile
                    console.warn('Server returned non-OK for verify-payment; proceeding to success page. See server logs.');
                  }
                } catch (err) {
                  console.error('Network/error during verify-payment:', err);
                  // proceed to SuccessPage anyway
                }
              
                // Always redirect to SuccessPage (so SuccessPage can fetch payment and save booking)
                // We include provider=razorpay and payment_id so SuccessPage knows how to confirm
                window.location.href = `/success?payment_id=${encodeURIComponent(paymentId)}&provider=razorpay`;
              },              
            modal: { ondismiss: () => console.log('checkout closed') }
          };
      
          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (err) {
          console.error('Razorpay flow error:', err);
          alert(err.message || 'Payment failed');
        }
      };

    const handlePayment = async () => {
        try {
            const finalAmount = Number(summary?.finalPayable ?? summary?.total ?? 0);
            const promo = appliedCode || safeGet('appliedPromo');
            const resp = await fetch('http://localhost:5000/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Name: bookingDetails?.Name, seats: bookingDetails?.seats, food, totalAmount: finalAmount, promo }),
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Stripe session error');
            const stripe = await stripePromise;
            await stripe.redirectToCheckout({ sessionId: data.id });
        } catch (err) {
            console.error('Payment Error:', err.message);
        }
    };

    if (missingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-6 rounded-xl shadow w-full max-w-md text-center">
                    <h2 className="text-lg font-semibold mb-2">We couldn’t find your booking summary</h2>
                    <p className="text-sm text-gray-600">Please start your booking again. If you used the Back button, the promo was cleared for safety.</p>
                </div>
            </div>
        );
    }
    if (!summary || !bookingDetails) return <div>Loading...</div>;

    // Reusable Order Summary card
    const OrderSummaryCard = (
        <div className="bg-white p-4 rounded shadow border border-gray-200">
            <h2 className="font-bold text-lg mb-2 border-b pb-2">ORDER SUMMARY</h2>
            <div className="flex justify-between items-start mb-1">
                <h2 className="font-semibold text-base text-gray-800">
                    {bookingDetails.Name} - ({bookingDetails.Language})
                </h2>
                <span className="text-sm text-gray-700">{bookingDetails.seats.length} Tickets</span>
            </div>
            <p className="text-xs text-gray-500">{bookingDetails.Language}</p>
            <p className="text-xs text-gray-500">{bookingDetails.Venue}</p>
            <div className="text-sm">
                {bookingDetails.seats.map((seat) => seat.seatNumber).join(', ')}<br />
                {new Date(bookingDetails.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="text-xs">{bookingDetails.Time}</div>

            <hr className="my-2" />
            <div className="text-sm text-gray-700 space-y-2">
                <div className="flex justify-between">
                    <span>Sub Total</span>
                    <span className="whitespace-nowrap">Rs.&nbsp;{(Number(summary.subtotal) || 0).toFixed(2)}</span>
                </div>

                {appliedCode && (
                    <div className="flex justify-between text-green-700">
                        <span>Discount ({appliedCode.code})</span>
                        <span className="whitespace-nowrap">- Rs.&nbsp;{Number(appliedCode.discount).toFixed(2)}</span>
                    </div>
                )}

                {Number(summary.foodTotal) > 0 && (
                    <>
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-800">
                                + Add-ons{' '}
                                <button
                                    onClick={() => setShowAddOnDetails(!showAddOnDetails)}
                                    className="text-orange-500 font-medium focus:outline-none"
                                >
                                    {showAddOnDetails ? 'Hide All' : 'View All'}
                                </button>
                            </div>
                            <span className="text-sm text-gray-800 whitespace-nowrap">
                                Rs.&nbsp;{(Number(summary.foodTotal) || 0).toFixed(2)}
                            </span>
                        </div>
                        {showAddOnDetails && (
                            <div className="ml-4 mt-2 space-y-1 text-xs text-gray-700">
                                {food.map((item, index) => (
                                    <div key={index} className="flex justify-between">
                                        <span>{item.beverageName} ({item.size}) x{item.quantity}</span>
                                        <span className="whitespace-nowrap">Rs.&nbsp;{Number(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div className="mt-3">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-800">
                            + Convenience fees{' '}
                            <button
                                onClick={() => setShowConvenienceDetails(!showConvenienceDetails)}
                                className="text-orange-500 font-medium focus:outline-none"
                            >
                                {showConvenienceDetails ? 'Hide tax breakup' : 'Show tax breakup'}
                            </button>
                        </span>
                        <span className="whitespace-nowrap">
                            Rs.&nbsp;{(Number(summary.convenienceFee?.total) || 0).toFixed(2)}
                        </span>
                    </div>

                    {showConvenienceDetails && (
                        <div className="ml-4 mt-2 space-y-1 text-xs text-gray-700">
                            <div className="flex justify-between">
                                <span>Base Fee</span>
                                <span className="whitespace-nowrap">Rs.&nbsp;{(Number(summary.convenienceFee?.baseFee) || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span className="whitespace-nowrap">Rs.&nbsp;{(Number(summary.convenienceFee?.tax) || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <hr className="my-3" />
            <div className="flex justify-between font-bold text-lg">
                <span>Amount Payable</span>
                <span className="whitespace-nowrap">Rs.&nbsp;{(Number(summary.finalPayable || summary.total) || 0).toFixed(2)}</span>
            </div>
        </div>
    );

    return (
        <div id="super-container" className="min-h-screen flex flex-col bg-gray-200">
            {/* Header */}
            <header className="w-full bg-white shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Ticket<span className="text-orange-500">flix</span>
                    </h1>
                </div>
            </header>

            {/* Content */}
            <main id="upper" className="flex-1 w-full max-w-5xl mx-auto px-4 pt-6 pb-24 sm:pb-6">
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    {/* MOBILE: Order Summary on top */}
                    <div className="lg:hidden">{OrderSummaryCard}</div>

                    {/* LEFT: Promo + Payment (spans 2 on desktop) */}
                    <section className="lg:col-span-2 space-y-6 min-w-0">
                        <PromoSection
                            promoOpen={promoOpen}
                            setPromoOpen={setPromoOpen}
                            promoCode={promoCode}
                            setPromoCode={setPromoCode}
                            appliedCode={appliedCode}
                            isApplying={isApplying}
                            error={error}
                            onApply={handleApplyPromo}
                            onRemove={removePromo}
                            onKeyDown={onPromoKeyDown}
                        />

                        {/* Payment Options */}
                        <div className="bg-white border border-gray-200 rounded">
                            <div className="bg-orange-400 text-black px-4 py-2 font-semibold">Payment Options</div>

                            <div className="space-y-4 p-4">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="stripe"
                                        className="accent-rose-500"
                                        checked={paymentMethod === 'stripe'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <img src="/stripe.png" alt="Stripe" className="h-10 w-auto" />
                                    <span className="text-gray-800 font-medium">Pay with Stripe</span>
                                </label>

                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="razorpay"
                                        className="accent-rose-500"
                                        checked={paymentMethod === 'razorpay'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <img src="/razorpay.jpg" alt="Razorpay" className="h-6 w-auto" />
                                    <span className="text-gray-800 font-medium">Pay with Razorpay</span>
                                </label>

                                {/* Desktop / tablet Pay button (mobile uses the fixed bar) */}
                                {paymentMethod && (
                                    <button
                                        type="button"
                                        onClick={handlePayClick}
                                        disabled={isPaying || isApplying}
                                        className={`hidden md:block w-full mt-2 px-5 py-3 rounded-lg font-bold text-white transition ${isPaying || isApplying
                                                ? 'bg-gray-300 cursor-not-allowed'
                                                : paymentMethod === 'stripe'
                                                    ? 'bg-indigo-600 hover:bg-indigo-700'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                        title={`Pay Rs. ${(Number(summary.finalPayable ?? summary.total) || 0).toFixed(2)}  ${paymentMethod === 'stripe' ? 'Stripe' : 'Razorpay'}`}
                                    >
                                        {isPaying
                                            ? 'Processing…'
                                            : `Pay Rs. ${(Number(summary.finalPayable ?? summary.total) || 0).toFixed(2)} with ${paymentMethod === 'stripe' ? 'Stripe' : 'Razorpay'}`}
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* DESKTOP: Order Summary on the right */}
                    <aside className="hidden lg:block lg:col-span-1 min-w-0">
                        {OrderSummaryCard}
                    </aside>
                </div>
            </main>

            {/* Mobile fixed pay bar */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-md">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="text-sm">
                        <div className="font-semibold">Amount Payable</div>
                        <div className="text-gray-700">
                            Rs.&nbsp;{(Number(summary.finalPayable || summary.total) || 0).toFixed(2)}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handlePayClick}
                        disabled={!paymentMethod || isPaying || isApplying}
                        className={`px-5 py-2 rounded-lg font-bold text-white transition ${!paymentMethod || isPaying || isApplying
                                ? 'bg-gray-300 cursor-not-allowed'
                                : paymentMethod === 'stripe'
                                    ? 'bg-indigo-600 hover:bg-indigo-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isPaying
                            ? 'Processing…'
                            : `Pay with ${paymentMethod ? (paymentMethod === 'stripe' ? 'Stripe' : 'Razorpay') : '—'}`}
                    </button>
                </div>
            </div>

            {/* Desktop footer (hidden on mobile) */}
            <footer id="lower" className="hidden sm:block w-full bg-white shadow-sm">
                <div className="w-full max-w-5xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl font-semibold text-gray-900">
                            Ticket<span className="text-orange-500">flix</span>
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Note:</p>
                    <ol className="list-decimal ml-5 mt-1 space-y-1 text-xs text-gray-600">
                        <li>Registrations/Tickets once booked cannot be exchanged, cancelled or refunded.</li>
                        <li>For card bookings, the card and card holder must be present at the counter while collecting the tickets.</li>
                    </ol>
                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                        <img src="/visa.png" alt="Visa" className="h-6 w-auto" />
                        <img src="/rupay.png" alt="RuPay" className="h-6 w-auto" />
                        <img src="/amex.png" alt="Amex" className="h-6 w-auto" />
                        <img src="/mastercard.png" alt="Mastercard" className="h-6 w-auto" />
                        <img src="/upi.png" alt="UPI" className="h-6 w-auto" />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Payment;
