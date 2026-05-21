import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <AdminNav />
      <div className="pl-60">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
