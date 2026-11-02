import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, Package } from 'lucide-react';
import * as equipmentService from '../services/equipment.service';
import EquipmentCard from '../components/equipment/EquipmentCard';
import Pagination from '../components/Pagination';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_CONDITIONS } from '../utils/constants';

export const Equipment = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state synced with URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');

  const [equipmentList, setEquipmentList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = {
        page,
        limit: 8,
        sortBy,
        order: 'desc',
      };
      if (search.trim()) query.search = search.trim();
      if (category) query.category = category;
      if (condition) query.condition = condition;
      if (city.trim()) query.city = city.trim();

      const res = await equipmentService.getAllEquipment(query);
      if (res?.data) {
        setEquipmentList(res.data.equipment || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load equipment catalog.');
    } finally {
      setLoading(false);
    }
  }, [page, category, condition, city, sortBy, search]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    updateUrlParams({ search, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setPage(1);
    if (key === 'category') setCategory(value);
    if (key === 'condition') setCondition(value);
    if (key === 'city') setCity(value);
    if (key === 'sortBy') setSortBy(value);

    updateUrlParams({ [key]: value, page: 1 });
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setCity('');
    setSortBy('createdAt');
    setPage(1);
    setSearchParams({});
  };

  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    setSearchParams(params);
  };

  const hasActiveFilters = Boolean(search || category || condition || city);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Medical Equipment Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse available community medical equipment ready for recovery sharing.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wheelchairs, walkers, beds..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition shadow-xs"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`p-2.5 rounded-xl border text-slate-600 md:hidden transition ${
              filtersOpen || hasActiveFilters
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-white border-slate-200'
            }`}
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Filter Toolbar */}
      <div
        className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 ${
          filtersOpen ? 'block' : 'hidden md:block'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="w-4 h-4 text-brand-600" />
            Filter Catalog
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              type="button"
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold transition"
            >
              <X className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Equipment Category
            </label>
            <select
              value={category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <option value="">All Categories</option>
              {EQUIPMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Condition</label>
            <select
              value={condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <option value="">Any Condition</option>
              {EQUIPMENT_CONDITIONS.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location / City */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">City / Area</label>
            <input
              type="text"
              value={city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="e.g. Mumbai, Delhi..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sort Results</label>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <option value="createdAt">Newly Added</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchEquipment} />

      {/* Equipment Grid */}
      {loading ? (
        <Loading text="Finding medical equipment..." />
      ) : equipmentList.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipmentList.map((item) => (
              <EquipmentCard key={item._id} equipment={item} />
            ))}
          </div>

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No Equipment Found"
          description={
            hasActiveFilters
              ? 'No medical equipment matched your current search filters. Try clearing some criteria.'
              : 'There is currently no equipment available in the catalog.'
          }
          actionLabel={hasActiveFilters ? 'Clear Filters' : 'Donate Equipment'}
          actionLink={hasActiveFilters ? null : '/add-equipment'}
          onAction={hasActiveFilters ? clearAllFilters : null}
        />
      )}
    </div>
  );
};

export default Equipment;
