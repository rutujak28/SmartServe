import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage, deleteImage } from '@/lib/services/storageService';
import { toast } from 'sonner';

interface ImageUploadProps {
  bucket: 'menu-images' | 'canteen-logos';
  currentImageUrl?: string;
  onUploadComplete: (url: string, path: string) => void;
  onDelete?: () => void;
  maxSizeMB?: number;
  className?: string;
}

export const ImageUpload = ({
  bucket,
  currentImageUrl,
  onUploadComplete,
  onDelete,
  maxSizeMB = 5,
  className = '',
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    const result = await uploadImage(file, bucket);
    setUploading(false);

    if (result.error) {
      toast.error(result.error);
      setPreviewUrl(currentImageUrl || null);
    } else {
      toast.success('Image uploaded successfully');
      onUploadComplete(result.url, result.path);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!currentImageUrl || !onDelete) return;

    // Extract path from URL
    const url = new URL(currentImageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
    const path = pathMatch ? pathMatch[1] : '';

    if (path) {
      const result = await deleteImage(bucket, path);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Image deleted successfully');
        setPreviewUrl(null);
        onDelete();
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleDelete}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF up to {maxSizeMB}MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {previewUrl ? 'Change Image' : 'Upload Image'}
          </>
        )}
      </Button>
    </div>
  );
};
