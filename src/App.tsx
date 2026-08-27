import React from 'react';
import { useApp } from './context/AppContext';
import { SplashScreen } from './components/auth/SplashScreen';
import { ChoiceScreen } from './components/auth/ChoiceScreen';
import { OwnerLoginScreen } from './components/auth/OwnerLoginScreen';
import { OwnerRegistrationScreen } from './components/auth/OwnerRegistrationScreen';
import { CustomerLoginScreen } from './components/auth/CustomerLoginScreen';
import { CustomerRegistrationScreen } from './components/auth/CustomerRegistrationScreen';
import { OwnerDashboardScreen } from './components/owner/OwnerDashboardScreen';
import { ProductListScreen } from './components/owner/ProductListScreen';
import { AddEditProductScreen } from './components/owner/AddEditProductScreen';
import { BillingScreen } from './components/owner/BillingScreen';
import { CustomersScreen } from './components/owner/CustomersScreen';
import { EmployeesScreen } from './components/owner/EmployeesScreen';
import { ReportScreen } from './components/owner/ReportScreen';
import { SettingsScreen } from './components/owner/SettingsScreen';
import { OwnerProfileScreen } from './components/owner/OwnerProfileScreen';
import { CustomerDashboardScreen } from './components/customer/CustomerDashboardScreen';
import { CustomerProductScreen } from './components/customer/CustomerProductScreen';
import { ProductDetailScreen } from './components/customer/ProductDetailScreen';
import { OrderScreen } from './components/customer/OrderScreen';
import { PaymentScreen } from './components/customer/PaymentScreen';
import { CustomerSupportScreen } from './components/customer/CustomerSupportScreen';
import { CustomerOrdersScreen } from './components/customer/CustomerOrdersScreen';

export const AppContent: React.FC = () => {
  const { currentScreen } = useApp();

  switch (currentScreen) {
    case 'splash':
      return <SplashScreen />;
    case 'choice':
      return <ChoiceScreen />;
    case 'ownerLogin':
      return <OwnerLoginScreen />;
    case 'ownerRegister':
      return <OwnerRegistrationScreen />;
    case 'customerLogin':
      return <CustomerLoginScreen />;
    case 'customerRegister':
      return <CustomerRegistrationScreen />;
    case 'ownerDashboard':
      return <OwnerDashboardScreen />;
    case 'products':
      return <ProductListScreen />;
    case 'addProduct':
    case 'editProduct':
      return <AddEditProductScreen />;
    case 'billing':
    case 'createBill':
      return <BillingScreen />;
    case 'customers':
      return <CustomersScreen />;
    case 'employees':
      return <EmployeesScreen />;
    case 'reports':
      return <ReportScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'ownerProfile':
      return <OwnerProfileScreen />;
    case 'customerDashboard':
      return <CustomerDashboardScreen />;
    case 'customerProducts':
      return <CustomerProductScreen />;
    case 'productDetail':
      return <ProductDetailScreen />;
    case 'order':
      return <OrderScreen />;
    case 'payment':
      return <PaymentScreen />;
    case 'customerSupport':
      return <CustomerSupportScreen />;
    case 'customerOrders':
      return <CustomerOrdersScreen />;
    default:
      return <ChoiceScreen />;
  }
};

export default function App() {
  return <AppContent />;
}
