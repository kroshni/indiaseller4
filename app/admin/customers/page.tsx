'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');
  const router = useRouter();

  useEffect(() => {
    fetchCustomers();
  }, [page, search, sort, order]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/customers?page=${page}&search=${search}&sort=${sort}&order=${order}`
      );
      const data = await response.json();
      setCustomers(data.customers);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSort = (column: string) => {
    if (sort === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(column);
      setOrder('asc');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusChange = async (customerId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`/api/admin/customers/${customerId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchCustomers();
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={() => router.push('/admin/customers/add')}>
          Add Customer
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={handleSearch}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
              Name {sort === 'name' && (order === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
              Email {sort === 'email' && (order === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead onClick={() => handleSort('phone')} className="cursor-pointer">
              Phone {sort === 'phone' && (order === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Loading customers...
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No customers found
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer: any) => (
              <TableRow key={customer.customer_id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <Switch
                    checked={customer.status}
                    onCheckedChange={(checked) =>
                      handleStatusChange(customer.customer_id, checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">Actions</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/admin/customers/${customer.customer_id}`)
                        }
                      >
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/admin/customers/edit/${customer.customer_id}`)
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(customer.customer_id)}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center gap-2 mt-4">
        <Button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="py-2">
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
} 