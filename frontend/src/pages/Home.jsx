import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Package,
  Search,
  CheckCircle2,
  RotateCcw,
  Users,
  Activity,
  Heart,
  CalendarCheck,
} from 'lucide-react';
import * as equipmentService from '../services/equipment.service';
import EquipmentCard from '../components/equipment/EquipmentCard';
import Loading from '../components/Loading';

export const Home = () => {
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    equipmentService
      .getAllEquipment({ limit: 4 })
      .then((res) => {
        if (res?.data?.equipment) {
          setFeaturedEquipment(res.data.equipment);
        }
      })
      .catch((err) => {
        console.error('Failed to load featured equipment:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const workflowSteps = [
    {
      step: '01',
      title: 'List Equipment',
      description: 'Upload details and photos of unused medical gear you want to donate or share.',
      icon: Package,
      color: 'bg-brand-50 text-brand-600 border-brand-200',
    },
    {
      step: '02',
      title: 'Admin Verification',
      description: 'Our healthcare staff verifies condition, safety standards, and specifications.',
      icon: ShieldCheck,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      step: '03',
      title: 'Find & Request',
      description: 'Patients and caregivers search nearby items and submit temporary borrow requests.',
      icon: Search,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      step: '04',
      title: 'Community Handover',
      description: 'Owner approves the booking and coordinates a convenient, safe pickup.',
      icon: CalendarCheck,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      step: '05',
      title: 'Safe Return',
      description: 'Once recovery is complete, the borrower initiates return and hands back the item.',
      icon: RotateCcw,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      step: '06',
      title: 'Hospital Sanitization',
      description: 'Items undergo strict medical inspection and hospital-grade sanitization before re-listing.',
      icon: Sparkles,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-slate-50 pt-16 pb-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-semibold tracking-wide shadow-xs">
                <HeartHandshake className="w-4 h-4 text-brand-600" />
                Community Medical Equipment Bank
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Share Care. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-health-600">
                  Support Recovery.
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Give unused medical equipment a second life and help someone recover with dignity. Connect with neighbors to borrow wheelchairs, hospital beds, walkers, and oxygen devices at zero cost.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/equipment"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/20 hover:shadow-lg transition-all"
                >
                  Find Equipment
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/add-equipment"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-brand-700 bg-white border border-brand-200 hover:bg-brand-50 rounded-xl shadow-xs transition-all"
                >
                  Share Equipment
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-bold text-slate-900">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Free Community Sharing</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">Verified</p>
                  <p className="text-xs text-slate-500 font-medium">Safe & Quality Inspected</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">Sanitized</p>
                  <p className="text-xs text-slate-500 font-medium">Hospital-Grade Standards</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden mb-5 bg-gradient-to-tr from-brand-100 to-health-100 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=700&q=80"
                    alt="Medical equipment sharing"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs font-semibold text-white bg-slate-900/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      Community Impact Spotlight
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                      Mobility & Recovery
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Pickup
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Recover with Dignity, Return with Gratitude
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Over 500+ families have borrowed essential health equipment, saving thousands in out-of-pocket medical costs.
                  </p>
                </div>
              </div>

              {/* Decorative Floating Badges */}
              <div className="hidden sm:flex absolute -bottom-4 -left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 shadow-lg border border-slate-100 items-center gap-3 animate-bounce duration-1000">
                <div className="w-10 h-10 rounded-xl bg-health-100 text-health-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Hospital Sanitized</p>
                  <p className="text-[10px] text-slate-400">Inspected before every re-loan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Safe Community Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How CareShare Works
          </h2>
          <p className="text-sm text-slate-600">
            A transparent 6-stage lifecycle ensuring quality, cleanliness, and fair access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 group-hover:text-brand-300 transition-colors">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Equipment Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Available For Borrowing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Medical Equipment
            </h2>
          </div>
          <Link
            to="/equipment"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition"
          >
            View All Equipment
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Loading text="Loading available equipment..." />
        ) : featuredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEquipment.map((item) => (
              <EquipmentCard key={item._id} equipment={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-8">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">No verified equipment currently listed.</p>
            <Link
              to="/add-equipment"
              className="inline-block mt-4 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg"
            >
              Be the first to donate
            </Link>
          </div>
        )}
      </section>

      {/* Why CareShare Section */}
      <section className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white py-16 rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 my-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
              Community Health Equity
            </span>
            <h2 className="text-3xl font-bold tracking-tight">
              Why Community Equipment Sharing Matters
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Medical recovery is emotionally and financially demanding. Most specialized recovery gear sits unused in closets after a patient heals, while others struggle to afford essential mobility and respiratory tools.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-health-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-200">
                  <strong className="text-white">Zero Rental Costs:</strong> 100% free peer-to-peer equipment sharing.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-health-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-200">
                  <strong className="text-white">Environmental Sustainability:</strong> Reduce medical waste by reusing durable hospital-grade hardware.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-health-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-200">
                  <strong className="text-white">Peace of Mind:</strong> Rigorous safety checks and hospital-grade sanitization protocols.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <Heart className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <p className="text-3xl font-extrabold text-white">500+</p>
              <p className="text-xs text-slate-400 mt-1">Families Supported</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <Package className="w-8 h-8 text-brand-400 mx-auto mb-2" />
              <p className="text-3xl font-extrabold text-white">850+</p>
              <p className="text-xs text-slate-400 mt-1">Devices Shared</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <Activity className="w-8 h-8 text-health-400 mx-auto mb-2" />
              <p className="text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-slate-400 mt-1">Hospital Disinfected</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <Users className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-3xl font-extrabold text-white">1,200+</p>
              <p className="text-xs text-slate-400 mt-1">Active Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Sanitization Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Uncompromising Safety Standards
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Cleanliness and hygiene you can trust with your loved ones.
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every returned piece of equipment undergoes a documented two-stage check: structural damage inspection followed by professional decontamination using hospital-grade antimicrobial agents.
            </p>
          </div>
          <Link
            to="/about"
            className="px-6 py-3 text-sm font-semibold text-emerald-800 bg-white border border-emerald-200 hover:bg-emerald-100/50 rounded-xl transition shadow-xs flex-shrink-0"
          >
            Learn About Our Safety Protocol
          </Link>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="text-center max-w-3xl mx-auto px-4 py-8 space-y-5">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          Ready to Make a Difference or Need Help Today?
        </h2>
        <p className="text-sm text-slate-600">
          Join our growing circle of care. List medical gear you no longer need, or search for equipment to support a family member’s swift recovery.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="px-6 py-3 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-md shadow-brand-600/20"
          >
            Create Free Account
          </Link>
          <Link
            to="/equipment"
            className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-xs"
          >
            Search Catalog
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
