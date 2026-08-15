import React from 'react';
import { Topping, SiteConfig } from '../types';
import ChiliFlameIcon from './ChiliFlameIcon';

interface HomeViewProps {
  onStartOrdering: () => void;
  popularToppings: Topping[];
  onSelectTopping: (topping: Topping) => void;
  onNavigateToAdmin: () => void;
  cartCount: number;
  onNavigateToTracking: () => void;
  siteConfig: SiteConfig;
}

export default function HomeView({
  onStartOrdering,
  popularToppings,
  onSelectTopping,
  onNavigateToAdmin,
  cartCount,
  onNavigateToTracking,
  siteConfig
}: HomeViewProps) {
  const [activeSpiceDemo, setActiveSpiceDemo] = React.useState<number>(3);

  // Helper to ensure phone number has only digits and starts with country code 62 for wa.me link
  const getCleanWaNumber = (num?: string): string => {
    if (!num) return '6281234567890';
    let clean = num.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return clean || '6281234567890';
  };

  const cleanWaNumber = getCleanWaNumber(siteConfig.whatsappNumber);
  const waGreeting = encodeURIComponent(`Halo Kak, saya mau tanya-tanya seputar ${siteConfig.siteName}...`);

  const spiceLevels = siteConfig.spices;

  return (
    <div id="home-view" className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 text-white rounded-3xl p-6 sm:p-10 md:p-16 mb-8 md:mb-12 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/10 rounded-full blur-2xl -ml-20 -mb-20"></div>
        
        <div className="relative max-w-2xl z-10">
          <h1 className="font-anybody text-3xl sm:text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4 sm:mb-6">
            {siteConfig.heroTitlePrefix || 'Seblak Prasmanan'} <br />
            <span className="text-yellow-300 underline decoration-yellow-400 decoration-wavy">{siteConfig.siteName}!</span>
          </h1>
          
          <p className="font-plus text-sm sm:text-base md:text-lg text-white/90 mb-6 sm:mb-8 max-w-lg leading-relaxed">
            {siteConfig.heroDescription || 'Nikmati sensasi pedas gurih yang bisa kamu atur sendiri. Ambil mangkokmu, pilih isian favorit sepuasnya, dan tentukan level pedasmu sampai nangis bahagia!'}
          </p>
        </div>
      </section>

      {/* Cara Main (Prasmanan Rules) */}
      <section className="mb-12 md:mb-16">
        <div className="text-center mb-8 md:mb-10 px-4">
          <h2 className="font-anybody text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
            {siteConfig.howToOrderTitle || 'Gimana Cara Mainnya?'}
          </h2>
          <p className="font-plus text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {siteConfig.howToOrderSubtitle || 'Hanya 4 langkah mudah untuk meracik seblak impianmu yang super nikmat.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              step: '01',
              title: siteConfig.step1Title || 'Pilih Isian',
              desc: siteConfig.step1Desc || 'Ambil mangkok & pilih bebas puluhan topping segar mulai dari kerupuk, ceker, sampai dumpling keju.',
              icon: 'soup_kitchen',
              color: 'border-amber-200 bg-amber-50/50 text-amber-600'
            },
            {
              step: '02',
              title: siteConfig.step2Title || 'Tentukan Level Pedas',
              desc: siteConfig.step2Desc || 'Pilih tingkat kepedasan dari level 0 (tanpa cabai) hingga level 5 yang bikin kesurupan.',
              icon: 'local_fire_department',
              color: 'border-red-200 bg-red-50/50 text-red-600'
            },
            {
              step: '03',
              title: siteConfig.step3Title || 'Pilih Kuah Racikan',
              desc: siteConfig.step3Desc || 'Pilih kuah spesial kami: Pedas Daun Jeruk, Kuah Original Hauche yang gurih, atau Cikur harum segar.',
              icon: 'ramen_dining',
              color: 'border-orange-200 bg-orange-50/50 text-orange-600'
            },
            {
              step: '04',
              title: siteConfig.step4Title || 'Bayar & Nikmati',
              desc: siteConfig.step4Desc || 'Konfirmasi pesananmu lewat E-Wallet QRIS atau bayar langsung di kasir. Santap selagi panas!',
              icon: 'celebration',
              color: 'border-green-200 bg-green-50/50 text-green-600'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${item.color}`}>
                  <span className="material-symbols-outlined text-2xl font-bold">{item.icon}</span>
                </div>
                <h3 className="font-plus text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="font-plus text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
              <span className="absolute top-6 right-6 font-anybody text-4xl font-extrabold text-slate-100 select-none">
                {item.step}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Spice Level Demo Slider Section */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <span className="text-yellow-400 font-bold tracking-widest text-xs uppercase block mb-2 font-plus">
              {siteConfig.spiceSectionBadge || 'LEVEL SPICINESS PREVIEW'}
            </span>
            <h2 className="font-anybody text-3xl font-extrabold mb-4 leading-tight">
              {siteConfig.spiceSectionTitle || 'Berani Coba Level Nangis?'}
            </h2>
            <p className="font-plus text-slate-400 text-sm leading-relaxed mb-6">
              {siteConfig.spiceSectionDesc || 'Cabai yang kami gunakan adalah cabai rawit merah segar pilihan, digiling langsung untuk menjaga aroma harum kencur dan kesegaran rasa pedas alami.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {spiceLevels.map((lvl) => (
                <button
                  key={lvl.level}
                  onClick={() => setActiveSpiceDemo(lvl.level)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                    activeSpiceDemo === lvl.level
                      ? 'bg-yellow-400 text-slate-900 border-yellow-400 shadow-md scale-105'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  Lvl {lvl.level}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-850 border border-slate-800 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between shadow-2xl">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <ChiliFlameIcon level={activeSpiceDemo} size="md" className="w-14 h-14" />
                <div>
                  <h4 className="font-anybody text-xl font-bold text-yellow-400">
                    {spiceLevels[activeSpiceDemo].label}
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">Sensasi Rasa</span>
                </div>
              </div>
              <p className="font-plus text-slate-300 text-sm leading-relaxed">
                "{spiceLevels[activeSpiceDemo].desc}"
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/50 border border-slate-800 min-w-[140px]">
              <span className="text-xs text-slate-500 font-bold mb-1 font-plus">SKALA PANAS</span>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <span
                    key={idx}
                    className={`w-3 h-5 rounded-sm transition-all duration-300 ${
                      idx <= activeSpiceDemo ? 'bg-red-500 shadow-sm shadow-red-500/50' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-xs font-mono font-bold ${spiceLevels[activeSpiceDemo].text}`}>
                {activeSpiceDemo * 20}% Firepower
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Topping Favorit */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-anybody text-3xl font-bold tracking-tight text-slate-900 mb-2">
              {siteConfig.favoriteToppingsTitle || 'Topping Ter-Hauche Favorit'}
            </h2>
            <p className="font-plus text-slate-500">
              {siteConfig.favoriteToppingsDesc || 'Isian seblak paling banyak dicari & dipesan pelanggan setia kami.'}
            </p>
          </div>
          <button
            onClick={onStartOrdering}
            className="hidden sm:flex items-center gap-1 text-red-600 hover:text-red-500 font-bold text-sm transition-colors cursor-pointer font-plus"
          >
            Lihat Semua Menu
            <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularToppings.slice(0, 3).map((topping) => (
            <div
              key={topping.id}
              className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={topping.image}
                  alt={topping.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black font-anybody px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">local_fire_department</span>
                  TERFAVORIT
                </div>
                <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md text-yellow-400 font-mono text-sm font-bold px-3 py-1 rounded-lg">
                  Rp {topping.price.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wide">
                    {topping.category}
                  </div>
                  <h3 className="font-plus text-lg font-bold text-slate-900 mb-2">
                    {topping.name}
                  </h3>
                  <p className="font-plus text-xs text-slate-500 leading-relaxed mb-4">
                    {topping.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    Stok: <span className={topping.stock <= 5 ? 'text-red-500 font-bold' : 'text-slate-600'}>{topping.stock} pcs</span>
                  </span>
                  <button
                    onClick={() => onSelectTopping(topping)}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">add_shopping_cart</span>
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lokasi & Kontak Section */}
      <section id="contact-section" className="mb-12 md:mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm items-stretch">
          {/* Column 1: Contact info */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
                <span className="material-symbols-outlined text-xs">storefront</span>
                {siteConfig.contactBadge || 'KUNJUNGI KAMI'}
              </div>
              <h2 className="font-anybody text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
                {siteConfig.contactTitle || 'Mampir Ke Kedai'} {siteConfig.siteName}!
              </h2>
              <p className="font-plus text-xs sm:text-sm text-slate-500 leading-relaxed">
                {siteConfig.contactDesc || 'Nikmati langsung kesegaran kuah kencur dan gurihnya bumbu seblak prasmanan kami yang hangat langsung dari wajan koki.'}
              </p>
            </div>

            <div className="space-y-4">
              {/* Alamat */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0 border border-orange-100/50">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                </div>
                <div>
                  <h4 className="font-plus text-xs font-bold text-slate-400 uppercase tracking-wider">Alamat Kedai</h4>
                  <p className="font-plus text-sm text-slate-800 font-semibold mt-0.5 leading-relaxed">
                    {siteConfig.address}
                  </p>
                </div>
              </div>

              {/* Jam Operasional */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0 border border-green-100/50">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                </div>
                <div>
                  <h4 className="font-plus text-xs font-bold text-slate-400 uppercase tracking-wider">Jam Operasional</h4>
                  <p className="font-plus text-sm text-slate-800 font-semibold mt-0.5 flex items-center gap-2">
                    {siteConfig.operationalHours}
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                      BUKA
                    </span>
                  </p>
                </div>
              </div>

              {/* Kontak */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-100/50">
                  <span className="material-symbols-outlined text-lg">phone_in_talk</span>
                </div>
                <div>
                  <h4 className="font-plus text-xs font-bold text-slate-400 uppercase tracking-wider">Hubungi Kami</h4>
                  <p className="font-plus text-sm text-slate-800 font-semibold mt-0.5">
                    WhatsApp: <a href={`https://wa.me/${cleanWaNumber}?text=${waGreeting}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">+{cleanWaNumber}</a>
                  </p>
                  <p className="font-plus text-xs text-slate-500 mt-0.5">Email: halo@seblakhauche.com</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanWaNumber}?text=${waGreeting}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-emerald-500/10 transition-colors cursor-pointer text-sm font-plus"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.004 2c-5.51 0-9.99 4.49-9.99 10 0 2.01.59 3.88 1.61 5.46L2 22l4.72-1.54c1.51.93 3.26 1.48 5.14 1.48 5.51 0 10-4.49 10-10s-4.49-10-10-10zm5.98 14.15c-.24.67-.81 1.23-1.44 1.55-.57.29-1.29.43-3.64-.53-2.82-1.16-4.63-4.03-4.77-4.22-.14-.19-1.11-1.48-1.11-2.81 0-1.34.68-1.99.92-2.26.24-.26.53-.33.7-.33.17 0 .34 0 .49.01.15.01.35-.06.55.41.2.49.69 1.68.75 1.8.06.12.1.26.02.42-.08.17-.18.36-.3.51-.12.15-.25.32-.36.46-.12.14-.26.29-.11.55.15.25.65 1.07 1.4 1.73.96.85 1.77 1.11 2.02 1.24.25.13.4.11.55-.06.15-.17.65-.75.82-1.01.17-.26.34-.22.58-.13.24.09 1.53.72 1.79.85.26.13.43.19.49.3.06.11.06.64-.18 1.31z"/>
                </svg>
                Tanya Lewat WhatsApp
              </a>
            </div>
          </div>

          {/* Column 2: Maps */}
          <div className="lg:col-span-7 h-80 sm:h-96 lg:h-auto min-h-[320px] rounded-2xl overflow-hidden relative bg-slate-50 group">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(siteConfig.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Kedai"
              className="absolute inset-0 w-full h-full"
            ></iframe>
            
            <div className="absolute bottom-4 right-4 z-10">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(siteConfig.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer font-plus"
              >
                <span className="material-symbols-outlined text-sm">directions</span>
                Petunjuk Arah
              </a>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
