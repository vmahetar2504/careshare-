import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Info,
  Calendar,
  User,
  HeartHandshake,
  Tag,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import * as equipmentService from '../services/equipment.service';
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import BorrowRequestModal from '../components/borrowing/BorrowRequestModal';
import { getAvailabilityBadge, getFullImageUrl } from '../utils/formatStatus';
import { formatDate } from '../utils/formatDate';

export const EquipmentDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await equipmentService.getEquipmentById(id);
      if (res?.data?.equipment) {
        setEquipment(res.data.equipment);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load equipment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return <Loading fullScreen text="Loading equipment details..." />;
  }

  if (error || !equipment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <ErrorMessage message={error || 'Equipment not found'} onRetry={fetchDetails} />
        <Link
          to="/equipment"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Equipment Catalog
        </Link>
      </div>
    );
  }

  const availability = getAvailabilityBadge(equipment.availabilityStatus);
  const isAvailable = equipment.availabilityStatus === 'AVAILABLE';
  const isOwner = user && equipment.owner && equipment.owner._id === user._id;

  const images = equipment.images && equipment.images.length > 0 ? equipment.images : [];
  const activeImage = images[selectedImageIndex]
    ? getFullImageUrl(images[selectedImageIndex])
    : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80';

  const handleBorrowClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/equipment/${id}` } } });
      return;
    }
    setBorrowModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/equipment"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Equipment Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-4/3 w-full bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/80 shadow-card relative">
            <img
              src={activeImage}
              alt={equipment.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute top-4 right-4">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-xs ${availability.color}`}
              >
                {availability.label}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition flex-shrink-0 ${
                    selectedImageIndex === idx ? 'border-brand-600 ring-2 ring-brand-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getFullImageUrl(img)}
                    alt={`${equipment.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Usage Instructions & Safety Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            {equipment.usageInstructions && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-brand-600" />
                  Usage Instructions
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {equipment.usageInstructions}
                </p>
              </div>
            )}

            {equipment.safetyInformation && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Safety & Weight Guidelines
                </h3>
                <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                  {equipment.safetyInformation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details & Borrow Action Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 uppercase tracking-wider mb-2">
                <Tag className="w-3.5 h-3.5 text-brand-600" />
                {equipment.category}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {equipment.name}
              </h1>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Condition</span>
                <p className="font-bold text-slate-800 mt-0.5">{equipment.condition}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Brand / Model</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {equipment.brand || 'Standard'} {equipment.model ? `(${equipment.model})` : ''}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Location</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {equipment.location?.city || 'Community Bank'}, {equipment.location?.state || ''}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Listed Date</span>
                <p className="font-bold text-slate-800 mt-0.5">{formatDate(equipment.createdAt)}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {equipment.description}
              </p>
            </div>

            {/* Owner Info */}
            {equipment.owner && (
              <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {equipment.owner.firstName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {equipment.owner.firstName} {equipment.owner.lastName}
                    </p>
                    <p className="text-xs text-brand-700">Community Donor • Verified</p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  {equipment.owner.city || 'Local'}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100">
              {isOwner ? (
                <div className="p-4 rounded-2xl bg-slate-100 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-600">
                    You listed this equipment.
                  </p>
                  <Link
                    to="/my-equipment"
                    className="inline-block px-4 py-2 text-xs font-semibold text-brand-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                  >
                    Manage Listing
                  </Link>
                </div>
              ) : isAvailable ? (
                <button
                  type="button"
                  onClick={handleBorrowClick}
                  className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20 hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-5 h-5" />
                  Request to Borrow
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
                  <p className="text-xs font-bold text-amber-800">
                    Currently Unavailable for Borrowing
                  </p>
                  <p className="text-xs text-amber-700">
                    Status: {availability.label}. Please check back once returned and sanitized.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Request Modal */}
      <BorrowRequestModal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        equipment={equipment}
        onSuccess={fetchDetails}
      />
    </div>
  );
};

export default EquipmentDetails;
