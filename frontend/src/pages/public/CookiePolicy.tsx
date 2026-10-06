import { LegalLayout, LegalNotice } from "./LegalLayout";

export function CookiePolicy() {
  return (
    <LegalLayout title="Cookie Policy" updated="2026-10-01">
      <p>
        CareLine uses a minimal set of cookies, limited to what is required to operate the Platform
        securely. We do not use third-party advertising or tracking cookies.
      </p>

      <h2>Necessary / authentication cookies</h2>
      <p>
        A single httpOnly, secure session cookie stores your refresh token so you remain logged in between
        visits without exposing the token to page scripts. This cookie is strictly necessary for the
        Platform to function and cannot be disabled while remaining logged in.
      </p>

      <h2>Preference cookies</h2>
      <p>
        We do not currently set any preference cookies. If introduced in the future (for example, to
        remember a dashboard view), this policy will be updated and, where required, your consent requested.
      </p>

      <h2>Analytics cookies</h2>
      <p>
        No analytics or tracking cookies are used by this Platform in its current build. Should analytics be
        added later, this policy will disclose exactly what is collected, why, and how to opt out, and
        consent will be requested where required by law.
      </p>

      <h2>Third-party cookies</h2>
      <p>
        Our video consultation provider may set its own cookies when you join an online consultation, solely
        to operate the video session. Our payment gateway may do the same during checkout. Neither is used
        for advertising.
      </p>

      <LegalNotice />
    </LegalLayout>
  );
}
