import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PackagePlus,
  UploadCloud,
  X,
  Info,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import * as equipmentService from '../services/equipment.service';
import ErrorMessage from '../components/ErrorMessage';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_CONDITIONS } from '../utils/constants';

export const AddEquipment = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Wheelchair',
    description: '',
    brand: '',
    model: '',
    condition: 'EXCELLENT',
    quantity: 1,
    address: '',
    city: '',
    state: '',
    pincode: '',
    usageInstructions: '',
    safetyInformation: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > 5) {
      setError('You can upload a maximum of 5 images.');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, idx) => idx !== index);
    const updatedPreviews = imagePreviews.filter((_, idx) => idx !== index);
    setImages(updatedImages);
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.name.trim().length < 2) {
      setError('Equipment name must be at least 2 characters.');
      return;
    }

    if (formData.description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters).');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('category', formData.category);
      data.append('description', formData.description.trim());
      data.append('condition', formData.condition);
      data.append('quantity', formData.quantity);

      if (formData.brand.trim()) data.append('brand', formData.brand.trim());
      if (formData.model.trim()) data.append('model', formData.model.trim());
      if (formData.usageInstructions.trim())
        data.append('usageInstructions', formData.usageInstructions.trim());
      if (formData.safetyInformation.trim())
        data.append('safetyInformation', formData.safetyInformation.trim());

      const locationObj = {
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      };
      data.append('location', JSON.stringify(locationObj));

      images.forEach((img) => {
        data.append('images', img);
      });

      await equipmentService.createEquipment(data);
      setSubmitted(true);
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to list equipment.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-card max-w-xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Equipment Submitted for Verification!</h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          Thank you for your generous community contribution! Your equipment listing has been assigned status{' '}
          <span className="font-bold text-amber-600">PENDING</span>. Our administration team will review the photos and specs before making it available in the public catalog.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/my-equipment"
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition"
          >
            Go to My Equipment
          </Link>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setImages([]);
              setImagePreviews([]);
              setFormData({
                name: '',
                category: 'Wheelchair',
                description: '',
                brand: '',
                model: '',
                condition: 'EXCELLENT',
                quantity: 1,
                address: '',
                city: '',
                state: '',
                pincode: '',
                usageInstructions: '',
                safetyInformation: '',
              });
            }}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Add Another Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-brand-600" />
            Donate / List Medical Equipment
          </h2>
          <p className="text-xs text-slate-500">
            Share your unused medical gear with local recovery patients.
          </p>
        </div>
        <Link
          to="/my-equipment"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel
        </Link>
      </div>

      <ErrorMessage message={error} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Equipment Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ergonomic Lightweight Wheelchair with Footrests"
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              {EQUIPMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Condition <span className="text-rose-500">*</span>
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              {EQUIPMENT_CONDITIONS.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. Karma, Philips, Medline"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Model / Serial</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g. CH-900"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the condition, features, dimensions, and included accessories..."
              required
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Pickup & Storage Location
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Street Address (Visible only after request approval)
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 12 Green Park Avenue"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Maharashtra"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 400001"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Instructions & Safety Guidelines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Usage & Handling Instructions
            </label>
            <textarea
              rows={2}
              name="usageInstructions"
              value={formData.usageInstructions}
              onChange={handleChange}
              placeholder="e.g. Lock parking brakes prior to patient sitting..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Safety Information & Warnings
            </label>
            <textarea
              rows={2}
              name="safetyInformation"
              value={formData.safetyInformation}
              onChange={handleChange}
              placeholder="e.g. Maximum user weight limit 120kg. Do not exceed..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Image Upload Zone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Equipment Photos (Up to 5 photos)
          </label>
          <div className="p-6 border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-2xl bg-slate-50/50 hover:bg-brand-50/20 text-center transition-colors">
            <UploadCloud className="w-8 h-8 text-brand-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800">
              Drag photos here or click to browse
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WebP (Max 5MB each)</p>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={images.length >= 5}
              className="mt-3 text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
            />
          </div>

          {/* Previews */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {imagePreviews.map((src, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden group shadow-xs"
                >
                  <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-slate-900/70 hover:bg-rose-600 text-white rounded-md transition"
                    aria-label="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/my-equipment"
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-xs disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Submit for Verification
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEquipment;
