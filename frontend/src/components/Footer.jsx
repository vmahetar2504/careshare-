import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  MessageSquareText,
  Star,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Modal from './Modal';
import ErrorMessage from './ErrorMessage';
import * as feedbackService from '../services/feedback.service';

const feedbackCategories = [
  'General Feedback',
  'Website Experience',
  'Equipment Listing',
  'Borrowing Experience',
  'Donation Experience',
  'User Experience',
  'Bug Report',
  'Suggestion',
  'Other',
];

const initialFeedback = {
  rating: 0,
  category: 'General Feedback',
  message: '',
};

export const Footer = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState(initialFeedback);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenFeedback = () => {
    if (loading) return;

    if (!isAuthenticated) {
      setIsLoginPromptOpen(true);
      return;
    }

    setError('');
    setSuccess('');
    setFeedbackForm(initialFeedback);
    setIsFeedbackOpen(true);
  };

  const handleCloseFeedback = () => {
    setIsFeedbackOpen(false);
    setError('');
    setSuccess('');
    setFeedbackForm(initialFeedback);
  };

  const handleLoginRedirect = () => {
    setIsLoginPromptOpen(false);
    navigate('/login', {
      state: {
        from: { pathname: location.pathname },
      },
    });
  };

  const handleFormChange = (field, value) => {
    setFeedbackForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedMessage = feedbackForm.message.trim();
    if (!feedbackForm.rating) {
      setError('Please select a rating.');
      return;
    }
    if (trimmedMessage.length < 10) {
      setError('Feedback must contain at least 10 characters.');
      return;
    }
    if (trimmedMessage.length > 1000) {
      setError('Feedback cannot exceed 1000 characters.');
      return;
    }

    setSubmitting(true);

    try {
      await feedbackService.submitFeedback({
        rating: feedbackForm.rating,
        message: trimmedMessage,
        category: feedbackForm.category,
      });

      setSuccess('Thank you! Your feedback has been submitted successfully.');
      setFeedbackForm(initialFeedback);
    } catch (err) {
      setError(err.friendlyMessage || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-health-400 flex items-center justify-center text-white shadow-md">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  Care<span className="text-brand-400">Share</span>
                </span>
              </Link>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                “Share Care. Support Recovery.” <br />
                Connecting community members with unused medical equipment to patients, caregivers, and families in need for dignified, cost-free recovery.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>Verified Quality</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-health-400" />
                  <span>Hospital Sanitized</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wider mb-4">
                Explore
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/equipment" className="hover:text-white transition">
                    Browse Catalog
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/add-equipment" className="hover:text-white transition">
                    Donate Equipment
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition">
                    Join Community
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleOpenFeedback}
                    disabled={loading}
                    className="flex items-center gap-2 text-left hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <MessageSquareText className="w-4 h-4 text-brand-400" />
                    Give Feedback
                  </button>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wider mb-4">
                Popular Items
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/equipment?category=Wheelchair" className="hover:text-white transition">
                    Wheelchairs
                  </Link>
                </li>
                <li>
                  <Link to="/equipment?category=Hospital+Bed" className="hover:text-white transition">
                    Hospital Beds
                  </Link>
                </li>
                <li>
                  <Link to="/equipment?category=Oxygen+Equipment" className="hover:text-white transition">
                    Oxygen Equipment
                  </Link>
                </li>
                <li>
                  <Link to="/equipment?category=Walker" className="hover:text-white transition">
                    Walkers & Crutches
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Hours */}
            <div>
              <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wider mb-4">
                Community Hub
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <span>Bhavnagar,Gujarat</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <span>careshare@gmail.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <span>+91 7069971209 CARE-BANK</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} CareShare Community Bank. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>Community Care License</span>
              <span>Non-Profit Equipment Bank</span>
              <span>Patient Safety First</span>
            </div>
          </div>
        </div>
      </footer>

      <Modal isOpen={isLoginPromptOpen} onClose={() => setIsLoginPromptOpen(false)} title="Feedback" maxWidth="max-w-md">
        <div className="space-y-5">
          <p className="text-sm text-slate-600">Please login to submit your feedback.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsLoginPromptOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLoginRedirect}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isFeedbackOpen} onClose={handleCloseFeedback} title="Give Feedback" maxWidth="max-w-2xl">
        {success ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
              <h4 className="text-lg font-bold mb-2">Thank You!</h4>
              <p className="text-sm">Your feedback has been submitted successfully. Thank you for helping us improve CareShare.</p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCloseFeedback}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleFormChange('rating', star)}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    className="p-1 rounded-full transition-transform hover:scale-105"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        feedbackForm.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Feedback Category</label>
              <select
                value={feedbackForm.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden bg-white"
              >
                {feedbackCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tell us about your experience...
              </label>
              <textarea
                value={feedbackForm.message}
                onChange={(e) => handleFormChange('message', e.target.value)}
                rows={6}
                minLength={10}
                maxLength={1000}
                placeholder="Share details about your experience with CareShare, any issues, or suggestions for improvement."
                className="w-full px-3 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden resize-none"
              />
              <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                <span>Minimum 10 characters</span>
                <span>{feedbackForm.message.length}/1000</span>
              </div>
            </div>

            <ErrorMessage message={error} />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseFeedback}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default Footer;
