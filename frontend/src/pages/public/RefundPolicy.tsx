import { LegalLayout, LegalNotice } from "./LegalLayout";

export function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy" updated="2026-10-01">
      <p>
        This policy applies to appointments where a consultation fee has been charged through our payment
        gateway. Exact refund percentages are configured by hospital administrators and shown to you at the
        time of cancellation - the scenarios below describe how refund eligibility is determined, not fixed
        amounts.
      </p>

      <h2>Patient-initiated cancellation</h2>
      <p>
        Cancelling before the configured cancellation cutoff (shown on your appointment) is eligible for a
        refund as configured by the hospital. Cancelling after the cutoff may not be eligible for a refund,
        since the slot could no longer be offered to another patient.
      </p>

      <h2>Doctor or hospital-initiated cancellation</h2>
      <p>
        If a doctor or the hospital cancels your appointment (for example, due to unavailability), you are
        eligible for a full refund of any fee paid.
      </p>

      <h2>No-show</h2>
      <p>
        If you do not check in or join your appointment within the grace period, it is marked as a no-show.
        No-show appointments are treated the same as a late patient cancellation for refund purposes.
      </p>

      <h2>Appointment conversion (in-person to online)</h2>
      <p>
        Converting an in-person appointment to an online consultation does not itself trigger a refund or
        additional charge where consultation fees are equal; any fee difference, if applicable, is handled
        according to hospital configuration.
      </p>

      <h2>Technical failure</h2>
      <p>
        If a scheduled online consultation could not take place due to a verified technical failure of the
        Platform or its video provider, you are eligible for a full refund or a free reschedule, at your
        choice.
      </p>

      <h2>Emergency consultation</h2>
      <p>
        Emergency consultation fees, where applicable, are refunded in full if no doctor accepts your
        request before it expires.
      </p>

      <h2>Failed payment</h2>
      <p>
        If a payment fails or is not completed, no appointment is confirmed and no charge is retained. You
        may attempt the booking again.
      </p>

      <h2>How refunds are processed</h2>
      <p>
        Approved refunds are issued to your original payment method through our payment gateway.
        Processing times depend on your bank or payment provider and are outside our direct control.
      </p>

      <LegalNotice />
    </LegalLayout>
  );
}
