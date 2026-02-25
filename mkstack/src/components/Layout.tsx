import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LoginArea } from '@/components/auth/LoginArea';
import { X, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/discussions', label: 'Discussions' },
    { to: '/facts', label: 'Datacenter Facts' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-coral-50">
      <header className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-coral-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SDF</span>
                </div>
                <span className="font-bold text-xl text-gray-900 hidden sm:block">
                  Shenandoah Datacenter Festival
                </span>
                <span className="font-bold text-lg text-gray-900 sm:hidden">
                  SDF 2026
                </span>
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(to)
                      ? "bg-pink-100 text-pink-700"
                      : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                  )}
                >
                  {label}
                </Link>
              ))}
              <div className="ml-4">
                <LoginArea className="max-w-48" />
              </div>
            </div>

            {/* Mobile: login + hamburger */}
            <div className="md:hidden flex items-center gap-2">
              <LoginArea className="max-w-32" />
              <button
                className="text-gray-700 hover:text-pink-600 p-1 rounded-md"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-pink-100 py-2 pb-4">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-2 text-sm font-medium transition-colors rounded-md mx-1 my-0.5",
                    isActive(to)
                      ? "bg-pink-100 text-pink-700"
                      : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                About the Festival
              </h3>
              <p className="mt-4 text-base text-gray-600">
                A satirical celebration of the digital infrastructure revolution coming to
                Frederick County's agricultural heartland. Beyond the jokes, there's a
                serious conversation to be had.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                Quick Links
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/" className="text-base text-gray-600 hover:text-pink-600">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/discussions" className="text-base text-gray-600 hover:text-pink-600">
                    Discussions
                  </Link>
                </li>
                <li>
                  <Link to="/facts" className="text-base text-gray-600 hover:text-pink-600">
                    Datacenter Facts
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                Take Action
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a
                    href="https://protectfrederick.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-pink-600 hover:text-pink-800 font-medium"
                  >
                    Protect Frederick County
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.frederickcountyhomesteaders.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-gray-600 hover:text-pink-600"
                  >
                    Frederick County Homesteaders
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.frederickcountyva.gov/1014/Planning-Commission"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-gray-600 hover:text-pink-600"
                  >
                    Planning Commission Meetings
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.vafb.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-gray-600 hover:text-pink-600"
                  >
                    Virginia Farm Bureau
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 text-center">
              © 2026 Shenandoah Datacenter Festival. A satirical celebration of digital infrastructure.{' '}
              <a
                href="https://soapbox.pub/mkstack"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-500 transition-colors"
              >
                Vibed with MKStack
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
