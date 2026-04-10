import { Routes, Route } from "react-router-dom";

// Public Pages
import HomePage from "../pages/HomePage/HomePage";
import LoginForm from "../features/auth/LoginForm";
import SignUpForm from "../features/auth/SignUpForm";
import ProductDetail from "../pages/products/ProductDetail";
import AllProducts from "../pages/products/AllProducts";

import FAQS from "../pages/FAQs";

// Protected Pages
import ProtectedRoute from "../features/auth/Middleware/ProtectedRoute";

import AdminRoutes from "./AdminRoutes";
import UserDashboardLayout from "../layouts/UserDashboardLayout";
import UDashboardPage from "../features/user/UDashboardPage";
import UOrdersPage from "../features/user/UOrdersPage";
import UProfilePage from "../features/user/UProfilePage";
import UAccountPage from "../features/user/UAccountPage";
import ForgotPassword from "../features/auth/forgotPassword";
import ResetPassword from "../features/auth/ResetPassword";
import Login2FA from "../features/auth/Login2FA";
import VerifyEmail from "../features/auth/verifyEmail";
import SalonPartner from "../features/user/SalonPatners";
import CheckoutPage from "../pages/products/Checkout";
import OrdersPage from "../pages/products/OrderPage";
import OrderDetailsPage from "../pages/products/OrderDetailPage";
import ShippingPolicy from "../pages/ShippingPolicy";
import ReturnExchange from "../pages/ReturnExchange";
import OurStory from "../pages/OurStory"
import ContactUs from "../pages/ContactUs"

const AppRoutes = () => {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/sign-up" element={<SignUpForm />} />
      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/login-2fa" element={<Login2FA />} />

      <Route path="/products" element={<AllProducts />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/order/:id" element={<OrderDetailsPage />} />
      <Route path="/faqs" element={<FAQS />} />

      {/* --- Protected User Dashboard Section --- */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* URL: /dashboard */}
        <Route index element={<UDashboardPage />} />

        {/* URL: /dashboard/track-order */}
        <Route path="orders" element={<UOrdersPage />} />

        <Route path="profile" element={<UProfilePage />} />

        <Route path="partnership" element={<SalonPartner />} />

        <Route path="settings" element={<UAccountPage />} />
      </Route>

      <Route path="/shipping-policies" element={<ShippingPolicy />} />

        <Route path="/return-exchange" element={<ReturnExchange />} />

        <Route path="/contact-us" element={<ContactUs />} />

        <Route path="/our-story" element={<OurStory />} />

        {/* <Route path="/sustainability" element={<Sustainability />} />
<Route path="/science" element={<Science />} />
<Route path="/journal" element={<Journal />} />
<Route path="/studies" element={<Studies />} /> */}

      {/* --- Protected Admin Routes --- */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute isAdmin={true}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* --- 404 Page --- */}
      <Route
        path="*"
        element={
          <div className="p-20 text-center font-bold text-2xl">
            404 - Page Not Found
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
