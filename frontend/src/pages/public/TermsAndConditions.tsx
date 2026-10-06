import { LegalLayout, LegalNotice } from "./LegalLayout";

export function TermsAndConditions() {
  return (
    <LegalLayout title="Terms and Conditions" updated="2026-10-01">
      <p>
        These Terms govern your use of CareLine (operated by CONFIGURE_ORGANIZATION_NAME). By creating an
        account, you agree to these Terms.
      </p>

      <h2>Account responsibilities</h2>
      <p>
        You are responsible for the accuracy of the information you provide and for keeping your login
        credentials confidential. Notify us immediately of any unauthorized use of your account.
      </p>

      <h2>Appointments, cancellation and rescheduling</h2>
      <p>
        Appointments may be cancelled or rescheduled subject to the cutoff windows shown at the time of
        booking (by default, at least 2 hours before the scheduled time). Cancellations made after the
        cutoff may not be eligible for a full refund where a consultation fee applies - see our{" "}
        <a href="/refund-policy">Refund Policy</a>.
      </p>

      <h2>No-show policy</h2>
      <p>
        If you do not check in (in-person) or join the video consultation (online) within the grace period
        shown for your appointment, it may automatically be marked as a no-show. No-show appointments are
        subject to the Refund Policy and are not eligible for automatic rescheduling.
      </p>

      <h2>Online consultations</h2>
      <p>
        Online consultations are provided through a third-party video platform. You are responsible for
        having a working camera, microphone and internet connection. CareLine is not responsible for
        consultation disruptions caused by your network or device.
      </p>

      <h2>Emergency consultation - important limitation</h2>
      <p>
        The Emergency Consultation feature connects you with an available doctor for teleconsultation on a
        best-effort basis. It does <strong>not</strong> guarantee immediate availability, does not provide
        emergency medical treatment, and is not a replacement for local emergency medical services. In a
        genuine medical emergency, contact your local emergency number or go to the nearest emergency
        facility immediately.
      </p>

      <h2>User responsibilities</h2>
      <ul>
        <li>Provide accurate medical information to the best of your knowledge.</li>
        <li>Use the Platform only for its intended purpose of scheduling and attending consultations.</li>
        <li>Do not attempt to access another user's account, medical records, or appointments.</li>
      </ul>

      <h2>Prohibited activities</h2>
      <p>
        You may not use the Platform to misrepresent your identity, impersonate a medical professional
        without appropriate verification, upload malicious files, or attempt to circumvent security
        controls.
      </p>

      <h2>Payments and refunds</h2>
      <p>
        Where a consultation fee applies, payment is processed through our payment gateway at the time of
        booking. See our <a href="/refund-policy">Refund Policy</a> for cancellation, no-show and failure
        scenarios.
      </p>

      <h2>Platform limitations</h2>
      <p>
        CareLine is an appointment and teleconsultation management platform. It does not provide medical
        diagnosis, treatment, or guarantee the accuracy of information doctors enter. Clinical decisions
        remain the responsibility of the treating doctor.
      </p>

      <h2>Liability limitations</h2>
      <p>
        To the extent permitted by applicable law, CareLine is not liable for indirect damages arising from
        use of the Platform, third-party service outages (video or payment providers), or reliance on the
        Emergency Consultation feature as a substitute for emergency services. CONFIGURE_LIABILITY_CLAUSE -
        requires legal review for your jurisdiction.
      </p>

      <h2>Contact</h2>
      <p>For questions about these Terms, contact CONFIGURE_CONTACT_EMAIL.</p>

      <LegalNotice />
    </LegalLayout>
  );
}
