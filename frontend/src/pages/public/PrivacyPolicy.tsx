import { LegalLayout, LegalNotice } from "./LegalLayout";

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="2026-10-01">
      <p>
        This Privacy Policy explains what personal and medical information CareLine ("the Platform",
        operated by CONFIGURE_ORGANIZATION_NAME) collects, why, and how it is used, stored and protected.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account information: name, email, phone number, password (stored as a salted hash, never in plain text).</li>
        <li>Patient medical context you choose to provide: problem description, symptoms, relevant medical history, current medications, and uploaded medical reports.</li>
        <li>Appointment and consultation records, including prescriptions issued by your doctor.</li>
        <li>Technical data needed to operate the service: login timestamps, IP address for security/audit purposes, and session cookies.</li>
      </ul>

      <h2>Why we collect it</h2>
      <p>
        Data is collected only for purposes directly necessary to provide the service: creating your
        account, enabling doctors to review relevant medical context before a consultation, scheduling and
        conducting appointments, and maintaining the security of the Platform. We do not collect data we do
        not need for these purposes.
      </p>

      <h2>Who can access it</h2>
      <ul>
        <li>You, for your own data at all times.</li>
        <li>A doctor you have booked an appointment with, limited to the medical context relevant to that consultation.</li>
        <li>Hospital administrators, for operational management - not for browsing medical content without cause.</li>
        <li>Service providers strictly necessary to operate the Platform (see "Third-party services" below), under contractual confidentiality obligations.</li>
      </ul>

      <h2>Third-party services</h2>
      <p>
        We use a video consultation provider to host online appointments, a payment gateway to process
        consultation fees, and infrastructure providers (database and file storage) to run the Platform.
        Each receives only the data necessary for its function. CONFIGURE_THIRD_PARTY_LIST with the final
        list of vendors before production use.
      </p>

      <h2>Data retention</h2>
      <p>
        Medical records and appointment history are retained for as long as your account is active, and for
        a further period as required by applicable healthcare record-keeping obligations.
        CONFIGURE_RETENTION_PERIOD - final retention periods require legal review under the Digital Personal
        Data Protection Act, 2023 and applicable medical record regulations in your jurisdiction.
      </p>

      <h2>Your rights</h2>
      <p>
        You may access, correct, and request deletion of your personal data, subject to records we are
        legally required to retain. You may withdraw consent for optional processing (such as reminder
        notifications) at any time from your account settings. To exercise these rights, contact us using
        the details on our Contact page.
      </p>

      <h2>Security measures</h2>
      <p>
        Passwords are hashed, not stored in plain text. Medical files are stored privately and are never
        served through a public URL. Access to medical records is authorized per-request based on your role
        and relationship to the record (your own data, your assigned doctor, or an authorized administrator).
        All traffic between your browser and the Platform is encrypted in transit.
      </p>

      <h2>Cookies</h2>
      <p>
        See our <a href="/cookie-policy">Cookie Policy</a> for details on the cookies this Platform uses.
      </p>

      <h2>Grievance / contact</h2>
      <p>
        For privacy questions, data requests, or complaints, contact CONFIGURE_GRIEVANCE_CONTACT_EMAIL. We
        aim to acknowledge requests within a reasonable timeframe as required by applicable law.
      </p>

      <LegalNotice />
    </LegalLayout>
  );
}
