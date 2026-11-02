import React from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Award,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Users,
} from 'lucide-react';

export const About = () => {
  const faqs = [
    {
      q: 'Is borrowing equipment really free?',
      a: 'Yes, 100%. CareShare operates as a non-profit community health sharing bank. There are zero rental charges or hidden subscription fees.',
    },
    {
      q: 'How does CareShare ensure equipment safety and hygiene?',
      a: 'Every piece of returned equipment undergoes mandatory multi-point inspection for structural integrity followed by documented disinfection with hospital-grade antibacterial solutions before being restored to AVAILABLE.',
    },
    {
      q: 'Can I both donate equipment and borrow if needed?',
      a: 'Absolutely! Every CareShare user account has full capability to donate/share unused equipment and submit borrow requests whenever recovery needs arise.',
    },
    {
      q: 'What happens if equipment gets damaged during borrowing?',
      a: 'When an item is returned, our inspection record tracks any wear and tear. If repair is required, it is immediately routed to MAINTENANCE status rather than community circulation.',
    },
    {
      q: 'How do pickups and returns work?',
      a: 'Once an owner approves a borrow request, contact details and location details are unlocked so you can coordinate a convenient, safe handover.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Intro Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
          <HeartHandshake className="w-4 h-4" />
          Our Mission
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          About CareShare
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          “Share Care. Support Recovery.” <br />
          We empower communities to bridge the gap between unused medical equipment and patients in need of affordable, dignified recovery solutions.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Dignified Recovery</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Healthcare costs should never prevent someone from having a safe wheelchair, walker, or hospital bed to recover safely at home.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Rigorous Quality</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every listing is vetted by platform administrators, ensuring that only reliable, well-maintained medical gear reaches patients.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-health-50 text-health-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Hospital Sanitization</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We follow strict sterilization guidelines between users, removing infection risk and maintaining clinical hygiene.
          </p>
        </div>
      </div>

      {/* The Full Medical Equipment Lifecycle */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Lifecycle Guarantee
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            How Every Item Moves Through CareShare
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">1. Verification Gate:</strong> New items are locked in PENDING and UNAVAILABLE state until an administrator reviews photos, model specs, and descriptions.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">2. Conflict-Free Booking:</strong> Automated overlap prevention ensures multiple borrowers cannot double-book items.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">3. Active Handover Tracking:</strong> When physical pickup occurs, equipment status is logged as BORROWED to maintain accountability.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">4. Return & Damage Check:</strong> Returned equipment is held in INSPECTION_PENDING until physical damage checks are recorded.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">5. Sanitization Verification:</strong> Only after sanitization is completed and logged by staff does the backend restore the item to AVAILABLE.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">6. Audit Trail:</strong> Both donor and borrower receive timestamped notifications for every status change.
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500">Everything you need to know about borrowing and donating.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1.5"
            >
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-600 flex-shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
