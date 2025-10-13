/**
 * Shop Page
 * Sprint 7: Main shop page wrapper
 */

import { ShopPage } from '@/components/shop/ShopPage';
import Topbar from '@/components/layout/Topbar';

export function Shop() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Topbar />
      <ShopPage />
    </div>
  );
}

