'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Rocket, Calendar, User, LogOut, Menu, X, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Get initial session on mount
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getInitialSession();

    // Listen for auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        menuButtonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await supabase.auth.signOut();
    router.push('/');
  }

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <nav className="border-b border-white/10 bg-black/50 backdrop-blur-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <Rocket className="w-6 h-6" />
              <span>Event Horizon</span>
            </Link>
            {/* Desktop Events link */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/events"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/events'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Events
              </Link>
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile for authenticated users */}
          <div className={`${user ? 'hidden md:flex' : 'flex'} items-center gap-4`}>
            {user ? (
              <>
                <Link href="/events/new">
                  <Button variant="outline" size="sm">
                    Create Event
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Menu Button - Only shown for authenticated users */}
          {user && (
            <button
              ref={menuButtonRef}
              type="button"
              onClick={toggleMobileMenu}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/20 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {user && (
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden="true"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Panel */}
      {user && (
        <div
          ref={menuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className={`fixed top-16 right-0 w-72 max-w-[calc(100vw-2rem)] bg-black/95 backdrop-blur-md border-l border-b border-white/10 rounded-bl-lg shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="px-4 py-4 space-y-1">
            {/* Events Link */}
            <Link
              href="/events"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                pathname === '/events'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-5 h-5" aria-hidden="true" />
              Browse Events
            </Link>

            {/* Create Event Link */}
            <Link
              href="/events/new"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                pathname === '/events/new'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              Create Event
            </Link>

            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-5 h-5" aria-hidden="true" />
              Dashboard
            </Link>

            {/* Divider */}
            <div className="border-t border-white/10 my-2" role="separator" />

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors w-full text-left"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
