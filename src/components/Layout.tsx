import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutDashboard,
  Palette,
  Settings,
  User,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  BadgeCheck,
  Menu
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

function useRandomDisplayName() {
  const [name, setName] = useState('');
  React.useEffect(() => {
    const key = 'adgen_display_name';
    const stored = localStorage.getItem(key);
    if (stored) {
      setName(stored);
      return;
    }
    const adjectives = ['adorable','bold','calm','clever','daring','elegant','gentle','modern','polished','stellar','brisk','crisp','sleek','vivid','chill'];
    const nouns = ['anon','creator','marketer','brandster','visionary','builder','strategist','doer','operator'];
    const rand = (arr: string[]) => arr[Math.floor(Math.random()*arr.length)];
    const generated = `${rand(adjectives)} ${rand(nouns)}`;
    localStorage.setItem(key, generated);
    setName(generated);
  }, []);
  return name || 'adorable anon';
}

export function Layout({ children, showNavbar = false }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const displayName = useRandomDisplayName();
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('adgen_theme') || 'light');
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem('adgen_sidebar') === 'collapsed');
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('adgen_theme', theme);
  }, [theme]);

  React.useEffect(() => {
    if (collapsed) localStorage.setItem('adgen_sidebar', 'collapsed');
    else localStorage.removeItem('adgen_sidebar');
  }, [collapsed]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, current: location.pathname === '/' },
    { name: 'Campaign', href: '/marketing', icon: Megaphone, current: location.pathname === '/marketing' },
    { name: 'Brand Kit', href: '/brand', icon: BadgeCheck, current: location.pathname === '/brand' },
    { name: 'Editor', href: '/editor', icon: ImageIcon, current: location.pathname === '/editor' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black dark:text-white">
      {showNavbar && (
        <div className="min-h-screen">
          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 z-50">
            <button onClick={() => navigate('/')} className="flex items-center">
              {logoError ? (
                <div className="w-10 h-10 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white dark:text-black" />
                </div>
              ) : (
                <img
                  src="/adgen-logo.png"
                  alt="AdGen"
                  className="w-10 h-10 object-contain filter grayscale contrast-200 dark:invert"
                  onError={() => setLogoError(true)}
                />
              )}
              <span className="text-xl font-bold ml-2">AdGen</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
              <div className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-black border-l border-gray-200 dark:border-white/10 p-4" onClick={(e) => e.stopPropagation()}>
                <nav className="space-y-1 mt-16">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          navigate(item.href);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          item.current
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-white/80 dark:hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
                <div className="absolute bottom-4 left-4 right-4">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-semibold">A</div>
                    <div className="text-left">
                      <div className="text-sm font-semibold capitalize">{displayName}</div>
                      <div className="text-xs text-gray-500 dark:text-white/60">Settings</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <aside className={`hidden lg:flex ${collapsed ? 'w-16' : 'w-64'} fixed inset-y-0 left-0 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-black flex-col transition-all duration-200`}>
            {/* Logo */}
            <div className="h-16 px-2 flex items-center justify-center border-b border-gray-200 dark:border-white/10">
              <button onClick={() => navigate('/')} className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2'}`}>
                {logoError ? (
                  <div className={`${collapsed ? 'w-14 h-14' : 'w-10 h-10'} bg-black dark:bg-white rounded-lg flex items-center justify-center`}>
                    <Sparkles className={`${collapsed ? 'w-7 h-7' : 'w-5 h-5'} text-white dark:text-black`} />
                  </div>
                ) : (
                  <img
                    src="/adgen-logo.png"
                    alt="AdGen"
                    className={`${collapsed ? 'w-14 h-14' : 'w-10 h-10'} object-contain filter grayscale contrast-200 dark:invert`}
                    onError={() => setLogoError(true)}
                  />
                )}
                {!collapsed && <span className="text-xl font-bold ml-2">AdGen</span>}
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-white/80 dark:hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {!collapsed && <span>{item.name}</span>}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Section: Profile + Collapse */}
            <div className="border-t border-gray-200 dark:border-white/10">
              {/* Profile / Settings */}
              <div className="p-2">
              <button
                onClick={() => setShowSettings(true)}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10`}
              >
                <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-semibold">A</div>
                {!collapsed && (
                  <div className="text-left">
                    <div className="text-sm font-semibold capitalize">{displayName}</div>
                    <div className="text-xs text-gray-500 dark:text-white/60">Profile & Settings</div>
                  </div>
                )}
              </button>
              </div>
              
              {/* Collapse/Expand Button */}
              <div className="p-2 border-t border-gray-200 dark:border-white/10">
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="w-full flex items-center justify-center py-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-white/60"
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {collapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      <span className="text-sm">Collapse</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className={`pt-16 lg:pt-0 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'} transition-all duration-200`}>{children}</main>
        </div>
      )}
      {!showNavbar && <main className="relative">{children}</main>}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSettings(false)}></div>
          <div className="absolute right-6 top-6 w-80 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Theme</div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-2 rounded-md border text-sm ${theme==='light' ? 'bg-black text-white border-black' : 'border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10'}`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-2 rounded-md border text-sm ${theme==='dark' ? 'bg-white text-black border-white' : 'border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10'}`}
                  >
                    Dark
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-white/60">Only Light and Dark mode are available.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
