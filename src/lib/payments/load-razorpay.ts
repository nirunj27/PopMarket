declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      const waitForRazorpay = (attempts = 0) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        if (attempts > 40) {
          resolve(false);
          return;
        }
        window.setTimeout(() => waitForRazorpay(attempts + 1), 50);
      };
      waitForRazorpay();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      const waitForRazorpay = (attempts = 0) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        if (attempts > 40) {
          resolve(false);
          return;
        }
        window.setTimeout(() => waitForRazorpay(attempts + 1), 50);
      };
      waitForRazorpay();
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function openRazorpayCheckout(options: {
  keyId: string;
  orderId: string;
  name: string;
  description: string;
  email: string;
  customerName: string;
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
}) {
  if (!window.Razorpay) return false;

  const rzp = new window.Razorpay({
    key: options.keyId,
    order_id: options.orderId,
    name: options.name,
    description: options.description,
    prefill: { email: options.email, name: options.customerName },
    theme: { color: '#e85d04' },
    handler: (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      void options.onSuccess(response);
    },
  });

  rzp.open();
  return true;
}
