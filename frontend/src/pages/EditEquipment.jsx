import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit3, UploadCloud, X, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import * as equipmentService from '../services/equipment.service';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_CONDITIONS } from '../utils/constants';
import { getFullImageUrl } from '../utils/formatStatus';

export const EditEquipment = () => {
  const { id } = useParams();
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

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await equipmentService.getEquipmentById(id);
        if (res?.data?.equipment) {
          const eq = res.data.equipment;
          setFormData({
            name: eq.name || '',
            category: eq.category || 'Wheelchair',
            description: eq.description || '',
            brand: eq.brand || '',
            model: eq.model || '',
            condition: eq.condition || 'EXCELLENT',
            quantity: eq.quantity || 1,
            address: eq.location?.address || '',
            city: eq.location?.city || '',
            state: eq.location?.state || '',
            pincode: eq.location?.pincode || '',
            usageInstructions: eq.usageInstructions || '',
            safetyInformation: eq.safetyInformation || '',
          });
          setExistingImages(eq.images || []);
        }
      } catch (err) {
        setError(err.friendlyMessage || 'Failed to fetch equipment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (existingImages.length + newImages.length + files.length > 5) {
      setError('You can have a maximum of 5 images in total.');
      return;
    }

    setNewImages([...newImages, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewPreviews([...newPreviews, ...previews]);
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, idx) => idx !== index));
    setNewPreviews(newPreviews.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

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

      newImages.forEach((img) => {
        data.append('images', img);
      });

      await equipmentService.updateEquipment(id, data);
      navigate('/my-equipment');
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to update equipment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading equipment details..." />;
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-brand-600" />
            Edit Equipment Listing
          </h2>
          <p className="text-xs text-slate-500">Update specifications, guidelines, or photos.</p>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
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
              required
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Location Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
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
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Existing & New Images */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">Photos</label>
          {existingImages.length > 0 && (
            <div>
              <p className="text-[11px] text-slate-400 mb-2">Existing Photos:</p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 rounded-xl border border-slate-200 overflow-hidden shadow-xs"
                  >
                    <img
                      src={getFullImageUrl(img)}
                      alt={`Existing ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add more photos */}
          {existingImages.length + newImages.length < 5 && (
            <div>
              <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition shadow-xs">
                <UploadCloud className="w-3.5 h-3.5" />
                Add More Photos
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {newPreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {newPreviews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden shadow-xs"
                    >
                      <img src={src} alt="New preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-slate-900/70 hover:bg-rose-600 text-white rounded-md transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/my-equipment"
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-xs disabled:opacity-50"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEquipment;
