// /functions/createCheckout.js  (Netlify)  OR  /api/create-checkout.js (Vercel)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    // Choose the Stripe Price ID based on ad-length
    const priceId =
      body.ad_length === '15'
        ? 'price_1RkJgmGpLRbn2cvI1NimEhQD' // 15-second ad
        : body.ad_length === '30'
        ? 'price_1RkJhDGpLRbn2cvIv3QP1dF2' // 30-second ad
        : (() => {
            throw new Error('Invalid ad length selected');
          })();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        ad_length: body.ad_length,
        full_name: body.full_name,
        company: body.company,
        company_website: body.company_website,
        phone: body.phone,
      },
      success_url: `${process.env.SITE_URL}/success.html`,
      cancel_url: `${process.env.SITE_URL}/cancel.html`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
