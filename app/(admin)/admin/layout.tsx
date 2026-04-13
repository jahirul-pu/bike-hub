import Link from 'next/link';
import { LayoutDashboard, CarFront, Bike, Wrench, ShieldCheck, ShoppingCart, LogOut } from 'lucide-react';
import { signOut } from '@/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 border-t border-transparent">
      {/* Sidebar Navigation Menu */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 flex flex-col shadow-2xl z-50">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/" className="text-xl font-bold text-white uppercase tracking-wider">
            <span className="text-blue-500">Bike</span>Hub
            <span className="text-xs bg-blue-600 px-2 py-0.5 rounded ml-2 align-middle font-medium">ADMIN</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium text-sm">Overview</span>
          </Link>
          
          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Mgmt</p>
          </div>
          <Link href="/admin/inventory/bikes" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <Bike size={20} />
            <span className="font-medium text-sm">Bike Catalog</span>
          </Link>
          <Link href="/admin/inventory/vehicles" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <CarFront size={20} />
            <span className="font-medium text-sm">Marketplace Listings</span>
          </Link>
          <Link href="/admin/inventory/parts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <Wrench size={20} />
            <span className="font-medium text-sm">Parts & Gear</span>
          </Link>
          
          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operations</p>
          </div>
          <Link href="/admin/certification" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <ShieldCheck size={20} />
            <span className="font-medium text-sm">Certifications</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <ShoppingCart size={20} />
            <span className="font-medium text-sm">Orders</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/20 transition-colors text-sm font-medium">
              <LogOut size={20} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
