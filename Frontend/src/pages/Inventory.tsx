/**
 * Inventory Page
 * Sprint 7: Main inventory page wrapper
 */

import { InventoryPage } from '@/components/inventory/InventoryPage';
import Topbar from '@/components/layout/Topbar';

export function Inventory() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Topbar />
      <InventoryPage />
    </div>
  );
}

