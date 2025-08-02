// ----------------- START OF FINAL, ERROR-FREE FILE -----------------

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { IInquiry } from '@/types';
import { getInquiries, updateInquiryStatus } from '@/api/inquiryApi';
import { useAuthStore } from '@/store/authStore';
import { LoadingPage } from '@/components/shared/LoadingPage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminInquiriesPage() {
  const [allInquiries, setAllInquiries] = useState<IInquiry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');

  const { token } = useAuthStore.getState();

  const fetchInquiries = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getInquiries(token);
      setAllInquiries(data);
    } catch (error) {
      toast.error("Failed to fetch inquiries.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusUpdate = async (inquiryId: string, newStatus: IInquiry['status']) => {
    if (!token) return;
    try {
        await updateInquiryStatus(inquiryId, newStatus, token);
        toast.success("Inquiry status updated!");
        setAllInquiries(prev => prev.map(inq => inq._id === inquiryId ? { ...inq, status: newStatus } : inq));
    } catch (error) {
        toast.error("Failed to update status.");
    }
  };

  const filteredInquiries = useMemo(() => {
    return allInquiries.filter(inquiry =>
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allInquiries, searchTerm]);

  const getStatusBadge = (status: IInquiry['status']) => {
    switch (status) {
      case 'New': return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case 'In Progress': return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'Resolved': return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const truncateMessage = (message: string, maxLength: number = 60) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Inquiries</h1>
        <p className="text-lg text-gray-600">Manage and respond to customer inquiries and support requests</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-xl">Inquiry Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search inquiries by customer or subject..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); }}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-600">{filteredInquiries.length} inquir{filteredInquiries.length !== 1 ? 'ies' : 'y'} found</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-xl">All Inquiries</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Subject</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInquiries.map((inquiry) => ( // Changed to map over filteredInquiries directly
                <TableRow key={inquiry._id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{inquiry.name}</div>
                      <div className="text-sm text-muted-foreground">{inquiry.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{inquiry.subject}</div>
                      <div className="text-sm text-muted-foreground">{truncateMessage(inquiry.message)}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                  <TableCell>
                    <Select defaultValue={inquiry.status} onValueChange={(value) => handleStatusUpdate(inquiry._id, value as IInquiry['status'])}>
                        <SelectTrigger className="w-[120px] p-0 border-none focus:ring-0 bg-transparent h-auto">
                            {/* This line is causing the warning */}
                            <SelectValue>{getStatusBadge(inquiry.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => alert(`Full Message: \n\n${inquiry.message}`)}>
                      <Eye className="h-4 w-4 mr-1" /> View Full
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}