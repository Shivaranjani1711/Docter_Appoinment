export function Contact() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-ink-900">Contact</h1>
      <p className="mt-3 text-ink-600">
        For appointment support, privacy requests, or general questions, reach us using the details below.
      </p>
      <div className="card mt-6 space-y-2 text-sm text-ink-700">
        <p>
          <span className="font-medium text-ink-900">Organization:</span> CONFIGURE_ORGANIZATION_NAME
        </p>
        <p>
          <span className="font-medium text-ink-900">Email:</span> CONFIGURE_CONTACT_EMAIL
        </p>
        <p>
          <span className="font-medium text-ink-900">Phone:</span> CONFIGURE_CONTACT_PHONE
        </p>
        <p>
          <span className="font-medium text-ink-900">Address:</span> CONFIGURE_ADDRESS
        </p>
        <p>
          <span className="font-medium text-ink-900">Registration / license number:</span>{" "}
          CONFIGURE_REGISTRATION_NUMBER
        </p>
      </div>
      <p className="mt-4 text-sm text-ink-500">
        These details are placeholders. Replace them with your actual hospital/organization information
        from the admin dashboard before any real-world use.
      </p>
    </div>
  );
}
