import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Tag } from 'lucide-react';
import { getAvailabilityBadge, getFullImageUrl } from '../../utils/formatStatus';

export const EquipmentCard = ({ equipment, showOwner = true }) => {
  const availability = getAvailabilityBadge(equipment.availabilityStatus);
  const primaryImage =
    equipment.images && equipment.images.length > 0
      ? getFullImageUrl(equipment.images[0])
      : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Thumbnail */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={equipment.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-b from-slate-100 to-slate-200 p-4">
            <Tag className="w-10 h-10 mb-2 opacity-50 text-brand-600" />
            <span className="text-xs font-medium">CareShare Equipment</span>
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border shadow-xs ${availability.color}`}
          >
            {availability.label}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-900/75 text-white backdrop-blur-xs">
            {equipment.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-brand-700 font-medium mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Condition: {equipment.condition}</span>
          </div>

          <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {equipment.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {equipment.description}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[130px]">
              {equipment.location?.city || 'Community Bank'}
            </span>
          </div>

          <Link
            to={`/equipment/${equipment._id}`}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
