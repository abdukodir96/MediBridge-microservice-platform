"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import GoogleIcon from "@mui/icons-material/Google";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MemberType = "PATIENT" | "CLINIC";
type AuthMember = { _id: string; memberNick: string; memberType: MemberType; accessToken: string };

const LOGIN: TypedDocumentNode<{ login: AuthMember }, { input: { memberEmail: string; memberPassword: string } }> = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) { _id memberNick memberType accessToken }
  }
`;

const SIGNUP: TypedDocumentNode<{ signup: AuthMember }, { input: { memberEmail: string; memberPassword: string; memberNick: string; memberPhone: string; memberType: MemberType; memberLang: "EN" } }> = gql`
  mutation Signup($input: MemberInput!) {
    signup(input: $input) { _id memberNick memberType accessToken }
  }
`;

const benefits = [["🛡️", "Escrow-protected payments"], ["🌐", "Chat in your own language"], ["✓", "Only verified, licensed clinics"]];

export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState(mode);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSignup = activeMode === "signup";
  const [role, setRole] = useState<MemberType | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [login, loginState] = useMutation(LOGIN);
  const [signup, signupState] = useMutation(SIGNUP);
  const loading = loginState.loading || signupState.loading;
  const error = loginState.error ?? signupState.error;

  useEffect(() => {
    return () => {
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
    };
  }, []);

  const changeMode = (nextMode: "login" | "signup") => {
    if (nextMode === activeMode) return;
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
    setActiveMode(nextMode);
    navigationTimer.current = setTimeout(() => {
      router.push(`/${nextMode}`);
    }, 700);
  };

  const finishAuth = (member: AuthMember) => {
    localStorage.setItem("accessToken", member.accessToken);
    localStorage.setItem("memberType", member.memberType);
    localStorage.setItem("memberNick", member.memberNick);
    window.dispatchEvent(new Event("storage"));
    router.push(member.memberType === "PATIENT" ? "/dashboard/patient" : "/dashboard/clinic");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    try {
      if (isSignup) {
        if (!role) {
          setFormError("Please select whether you are a patient or a clinic.");
          return;
        }
        if (password !== confirmPassword) {
          setFormError("Passwords do not match. Please try again.");
          return;
        }
        const { data } = await signup({ variables: { input: { memberEmail: email, memberPassword: password, memberNick: nickname, memberPhone: phone, memberType: role, memberLang: "EN" } } });
        if (data) finishAuth(data.signup);
      } else {
        const { data } = await login({ variables: { input: { memberEmail: email, memberPassword: password } } });
        if (data) finishAuth(data.login);
      }
    } catch { /* Apollo error renders below. */ }
  };

  return <main className="grid min-h-screen overflow-hidden bg-white lg:relative lg:block lg:h-screen">
      <section className={`relative flex min-h-[320px] flex-col overflow-hidden bg-linear-to-br from-brand-teal-700 to-brand-teal-900 px-7 py-8 text-white sm:px-11 sm:py-11 lg:absolute lg:inset-y-0 lg:min-h-screen lg:w-[60%] lg:px-16 lg:py-12 lg:transition-[left] lg:duration-700 lg:ease-in-out ${isSignup ? "lg:left-0" : "lg:left-[40%]"}`}>
        <Image
          src="/doctor/female-auth-944ecd.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="scale-110 object-cover object-center blur-2xl"
          aria-hidden="true"
        />
        <Image
          src="/doctor/female-auth-944ecd.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="scale-90 object-cover object-center"
          style={{
            maskImage:
              "radial-gradient(ellipse at center, black 72%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 72%, transparent 100%)",
          }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-brand-teal-900/90 via-brand-teal-700/78 to-brand-teal-900/65" />
        <div className="pointer-events-none absolute -bottom-48 -right-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(201,162,75,.22),transparent_68%)]" />
      <Link href="/" className="relative z-10 flex items-center gap-2.5 font-serif text-[25px] font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15"><svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 3v18M3 12h18" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg></span>MediBridge</Link>
      <div className="relative z-10 mt-auto max-w-xl pt-20 lg:pb-2">
        <h1 className="max-w-[560px] font-serif text-[36px] font-semibold leading-[1.16] tracking-[-.025em] sm:text-[44px] lg:text-[50px]">Your journey to Korea&apos;s best clinics starts here.</h1>
        <p className="mt-5 max-w-md text-[15px] leading-6 text-brand-teal-100/80 sm:text-base">Join thousands of international patients who found trusted care through MediBridge.</p>
        <ul className="mt-8 hidden space-y-3.5 sm:block">{benefits.map(([icon, label]) => <li key={label} className="flex items-center gap-3 text-sm font-semibold"><span className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-white/10">{icon}</span>{label}</li>)}</ul>
      </div>
    </section>

    <section className={`flex items-center justify-center bg-white px-6 py-10 sm:px-10 lg:absolute lg:inset-y-0 lg:w-[40%] lg:overflow-y-auto lg:px-12 lg:transition-[left] lg:duration-700 lg:ease-in-out ${isSignup ? "lg:left-[60%]" : "lg:left-0"}`}><div className="w-full max-w-[510px]">
      <nav className="mb-10 grid grid-cols-2 rounded-xl bg-brand-cream p-1"><button type="button" onClick={() => changeMode("login")} aria-pressed={!isSignup} className={`flex min-h-12 items-center justify-center rounded-lg text-sm font-semibold ${!isSignup ? "bg-white text-brand-teal-900 shadow-sm" : "text-brand-muted"}`}>Log in</button><button type="button" onClick={() => changeMode("signup")} aria-pressed={isSignup} className={`flex min-h-12 items-center justify-center rounded-lg text-sm font-semibold ${isSignup ? "bg-white text-brand-teal-900 shadow-sm" : "text-brand-muted"}`}>Sign up</button></nav>
      <h2 className="font-serif text-[30px] font-semibold text-brand-teal-900">{isSignup ? "Create your account" : "Welcome back"}</h2>
      <p className="mt-2 text-sm text-brand-muted">{isSignup ? "Start comparing clinics in minutes." : "Log in to continue your MediBridge journey."}</p>

      {isSignup && (
        <div className={`mt-7 flex transition-[gap] duration-700 ease-in-out ${role ? "gap-0" : "gap-4"}`}>
          <div className={`min-w-0 basis-0 overflow-hidden transition-[flex-grow,opacity,transform] duration-700 ease-in-out ${!role || role === "PATIENT" ? "grow scale-100 opacity-100" : "pointer-events-none grow-0 scale-90 opacity-0"}`}>
            <RoleButton active={role === "PATIENT"} onClick={() => setRole(role === "PATIENT" ? null : "PATIENT")} icon="🧑" label="I'm a patient" />
          </div>
          <div className={`min-w-0 basis-0 overflow-hidden transition-[flex-grow,opacity,transform] duration-700 ease-in-out ${!role || role === "CLINIC" ? "grow scale-100 opacity-100" : "pointer-events-none grow-0 scale-90 opacity-0"}`}>
            <RoleButton active={role === "CLINIC"} onClick={() => setRole(role === "CLINIC" ? null : "CLINIC")} icon="🏥" label="I'm a clinic" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete={isSignup ? "off" : "on"} className="mt-7 space-y-5">
        {isSignup && <div className="grid gap-4 sm:grid-cols-2"><AuthField label="Nickname" value={nickname} onChange={setNickname} placeholder="Your name" autoComplete="nickname" /><AuthField label="Phone" value={phone} onChange={setPhone} placeholder="+82 10 0000 0000" autoComplete="tel" type="tel" /></div>}
        <AuthField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" type="email" />
        <AuthField label="Password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete={isSignup ? "off" : "current-password"} type="password" minLength={6} />
        {isSignup && <AuthField label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" autoComplete="off" type="password" minLength={6} />}
        {!isSignup && <div className="flex items-center justify-between text-xs text-brand-muted"><label className="flex items-center gap-2"><input type="checkbox" className="accent-brand-teal-700" />Remember me</label><button type="button" className="font-semibold text-brand-teal-700 hover:underline">Forgot password?</button></div>}
        {(formError || error) && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError || error?.message}</p>}
        <button disabled={loading} className="min-h-[52px] w-full rounded-xl bg-brand-teal-700 text-sm font-bold text-white transition hover:bg-brand-teal-900 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Please wait..." : isSignup ? "Create account" : "Log in"}</button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-brand-muted before:h-px before:flex-1 before:bg-brand-line after:h-px after:flex-1 after:bg-brand-line"><span>or continue with</span></div>
      <button type="button" className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-brand-line text-sm font-semibold text-brand-ink transition hover:border-brand-teal-500 hover:bg-brand-cream/60">
        <GoogleIcon sx={{ color: "#4285f4", fontSize: 22 }} />
        Continue with Google
      </button>
    </div></section>
  </main>;
}

function RoleButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return <button type="button" onClick={onClick} className={`flex min-h-[82px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition ${active ? "border-brand-teal-700 bg-brand-teal-100 text-brand-teal-700" : "border-brand-line text-brand-ink hover:border-brand-teal-500"}`}><span className="text-xl">{icon}</span>{label}</button>;
}

function AuthField({ label, value, onChange, placeholder, type = "text", autoComplete, minLength }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; autoComplete: string; minLength?: number }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-brand-muted">{label}</span><input required type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} minLength={minLength} className="h-[52px] w-full rounded-[10px] border border-brand-line bg-white px-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted/80 focus:border-brand-teal-500 focus:ring-3 focus:ring-brand-teal-100" /></label>;
}
