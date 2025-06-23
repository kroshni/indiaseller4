'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle, Eye, Pencil, Trash } from 'lucide-react';

interface Seller {
  seller_id: string;
  name: string;
  email: string;
  company_name: string;
  profile_picture_url: string;
  status: boolean;
  kyc_status: boolean;
  created_at: string;
}

export default function SellersPage() {
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const fetchSellers = async () => {
    try {
      const response = await fetch(
        `/api/admin/sellers/list?page=${currentPage}&search=${searchTerm}&sort=${sortField}&order=${sortOrder}`
      );
      if (!response.ok) throw new Error('Failed to fetch sellers');
      const data = await response.json();
      setSellers(data.sellers);
      setTotalPages(data.pagination.totalPages);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sellers');
      console.error('Error fetching sellers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [currentPage, searchTerm, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = async (sellerId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/sellers/list`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_id: sellerId, status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      fetchSellers();
    } catch (err) {
      console.error('Error updating seller status:', err);
    }
  };

  const handleKYCChange = async (sellerId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/sellers/list`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_id: sellerId, kyc_status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update KYC status');
      fetchSellers();
    } catch (err) {
      console.error('Error updating seller KYC status:', err);
    }
  };

  const handleBulkAction = async (action: string, value: boolean) => {
    if (!selectedSellers.length) return;

    try {
      const response = await fetch('/api/admin/sellers/list/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerIds: selectedSellers,
          action,
          value
        })
      });
      if (!response.ok) throw new Error('Failed to perform bulk action');
      setSelectedSellers([]);
      fetchSellers();
    } catch (err) {
      console.error('Error performing bulk action:', err);
    }
  };

  const handleDelete = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/admin/sellers/list/${sellerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete seller');

      // Refresh the list
      fetchSellers();
    } catch (err) {
      console.error('Error deleting seller:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete seller');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await fetch('/api/admin/sellers/list/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerIds: selectedSellers })
      });
      if (!response.ok) throw new Error('Failed to delete sellers');
      setSelectedSellers([]);
      setBulkDeleteDialogOpen(false);
      fetchSellers();
    } catch (err) {
      console.error('Error deleting sellers:', err);
    }
  };

  if (loading) return <div className="p-6">Loading sellers...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <UserIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Sellers</h1>
        </div>
        <Button onClick={() => router.push('/admin/sellers/add')}>Add Seller</Button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Select value={sortField} onValueChange={(value) => handleSort(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="company_name">Business Name</SelectItem>
              <SelectItem value="created_at">Created Date</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
            className="w-10 p-0"
          >
            {sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
          </Button>
        </div>

        {selectedSellers.length > 0 && (
          <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg">
            <span className="text-sm text-gray-600">{selectedSellers.length} sellers selected</span>
            <Button variant="outline" onClick={() => handleBulkAction('status', true)}>
              Set Active
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('status', false)}>
              Set Inactive
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('kyc_status', true)}>
              Set KYC Verified
            </Button>
            <Button variant="outline" onClick={() => handleBulkAction('kyc_status', false)}>
              Set KYC Pending
            </Button>
            <Button variant="destructive" onClick={() => setBulkDeleteDialogOpen(true)}>
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedSellers.length === sellers.length}
                  onCheckedChange={(checked) => {
                    setSelectedSellers(checked ? sellers.map(s => s.seller_id) : []);
                  }}
                />
              </TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellers.map((seller) => (
              <TableRow key={seller.seller_id}>
                <TableCell>
                  <Checkbox
                    checked={selectedSellers.includes(seller.seller_id)}
                    onCheckedChange={(checked) => {
                      setSelectedSellers(
                        checked
                          ? [...selectedSellers, seller.seller_id]
                          : selectedSellers.filter(id => id !== seller.seller_id)
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                      <Image
                        src={seller.profile_picture_url || 'https://via.placeholder.com/40'}
                        alt={seller.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{seller.name}</div>
                      <div className="text-sm text-gray-500">{seller.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{seller.company_name}</TableCell>
                <TableCell>
                  {seller.status ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle2 className="h-5 w-5 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-5 w-5 mr-1" /> Inactive
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {seller.kyc_status ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle2 className="h-5 w-5 mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-5 w-5 mr-1" /> Not Verified
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(seller.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/sellers/${seller.seller_id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/sellers/${seller.seller_id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => {
                            setSellerToDelete(seller.seller_id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Seller</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this seller? This action cannot be undone.
                            All related data including categories, certifications, addresses, documents,
                            and gallery images will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-800"
                            onClick={() => handleDelete(seller.seller_id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {sellers.length === 0 && (
          <div className="text-center py-6 text-gray-500">No sellers found</div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the seller and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => sellerToDelete && handleDelete(sellerToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete multiple sellers?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedSellers.length} sellers and all their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 