import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/api";
import { Shield, Smartphone, Key, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

type Step = "overview" | "setup" | "verify";

const MFASetup: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [step, setStep] = useState<Step>("overview");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);

  // cancel in-flight / ignore setState after unmount
  const setupCtrl = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      setupCtrl.current?.abort();
    };
  }, []);

  async function handleSetupMFA() {
    if (!token || loading) return;
    setLoading(true);

    // cancel any previous setup call
    setupCtrl.current?.abort();
    const ac = new AbortController();
    setupCtrl.current = ac;

    try {
      const res = await authService.setupMFA(token); // backend should be fast; AbortSignal optional
      if (!mounted.current) return;
      setQrCode(res.qrCode || "");
      setSecret(res.secret || "");
      setStep("setup");
    } catch (e: any) {
      if (ac.signal.aborted) return; // silent on cancel
      const msg =
        e?.message === "Too many login/register attempts. Try again later."
          ? "Too many attempts. Wait a minute and try again."
          : e?.message || "Failed to setup MFA";
      toast.error(msg);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  async function handleVerifyMFA(e: React.FormEvent) {
    e.preventDefault();
    if (!token || loading || verificationCode.length !== 6) return;
    setLoading(true);
    try {
      await authService.verifyMFA(token, verificationCode);
      updateUser?.({ mfaEnabled: true });
      setVerificationCode("");
      setQrCode("");
      setSecret("");
      setStep("overview");
      toast.success("MFA enabled");
    } catch (e: any) {
      toast.error(e?.message || "Invalid verification code");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg bg-gray-800 p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 p-3">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">Account Security</h1>
          <p className="text-gray-400">Protect your account with multi-factor authentication</p>
        </div>

        {step === "overview" && (
          <div className="space-y-6">
            {user?.mfaEnabled ? (
              <div className="rounded-lg border border-green-700 bg-green-900 p-6">
                <div className="mb-4 flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <h2 className="text-lg font-bold text-white">MFA Enabled</h2>
                </div>
                <p className="text-green-200">Your account uses MFA.</p>
              </div>
            ) : (
              <div>
                <h2 className="mb-4 text-lg font-bold text-white">Why enable MFA?</h2>
                <div className="mb-6 space-y-4">
                  <Item icon={<Shield className="h-5 w-5 text-blue-400" />} title="Enhanced Security" desc="Blocks unauthorized access." />
                  <Item icon={<Smartphone className="h-5 w-5 text-green-400" />} title="Device Sync" desc="Secures real-time sync across devices." />
                  <Item icon={<Key className="h-5 w-5 text-purple-400" />} title="Standard TOTP" desc="Compatible with major authenticator apps." />
                </div>

                <button
                  onClick={handleSetupMFA}
                  disabled={loading}
                  className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-800"
                >
                  {loading ? "Setting up..." : "Enable MFA"}
                </button>
              </div>
            )}
          </div>
        )}

        {step === "setup" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-4 text-lg font-bold text-white">Scan QR Code</h2>
              <p className="mb-6 text-gray-400">Use Google Authenticator, Authy, or any TOTP app.</p>
            </div>

            {qrCode ? (
              <div className="text-center">
                <img src={qrCode} alt="MFA QR Code" className="mx-auto rounded-lg bg-white p-4" />
              </div>
            ) : (
              <p className="text-center text-sm text-gray-400">QR not available. Try again.</p>
            )}

            <div className="rounded-lg bg-gray-700 p-4">
              <p className="mb-2 text-sm text-gray-300">Manual entry key:</p>
              <code className="break-all text-xs text-blue-400">{secret || "—"}</code>
            </div>

            <button
              onClick={() => setStep("verify")}
              className="w-full rounded-md bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
            >
              I’ve added the account
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-4 text-lg font-bold text-white">Verify Setup</h2>
              <p className="mb-6 text-gray-400">Enter the 6-digit code from your authenticator app.</p>
            </div>

            <form onSubmit={handleVerifyMFA} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-3 text-center text-2xl tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000000"
              />
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {loading ? "Verifying..." : "Verify & Enable MFA"}
              </button>
            </form>

            <button onClick={() => setStep("setup")} className="w-full text-sm text-gray-400 transition-colors hover:text-white">
              Back to QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function Item({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="font-medium text-white">{title}</h3>
        <p className="text-sm text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

export default MFASetup;
