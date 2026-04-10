// emails/couponTemplate.js

export const couponTemplate = (coupon) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>🎉 New Offer Just Dropped!</h2>

      <p>Use code:</p>
      <h1 style="color: #e63946;">${coupon.code}</h1>

      <p>Get amazing discounts on your next order.</p>

      <a href="http://localhost:5173"
         style="padding: 10px 20px; background: black; color: white; text-decoration: none;">
         Shop Now
      </a>

      <p style="margin-top:20px; font-size:12px;">
        If you don't want these emails, you can unsubscribe anytime.
      </p>
    </div>
  `;
};
