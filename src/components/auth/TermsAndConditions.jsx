import React from "react";

/**
 * TermsAndConditions.jsx
 * A self-contained React component (JSX) rendering Terms & Conditions for a vegetarian food ordering app.
 * - Uses Tailwind CSS utility classes for styling.
 * - Accepts props to customize app/company details.
 *
 * Usage:
 * <TermsAndConditions
 *    appName="Scurry"
 *    lastUpdated="October 1, 2025"
 *    city="Mumbai, Maharashtra"
 *    supportEmail="support@scurry.com"
 *    supportPhone="+91-98765-43210"
 *    address="123, Example Street, Mumbai"
 * />
 */

export default function TermsAndConditions({
  appName = "Grill_N_Shakes",
  lastUpdated = "[Insert Date]",
  city = "Navi Mumbai, Maharashtra",
  supportEmail = "support@grillnshakes.shop",
  supportPhone = "8928484618",
  address = "107, Trimurti Residency, Shop No - 1, Plot No, Sector 21, Ulwe, Navi Mumbai, Maharashtra 410206",
  onClose,
}) {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <header className="mb-6">
        <button
          className="mb-4 text-red-500 font-semibold"
          onClick={onClose}
        >
          Close
        </button>
        <h1 className="text-3xl font-semibold mb-1">Terms &amp; Conditions</h1>
        <p className="text-sm text-gray-500">(For Online Food Ordering Application – Vegetarian)</p>
        <p className="text-xs text-gray-400 mt-2">Last Updated: {lastUpdated}</p>
      </header>

      <section className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          Welcome to <strong>{appName}</strong> ("we", "our", "us"). By accessing or using our online food
          ordering application ("App"), website, or services, you ("user", "customer") agree to be bound by the
          following Terms &amp; Conditions. If you do not agree, please do not use our services.
        </p>

        <article>
          <h2 className="text-xl font-medium mb-2">1. Eligibility</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>You must be <strong>18 years or older</strong> to place an order.</li>
            <li>Users under 18 may use the app only under the supervision of a parent or legal guardian.</li>
            <li>
              Our services are primarily for customers located in <strong>India</strong>, but users from other
              countries may access the app. All transactions are governed by <strong>Indian laws</strong>.
            </li>
          </ul>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">2. Nature of Service</h2>
          <p>
            We provide a platform to browse vegetarian food items and place online orders for home delivery or
            takeaway. We reserve the right to modify, update, or discontinue any part of the service without prior
            notice.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">3. User Account &amp; Information</h2>
          <p>
            When creating an account, you must provide accurate and complete information. You are responsible for
            maintaining the confidentiality of your login details. Any activity conducted under your account will be
            considered as done by you.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">4. Vegetarian Food Policy</h2>
          <p>
            Our platform serves <strong>100% vegetarian food only</strong>. No non-vegetarian or alcoholic items are
            listed or delivered.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">5. Ordering &amp; Payment</h2>
          <p>
            Orders placed through the app are considered confirmed only after successful payment (if prepaid), or
            acceptance of the order for Cash on Delivery (if applicable). Prices displayed are inclusive/exclusive of
            taxes as mentioned. We accept the payment methods listed in the app (UPI, Cards, Wallets, COD, etc.).
          </p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">6. Cancellation &amp; Refund Policy</h2>

          <div className="pl-4 space-y-3">
            <div>
              <h3 className="font-semibold">6.1 Cancellation by Customer</h3>
              <p className="text-sm">Orders cannot be cancelled once preparation has started.</p>
            </div>

            <div>
              <h3 className="font-semibold">6.2 Cancellation by Us</h3>
              <p className="text-sm">
                We may cancel an order due to unavailability of items, technical issues, delivery location not
                serviceable, or suspected fraudulent activity. Refunds will be processed in such cases, if applicable.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">6.3 Refund Timeline</h3>
              <p className="text-sm">Refunds for prepaid orders may take 3–7 working days to reflect depending on the bank or gateway.</p>
            </div>
          </div>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">7. Delivery Policy</h2>
          <p>
            Estimated delivery times shown in the app are indicative. Delays may occur due to traffic, weather, or
            unforeseen circumstances. Customer must ensure the correct delivery address and contact number.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            If delivery attempts fail due to incorrect details or unreachable customer, no refund will be issued.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">8. Food Quality &amp; Liability</h2>
          <p>
            We ensure food is prepared hygienically and packed properly. Once delivered, we are not responsible for
            damage due to improper handling by the customer or food spoilage caused by delays in consumption. Photos
            in the app are for representation; actual appearance can vary.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">9. Pricing &amp; Menu Changes</h2>
          <p>We reserve the right to change menu items, prices, offers, and discounts without prior notice.</p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">10. Offers &amp; Discounts</h2>
          <p>
            Offers may be subject to terms like minimum order value, limited validity, or one-time usage. We may modify
            or discontinue promotions at any time.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">11. User Conduct</h2>
          <p>Users must not misuse the app or engage in fraudulent transactions. Violation may result in account suspension or ban.</p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">12. Intellectual Property</h2>
          <p>All content including logos, designs, text, images, and software belongs to {appName}. Users may not copy or modify any part of the app without permission.</p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">13. Third-Party Services</h2>
          <p>We may use third-party payment gateways or delivery partners. We are not responsible for issues caused by such third parties.</p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">14. International Access</h2>
          <p>
            Users outside India may access the app, but services, prices, and availability apply only within India. All
            transactions are governed by Indian laws.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">15. Privacy Policy</h2>
          <p>By using the app, you consent to the collection and use of personal data as described in our Privacy Policy. We comply with applicable Indian data protection laws.</p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">16. Limitation of Liability</h2>
          <p>
            We are not liable for delays in delivery, technical failures, or losses from improper use of the app. Our maximum
            liability is limited to the order value paid by the customer.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">17. Indemnification</h2>
          <p>
            You agree to indemnify and hold us harmless against claims, damages, losses, or expenses arising from your
            misuse of the platform or violation of these terms.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">18. Termination</h2>
          <p>We may suspend or terminate your account for violations, fraud, or misuse. You may also stop using the app at any time.</p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">19. Governing Law &amp; Jurisdiction</h2>
          <p>
            These Terms &amp; Conditions are governed by the <strong>laws of India</strong>. Any disputes shall be subject to
            the exclusive jurisdiction of courts in {city}.
          </p>
        </article>

        <article>
          <h2 className="text-xl font-medium mb-2">20. Contact Us</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Email: <a href={`mailto:${supportEmail}`} className="text-blue-600 underline">{supportEmail}</a></p>
            <p>Phone: <a href={`tel:${supportPhone}`} className="text-blue-600 underline">{supportPhone}</a></p>
            <p>Address: {address}</p>
          </div>
        </article>

        <footer className="mt-6 text-xs text-gray-400">
          <p>
            If you want this document customized with your exact company name, logo, or additional policies (refund
            windows, delivery zones, allergy notes, etc.), pass the details and I will update it.
          </p>
        </footer>
      </section>
    </div>
  );
}
