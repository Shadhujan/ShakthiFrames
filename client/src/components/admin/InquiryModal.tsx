import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Calendar } from 'lucide-react';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'handled';
}

interface InquiryModalProps {
  inquiry: Inquiry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InquiryModal({ inquiry, isOpen, onClose }: InquiryModalProps) {
  if (!inquiry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Inquiry Details</span>
            <Badge variant={inquiry.status === 'new' ? 'default' : 'secondary'}>
              {inquiry.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{inquiry.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subject */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Subject</h3>
            <p className="text-gray-700">{inquiry.subject}</p>
          </div>

          <Separator />

          {/* Message */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Message</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="flex space-x-3 pt-4">
            <a
              href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject}`}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>Reply via Email</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}