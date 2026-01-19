"use client";

import { useRouter } from "next/navigation";
import SidebarItem from "@/components/dashboard/SidebarItem";
import StatCard from "@/components/dashboard/StatCard";
import TableRow from "@/components/dashboard/TableRow";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex">

     
      <aside className="hidden md:flex w-64 bg-white shadow-lg flex-col">
        <div className="p-6 text-xl font-bold text-blue-600">
          Padoshi Kitchen
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem title="Dashboard" active />
          <SidebarItem title="Orders" active={false} />
          <SidebarItem title="Customers" active={false} />
          <SidebarItem title="Menu" active={false} />
          <SidebarItem title="Settings" active={false} />
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => router.push("/")}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

   
      <main className="flex-1 p-6">

      
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-gray-500">admin@padoshi.com</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full">
              A
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Orders" value="1,245" />
          <StatCard title="Revenue" value="₹85,430" />
          <StatCard title="Customers" value="342" />
          <StatCard title="Pending Orders" value="18" />
        </div>

       
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Recent Orders
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <TableRow id="#ORD001" name="Rahul" status="Delivered" amount="₹450" />
                <TableRow id="#ORD002" name="Amit" status="Pending" amount="₹320" />
                <TableRow id="#ORD003" name="Neha" status="Cancelled" amount="₹210" />
                <TableRow id="#ORD004" name="Priya" status="Delivered" amount="₹780" />
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
