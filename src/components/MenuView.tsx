import React from 'react';
import { Topping, ToppingCategory, SoupType, SiteConfig } from '../types';
import ChiliFlameIcon from './ChiliFlameIcon';

interface MenuViewProps {
  toppings: Topping[];
  selectedToppings: { [id: string]: number };
  onAddTopping: (id: string) => void;
  onRemoveTopping: (id: string) => void;
  selectedSoup: SoupType;
  onSelectSoup: (soup: SoupType) => void;
  spiceLevel: number;
  onSelectSpice: (level: number) => void;
  onNavigateToCart: () => void;
  siteConfig: SiteConfig;
}

export default function MenuView({
  toppings,
  selectedToppings,
  onAddTopping,
  onRemoveTopping,
  selectedSoup,
  onSelectSoup,
  spiceLevel,
  onSelectSpice,
  onNavigateToCart,
  siteConfig
}: MenuViewProps) {
  const [activeCategory, setActiveCategory] = React.useState<ToppingCategory>('Semua');
  const [searchQuery, setSearchQuery] = React.useState('');

  const categories: ToppingCategory[] = ['Semua', 'Kerupuk', 'Protein', 'Sayuran', 'Premium'];

  const soupBases = siteConfig.soups;

  const spiceLevels = siteConfig.spices.map(s => ({
    level: s.level,
    title: s.label,
    emoji: s.emoji,
    color: s.color
  }));

  const filteredToppings = toppings.filter(t => {
    const matchesCategory = activeCategory === 'Semua' || t.category === activeCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalSelectedItems = Object.values(selectedToppings).reduce((acc, curr) => acc + curr, 0);

  const calculateTotalPrice = () => {
    return toppings.reduce((acc, curr) => {
      const qty = selectedToppings[curr.id] || 0;
      return acc + (qty * curr.price);
    }, 0);
  };

  return (
    <div id="menu-view" className="w-full pb-24">
      {/* Page Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-anybody text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Pilih Isian Seblak Favoritmu
        </h1>
        <p className="font-plus text-slate-500 text-sm md:text-base">
          Atur kuah, level pedas, dan kreasikan seblak prasmanan impianmu dengan topping premium.
        </p>
      </div>

      {/* Step 1: Soup & Spice Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Soup selection (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-orange-500 font-bold">ramen_dining</span>
            <h2 className="font-anybody text-lg font-extrabold text-slate-900">
              1. Pilih Kuah Racikan
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {soupBases.map((soup) => {
              const isSelected = selectedSoup === soup.type;
              return (
                <button
                  key={soup.type}
                  id={`soup-card-${soup.type.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSelectSoup(soup.type)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? `ring-2 ring-slate-900 ${soup.color}`
                      : 'border-slate-100 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md font-mono ${
                        isSelected ? 'bg-white/90 text-slate-850' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {soup.badge}
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-sm font-bold text-slate-950">
                          check_circle
                        </span>
                      )}
                    </div>
                    <h3 className="font-plus text-sm font-bold mb-1 text-slate-900">
                      {soup.type}
                    </h3>
                    <p className="font-plus text-xs text-slate-500 leading-relaxed">
                      {soup.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spice Level (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-red-500 font-bold">local_fire_department</span>
              <h2 className="font-anybody text-lg font-extrabold text-slate-900">
                2. Pilih Level Pedas
              </h2>
            </div>

            <p className="font-plus text-xs text-slate-400 mb-6 leading-relaxed">
              Tentukan jumlah sendok sambal rawit murni. Setiap level meningkatkan sensasi gigitan!
            </p>

            {/* Visual Level Display */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 mb-6 transition-all duration-300 ${
              spiceLevel >= 3 ? 'bg-red-50/70 border-red-200 text-red-950' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center gap-4">
                <ChiliFlameIcon level={spiceLevel} size="md" className="w-12 h-12" />
                <div>
                  <h4 className="font-anybody text-base font-black text-slate-900">
                    {spiceLevels[spiceLevel].title}
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">Sensasi Panas</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black font-anybody block text-slate-900">
                  {spiceLevel * 2} <span className="text-xs font-normal">Sdm</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Sambal Cabai</span>
              </div>
            </div>
          </div>

          {/* Level Sliders Buttons */}
          <div className="grid grid-cols-6 gap-1.5">
            {spiceLevels.map((lvl) => (
              <button
                key={lvl.level}
                onClick={() => onSelectSpice(lvl.level)}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  spiceLevel === lvl.level
                    ? 'bg-slate-900 text-white border-slate-900 scale-105 font-bold shadow-xs'
                    : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:scale-[1.02]'
                }`}
              >
                <ChiliFlameIcon level={lvl.level} size="sm" className="w-7 h-7 mb-1" />
                <span className="text-[10px] font-mono">Lvl {lvl.level}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Topping Gallery Grid */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-100 mb-8">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-500 font-bold">lunch_dining</span>
            <h2 className="font-anybody text-lg font-extrabold text-slate-900">
              3. Pilih Topping Sepuasnya
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Column Search Bar */}
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-bold select-none">
                search
              </span>
              <input
                id="topping-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari topping favoritmu..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-plus focus:outline-hidden focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-400 text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center"
                >
                  <span className="material-symbols-outlined text-sm font-bold">close</span>
                </button>
              )}
            </div>

            {/* Category tabs filter */}
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 max-w-full sm:pb-0 -mx-6 px-6 sm:mx-0 sm:px-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex-shrink-0 ${
                    activeCategory === cat
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toppings list or empty state */}
        {filteredToppings.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 my-4">
            <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">search_off</span>
            <h3 className="font-anybody text-sm font-black text-slate-800 uppercase tracking-wide">Topping Tidak Ditemukan</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed font-plus">
              Kami tidak menemukan topping yang cocok dengan pencarian "{searchQuery}" di kategori "{activeCategory}". Coba kata kunci lain atau bersihkan filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('Semua');
              }}
              className="mt-5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs font-plus"
            >
              Reset Pencarian & Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredToppings.map((topping) => {
              const quantity = selectedToppings[topping.id] || 0;
              const isOutofStock = topping.stock <= 0;

              return (
                <div
                  key={topping.id}
                  id={`topping-card-${topping.id}`}
                  className={`bg-white border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 relative group ${
                    quantity > 0
                      ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50/5'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div>
                    {/* Image section */}
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                      <img
                        src={topping.image}
                        alt={topping.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-col items-start">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {topping.category}
                        </span>
                        {topping.popular && (
                          <span className="bg-red-500 text-white text-[9px] font-bold font-anybody px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px] font-bold">local_fire_department</span>
                            POPULER
                          </span>
                        )}
                      </div>
                      
                      <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-sm text-yellow-300 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md">
                        Rp {topping.price.toLocaleString('id-ID')}
                      </div>

                      {isOutofStock && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center flex-col p-4 text-center">
                          <span className="material-symbols-outlined text-red-500 text-3xl font-bold mb-1">warning</span>
                          <span className="text-white text-xs font-bold font-anybody">STOK HABIS</span>
                          <span className="text-slate-400 text-[10px] mt-0.5 leading-tight">Sedang disiapkan dapur</span>
                        </div>
                      )}
                    </div>

                    {/* Body info */}
                    <div className="p-4">
                      <h3 className="font-plus text-sm font-bold text-slate-900 mb-1 leading-tight line-clamp-1">
                        {topping.name}
                      </h3>
                      <p className="font-plus text-[11px] text-slate-400 leading-normal mb-3 line-clamp-2">
                        {topping.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Controls */}
                  <div className="px-4 pb-4 pt-2 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Stok: <span className={`font-semibold ${topping.stock <= 5 && !isOutofStock ? 'text-red-500' : 'text-slate-600'}`}>{topping.stock} pcs</span>
                    </span>

                    {isOutofStock ? (
                      <button
                        disabled
                        className="bg-slate-100 text-slate-350 font-bold px-3 py-1.5 rounded-lg text-xs cursor-not-allowed"
                      >
                        Habis
                      </button>
                    ) : quantity > 0 ? (
                      <div className="flex items-center gap-2 bg-orange-500 rounded-lg p-0.5 text-white shadow-sm">
                        <button
                          onClick={() => onRemoveTopping(topping.id)}
                          className="w-7 h-7 flex items-center justify-center font-bold text-white hover:bg-orange-600 rounded-md transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">remove</span>
                        </button>
                        <span className="text-xs font-bold px-1.5 font-mono">
                          {quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (quantity < topping.stock) {
                              onAddTopping(topping.id);
                            }
                          }}
                          disabled={quantity >= topping.stock}
                          className={`w-7 h-7 flex items-center justify-center font-bold text-white hover:bg-orange-600 rounded-md transition-colors ${
                            quantity >= topping.stock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">add</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddTopping(topping.id)}
                        className="flex items-center gap-1 bg-slate-950 hover:bg-slate-850 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">add</span>
                        Tambah
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Sticky Summary Bar */}
      {totalSelectedItems > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl z-40 bg-slate-950/95 backdrop-blur-md border border-slate-800 shadow-2xl py-3.5 px-5 rounded-2xl flex items-center justify-between transition-all">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-orange-500 text-white text-[10px] font-mono font-black w-5 h-5 rounded-full flex items-center justify-center">
                {totalSelectedItems}
              </span>
              <span className="font-plus text-xs text-slate-300">Topping terpilih</span>
            </div>
            <div className="font-plus text-base sm:text-lg font-extrabold text-white">
              Rp {calculateTotalPrice().toLocaleString('id-ID')}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <span className="text-[10px] text-slate-500 font-mono block">Kuah Base</span>
              <span className="text-xs font-bold text-slate-200">{selectedSoup}</span>
            </div>
            <button
              onClick={onNavigateToCart}
              className="flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-orange-600/20 transition-all cursor-pointer font-plus text-xs sm:text-sm"
            >
              Lihat Nampan
              <span className="material-symbols-outlined font-bold text-sm">shopping_basket</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
