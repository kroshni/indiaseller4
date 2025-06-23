import CustomerForm from '../components/CustomerForm';

export default function AddCustomerPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Customer</h1>
      <CustomerForm />
    </div>
  );
} 