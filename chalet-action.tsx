import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Trash2Icon } from 'lucide-react';
import { Chalet } from './types/types';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { useDeleteChalet } from './hooks/useChalets';

interface ChaletActionsProps {
  chalet: Chalet;
}

export const ChaletActions = ({ chalet }: ChaletActionsProps) => {
  const { toast } = useToast();
  const deleteMutation = useDeleteChalet();
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);

  const handleConfirmDelete = () => {
    deleteMutation.mutate(chalet.id, {
      onSuccess: (_, id) => {
        toast({
          variant: 'success',
          title: 'Chalet deleted',
          description: `Chalet ${id} has been removed`,
        });
        setShowDeleteAlert(false);
        window.location.reload();
      },
      onError: (err) => {
        toast({
          variant: 'destructive',
          title: 'Error deleting chalet',
          description: err.message,
        });
      },
    });
  };

  return (
    <>
      {/* Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDeleteAlert(true)}>
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete Chalet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
