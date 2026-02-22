import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useGetGyms, useAddGym, useUpdateGym, useDeleteGym } from '../../hooks/useQueries';
import { type Gym } from '../../backend';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, MapPin } from 'lucide-react';

export default function GymsTab() {
  const { data: gyms = [] } = useGetGyms();
  const addGym = useAddGym();
  const updateGym = useUpdateGym();
  const deleteGym = useDeleteGym();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [details, setDetails] = useState('');

  const resetForm = () => {
    setName('');
    setAddress('');
    setDetails('');
    setEditingGym(null);
  };

  const handleEdit = (gym: Gym) => {
    setEditingGym(gym);
    setName(gym.name);
    setAddress(gym.address);
    setDetails(gym.details);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !address.trim()) {
      toast.error('Please fill in name and address');
      return;
    }

    try {
      const gymData: Gym = {
        id: editingGym?.id || `gym-${Date.now()}`,
        name: name.trim(),
        address: address.trim(),
        details: details.trim(),
      };

      if (editingGym) {
        await updateGym.mutateAsync(gymData);
        toast.success('Gym updated successfully');
      } else {
        await addGym.mutateAsync(gymData);
        toast.success('Gym added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save gym');
      console.error(error);
    }
  };

  const handleDelete = async (gymId: string) => {
    if (!confirm('Are you sure you want to delete this gym?')) return;

    try {
      await deleteGym.mutateAsync(gymId);
      toast.success('Gym deleted successfully');
    } catch (error) {
      toast.error('Failed to delete gym');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gym Locations</CardTitle>
            <CardDescription>Manage training locations</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Gym
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGym ? 'Edit Gym' : 'Add New Gym'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Downtown Fitness Center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details">Details (Optional)</Label>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Additional information..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={addGym.isPending || updateGym.isPending}>
                    {addGym.isPending || updateGym.isPending ? 'Saving...' : 'Save Gym'}
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
        {gyms.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No gyms yet. Add your first location!</p>
        ) : (
          <div className="space-y-4">
            {gyms.map((gym) => (
              <Card key={gym.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{gym.name}</h3>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{gym.address}</span>
                      </div>
                      {gym.details && <p className="text-sm text-muted-foreground">{gym.details}</p>}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(gym)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(gym.id)}
                        disabled={deleteGym.isPending}
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
