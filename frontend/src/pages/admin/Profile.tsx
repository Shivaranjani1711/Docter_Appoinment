import { AccountSettings } from "../../components/AccountSettings";
import { AccountDetails } from "../../components/AccountDetails";

export function AdminProfile() {
  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-ink-900">Your account</h1>

      <div className="mt-4">
        <AccountDetails />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-ink-900">Account & security</h2>
      <div className="mt-4">
        <AccountSettings />
      </div>
    </div>
  );
}
