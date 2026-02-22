import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import {
  useGetWorkoutPrograms,
  useAddWorkoutProgram,
  useUpdateWorkoutProgram,
  useDeleteWorkoutProgram,
} from '../../hooks/useQueries';
import { ExternalBlob, type WorkoutProgram } from '../../backend';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function WorkoutProgramsTab() {
  const { data: programs = [] } = useGetWorkoutPrograms();
  const addProgram = useAddWorkoutProgram();
  const updateProgram = useUpdateWorkoutProgram();
  const deleteProgram = useDeleteWorkoutProgram();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageFile(null);
    setUploadProgress(0);
    setEditingProgram(null);
  };

  const handleEdit = (program: WorkoutProgram) => {
    setEditingProgram(program);
    setTitle(program.title);
    setDescription(program.description);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let imageBlob: ExternalBlob | undefined;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (editingProgram?.image) {
        imageBlob = editingProgram.image;
      }

      const programData: WorkoutProgram = {
        id: editingProgram?.id || `program-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        image: imageBlob,
      };

      if (editingProgram) {
        await updateProgram.mutateAsync(programData);
        toast.success('Program updated successfully');
      } else {
        await addProgram.mutateAsync(programData);
        toast.success('Program added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save program');
      console.error(error);
    }
  };

  const handleDelete = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      await deleteProgram.mutateAsync(programId);
      toast.success('Program deleted successfully');
    } catch (error) {
      toast.error('Failed to delete program');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workout Programs</CardTitle>
            <CardDescription>Manage your training programs</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProgram ? 'Edit Program' : 'Add New Program'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Beginner Calisthenics"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the program..."
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image (Optional)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <p className="text-sm text-muted-foreground">Uploading: {uploadProgress}%</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={addProgram.isPending || updateProgram.isPending}>
                    {addProgram.isPending || updateProgram.isPending ? 'Saving...' : 'Save Program'}
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
        {programs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No programs yet. Add your first program!</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {programs.map((program) => (
              <Card key={program.id}>
                <CardContent className="p-4">
                  {program.image && (
                    <div className="aspect-video relative rounded-lg overflow-hidden mb-3">
                      <img
                        src={program.image.getDirectURL()}
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold mb-2">{program.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{program.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(program)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(program.id)}
                      disabled={deleteProgram.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
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
