
import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import AdminDashboardLayout from "../layouts/AdminDashboardLayout";

// Features
import AAdminDashboard from "../features/admin/ADashboardPage";
import AAnalytics from "../features/admin/AAnalytics";
import AMarketing from "../features/admin/AMarketing";
import AInventory from "../features/admin/AInventory";
import AOrder from "../features/admin/AOrder";
import ACustomer from "../features/admin/ACustomer";
import AShipping from "../features/admin/AShipping";
import AStoreFront from "../features/admin/AStoreFront";
import ASecurity from "../features/admin/ASecurity";
import ASettings from "../features/admin/ASettings";
import AReviews from "../features/admin/review/AReviews";
import ASalonPartner from "../features/admin/boutiquepartners/ASalonPatner";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Every route inside here is relative to "/admin"
          because of the path="/admin/*" in AppRoutes.js
      */}
      <Route element={<AdminDashboardLayout />}>
        {/* URL: /admin */}
        <Route index element={<AAdminDashboard />} />

        {/* URL: /admin/analytics */}
        <Route path="analytics" element={<AAnalytics />} />

        {/* URL: /admin/marketing */}
        <Route path="marketing" element={<AMarketing />} />

        {/* URL: /admin/inventory */}
        <Route path="inventory" element={<AInventory />} />

        {/* URL: /admin/orders */}
        <Route path="orders" element={<AOrder />} />

        {/* URL: /admin/customers */}
        <Route path="customers" element={<ACustomer />} />

        {/* URL: /admin/shipping */}
        <Route path="shipping" element={<AShipping />} />

        {/* URL: /admin/partnerships - NEW */}

        <Route path="partnership" element={<ASalonPartner />} />

        {/* URL: /admin/partnerships - NEW */}
        <Route path="reviews" element={<AReviews />} />

        {/* URL: /admin/storefront */}
        <Route path="storefront" element={<AStoreFront />} />

        {/* URL: /admin/security */}
        <Route path="security" element={<ASecurity />} />

        {/* URL: /admin/settings */}
        <Route path="settings" element={<ASettings />} />

        {/* URL: /admin/products - Properly defined now */}

        {/* Catch-all: If user types wrong URL under /admin, redirect to /admin index */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
