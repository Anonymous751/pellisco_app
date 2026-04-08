import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Plus, Search, Filter, Edit2, Trash2, Eye, Box,
  AlertCircle, CheckCircle2, ChevronLeft, ChevronRight,
  Loader2, Sparkles
} from 'lucide-react';

import InventoryActionModal from './Inventory/InventoryActionModal';
import CreateInventoryModal from './Inventory/CreateInventoryModal';
import { fetchInventoryStats } from './Inventory/InventorySlice/inventorySlice';

// --- LOGIC PRESERVED ---
const formatSKU = (sku, id) => {
  if (sku && sku.includes('PELL-')) return sku.toUpperCase();
  const base = sku || id || "";
  const lastFour = base.toString().slice(-4).toUpperCase();
  return `PELL-${lastFour}`;
};

// --- OPTIMIZATION: STRICT ROW MEMOIZATION ---
const ProductRow = memo(({ item, isJustAdded, handleOpenAction, handleDelete }) => {
  return (
    <tr className={`hover:bg-slate-50/50 transition-colors duration-150 ${isJustAdded ? 'bg-blue-50/30' : ''}`}>
      <td className="p-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
              {item.images?.[0]?.url ? (
                <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-slate-300">IMG</span>
              )}
            </div>
            {isJustAdded && (
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg border border-white">
                <Sparkles size={8} />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-700 leading-tight">{item.name}</p>
              {isJustAdded && (
                <span className="text-[8px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">New</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5">
              {formatSKU(item.product_sku, item._id)}
            </p>
          </div>
        </div>
      </td>
      <td className="p-5">
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
          {item.category}
        </span>
      </td>
      <td className="p-5">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-700">₹ {item.price?.sale?.toLocaleString()}</span>
          <span className="text-[9px] text-slate-300 line-through">₹ {item.price?.mrp?.toLocaleString()}</span>
        </div>
      </td>
      <td className="p-5 text-[11px] font-bold text-slate-600 text-center">{item.stock}</td>
      <td className="p-5">
        <span className={`text-[9px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full ${
          item.stock > 10 ? 'bg-emerald-50 text-emerald-600' :
          item.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
        }`}>
          {item.stock > 10 ? 'In Stock' : item.stock > 0 ? 'Low Stock' : 'Out of Stock'}
        </span>
      </td>
      <td className="p-5 text-right">
        <div className="flex justify-end gap-1">
          <button onClick={() => handleOpenAction('view', item)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Eye size={14} />
          </button>
          <button onClick={() => handleOpenAction('edit', item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
});

const AInventory = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // --- STATE ---
  const [isReady, setIsReady] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionModal, setActionModal] = useState({ isOpen: false, mode: 'view', product: null });

  const { stats } = useSelector((state) => state.inventory);

  // --- REFRESH LOGIC ---
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    dispatch(fetchInventoryStats());
  }, [dispatch, queryClient]);

  // --- DEBOUNCE SEARCH ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- TANSTACK QUERY ---
  const { data, isFetching } = useQuery({
    queryKey: ['adminProducts', currentPage, debouncedSearch],
    queryFn: async () => {
      const start = performance.now();
      const response = await axios.get(`/api/v1/admin/products`, {
        params: { page: currentPage, keyword: debouncedSearch }
      });
      console.log(`✅ API Timing: ${(performance.now() - start).toFixed(2)}ms`);
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const productCount = data?.productCount || 0;

  // --- MUTATIONS ---
  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/v1/admin/product/${id}`),
    onSuccess: () => {
      handleRefresh();
    }
  });

  // --- EFFECTS ---
  useEffect(() => {
    setIsReady(true);
    dispatch(fetchInventoryStats());
  }, [dispatch]);

  // PREFETCH NEXT PAGE
  useEffect(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: ['adminProducts', nextPage, debouncedSearch],
        queryFn: () => axios.get(`/api/v1/admin/products`, {
          params: { page: nextPage, keyword: debouncedSearch }
        }).then(res => res.data),
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [currentPage, totalPages, debouncedSearch, queryClient]);

  // --- HANDLERS ---
  const handleOpenCreate = useCallback(() => setIsCreateOpen(true), []);

  const handleOpenAction = useCallback((mode, product) => {
    setActionModal({ isOpen: true, mode, product });
  }, []);

  const handleDelete = useCallback((id) => {
    if (window.confirm("Are you sure?")) deleteMutation.mutate(id);
  }, [deleteMutation]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [totalPages]);

  const isJustAdded = useCallback((createdAt) => {
    return (new Date().getTime() - new Date(createdAt).getTime()) < 300000;
  }, []);

  // --- MEMOIZED UI PIECES ---
  const statCards = useMemo(() => [
    { label: 'Total Products', val: `${stats.totalProducts || 0} Items`, icon: <Box size={20}/>, color: 'bg-slate-50 text-slate-600' },
    { label: 'Low Stock Alerts', val: `${stats.lowStockCount || 0} Rituals`, icon: <AlertCircle size={20}/>, color: 'bg-amber-50 text-amber-600' },
    { label: 'Inventory Value', val: `₹ ${stats.totalValue?.toLocaleString('en-IN')}`, icon: <CheckCircle2 size={20}/>, color: 'bg-emerald-50 text-emerald-600' }
  ], [stats]);

  const renderedTableBody = useMemo(() => {
    if (products.length === 0) return (
      <tbody>
        <tr>
          <td colSpan="6" className="p-20 text-center">
            <div className="flex flex-col items-center gap-2 opacity-20">
              <Search size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest">No matching products</p>
            </div>
          </td>
        </tr>
      </tbody>
    );

    return (
      <tbody className="divide-y divide-slate-100">
        {products.map((item) => (
          <ProductRow
            key={item._id}
            item={item}
            isJustAdded={isJustAdded(item.createdAt)}
            handleOpenAction={handleOpenAction}
            handleDelete={handleDelete}
          />
        ))}
      </tbody>
    );
  }, [products, isJustAdded, handleOpenAction, handleDelete]);

  return (
    <div className={`space-y-6 transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}>

      {/* 1. TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-slate-200 transition-colors">
            <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-800">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 2. ACTION BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs font-medium focus:bg-white focus:border-slate-200 outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleRefresh} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-all">
            <Filter size={14} /> Refresh
          </button>
          <button onClick={handleOpenCreate} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-slate-800 transition-all">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* 3. PRODUCT TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm min-h-[400px] relative">
        {isFetching && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-400" size={30} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Product & SKU</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Pricing</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Stock</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            {renderedTableBody}
          </table>
        </div>

        {/* 4. PAGINATION */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {products.length} of {productCount} Products
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-xl border border-slate-200 text-slate-400 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-8 h-8 rounded-xl text-[10px] font-black transition-colors ${currentPage === i + 1 ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-200'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-slate-200 text-slate-400 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateInventoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onRefresh={handleRefresh}
      />

      <InventoryActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ ...actionModal, isOpen: false })}
        mode={actionModal.mode}
        product={actionModal.product}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default AInventory;
