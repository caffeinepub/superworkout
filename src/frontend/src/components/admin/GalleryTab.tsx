import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useGetGalleryImages, useAddGalleryImage, useDeleteGalleryImage } from '../../hooks/useQueries';
import { ExternalBlob, type GalleryImage } from '../../backend';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

export default function GalleryTab() {
  const { data: images = [] } = useGetGalleryImages();
  const addImage = useAddGalleryImage();
  const deleteImage = useDeleteGalleryImage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetForm = () => {
    setDescription('');
    setImageFile(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const imageData: GalleryImage = {
        id: `gallery-${Date.now()}`,
        description: description.trim(),
        image: imageBlob,
      };

      await addImage.mutateAsync(imageData);
      toast.success('Image added successfully');
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to add image');
      console.error(error);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await deleteImage.mutateAsync(imageId);
      toast.success('Image deleted successfully');
    } catch (error) {
      toast.error('Failed to delete image');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gallery</CardTitle>
            <CardDescription>Manage gallery images</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Image</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Image description..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
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
                  <Button type="submit" disabled={addImage.isPending}>
                    {addImage.isPending ? 'Adding...' : 'Add Image'}
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
        {images.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No images yet. Add your first image!</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id}>
                <CardContent className="p-4">
                  <div className="aspect-video relative rounded-lg overflow-hidden mb-3">
                    <img src={image.image.getDirectURL()} alt={image.description} className="w-full h-full object-cover" />
                  </div>
                  {image.description && <p className="text-sm text-muted-foreground mb-3">{image.description}</p>}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                    disabled={deleteImage.isPending}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
