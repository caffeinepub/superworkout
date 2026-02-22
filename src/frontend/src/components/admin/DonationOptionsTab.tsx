import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import {
  useGetDonationOptions,
  useAddDonationOption,
  useUpdateDonationOption,
  useDeleteDonationOption,
} from '../../hooks/useQueries';
import { type DonationOption } from '../../backend';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function DonationOptionsTab() {
  const { data: options = [] } = useGetDonationOptions();
  const addOption = useAddDonationOption();
  const updateOption = useUpdateDonationOption();
  const deleteOption = useDeleteDonationOption();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<DonationOption | null>(null);
  const [method, setMethod] = useState('');
  const [details, setDetails] = useState('');

  const resetForm = () => {
    setMethod('');
    setDetails('');
    setEditingOption(null);
  };

  const handleEdit = (option: DonationOption) => {
    setEditingOption(option);
    setMethod(option.method);
    setDetails(option.details);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!method.trim() || !details.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const optionData: DonationOption = {
        id: editingOption?.id || `option-${Date.now()}`,
        method: method.trim(),
        details: details.trim(),
      };

      if (editingOption) {
        await updateOption.mutateAsync(optionData);
        toast.success('Donation option updated successfully');
      } else {
        await addOption.mutateAsync(optionData);
        toast.success('Donation option added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save donation option');
      console.error(error);
    }
  };

  const handleDelete = async (optionId: string) => {
    if (!confirm('Are you sure you want to delete this donation option?')) return;

    try {
      await deleteOption.mutateAsync(optionId);
      toast.success('Donation option deleted successfully');
    } catch (error) {
      toast.error('Failed to delete donation option');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Donation Options</CardTitle>
            <CardDescription>Manage payment and donation methods</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingOption ? 'Edit Donation Option' : 'Add New Donation Option'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Input
                    id="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    placeholder="e.g., PayPal, Bank Transfer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details">Details</Label>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Account details, instructions, etc."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={addOption.isPending || updateOption.isPending}>
                    {addOption.isPending || updateOption.isPending ? 'Saving...' : 'Save Option'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {options.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No donation options yet. Add your first option!</p>
        ) : (
          <div className="space-y-4">
            {options.map((option) => (
              <Card key={option.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{option.method}</h3>
                      <p className="text-sm text-muted-foreground">{option.details}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(option)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(option.id)}
                        disabled={deleteOption.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
