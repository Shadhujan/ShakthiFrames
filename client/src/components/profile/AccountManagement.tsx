// ----------------- START OF FINAL AccountManagement.tsx -----------------

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';

// Define the component's props using a TypeScript interface
interface AccountManagementProps {
  onDeleteAccount: () => Promise<void>;
  onExportData: () => Promise<void>;
}

// Renamed to AccountManagement for clarity
export function AccountManagement({ onDeleteAccount }: AccountManagementProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      await onDeleteAccount();
      toast.success('Account deleted successfully. You will be logged out.');
      setIsDialogOpen(false);
      // The parent component (UserProfilePage) will handle the actual logout and redirect.
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <Card className="mb-8 shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <CardTitle className="text-2xl text-black flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Account Management
        </CardTitle>
        <CardDescription>
          Manage your account
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">

        {/* Account Deletion Section */}
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action is permanent and cannot be undone.
            </AlertDescription>
          </Alert>
          <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Delete Account
          </h3>
          <p className="text-sm text-red-700 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                onClick={() => setDeleteConfirmation('')}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Are you absolutely sure?
                </DialogTitle>
                <DialogDescription>
                  This will permanently delete your account and all associated data.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm" className="font-semibold">
                    To confirm, please type <span className="font-bold text-destructive">DELETE</span> below:
                  </Label>
                  <Input
                    id="deleteConfirm"
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                >
                  {isDeleting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                  ) : (
                    <>I understand, delete my account</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------- END OF FINAL AccountManagement.tsx -----------------