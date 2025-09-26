import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ImagePlus,
  X,
  Loader2,
  Edit2,
  GripVertical,
  Check,
  AlertCircle,
  Upload,
  WifiOff,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import { API_URL } from '@/config';
import { ChaletImage } from '@/context/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface ImageUploaderProps {
  images: ChaletImage[];
  onImagesChange: (images: ChaletImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

interface UploadProgress {
  total: number;
  uploaded: number;
  currentFile?: string;
  percentage?: number;
  transferredBytes?: number;
  totalBytes?: number;
}

interface NetworkStatus {
  online: boolean;
  connectionType?: string;
}

interface FailedUpload {
  file: File;
  error: string;
  retryCount: number;
}

// Enhanced constants
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // Increased to 25MB to match backend
const DEFAULT_MAX_IMAGES = 15; // Increased to match backend
//const CHUNK_SIZE = 1024 * 1024; // 1MB chunks for progress tracking
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Enhanced utility functions
const validateFile = (file: File): string | null => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }
  if (file.size === 0) {
    return 'File appears to be empty';
  }
  return null;
};

const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

const validateTotalUploadSize = (files: File[]): boolean => {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const maxTotalSize = 250 * 1024 * 1024; // 200MB total
  return totalSize <= maxTotalSize;
};

// Sortable Image Component
const SortableImage = React.memo(
  ({
    image,
    index,
    onRemove,
    onLabelEdit,
    disabled = false,
  }: {
    image: ChaletImage;
    index: number;
    onRemove: () => void;
    onLabelEdit: () => void;
    disabled?: boolean;
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: image.key || `img-${index}`,
      disabled,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 1 : 0,
    };

    const handleLabelEdit = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onLabelEdit();
      },
      [onLabelEdit, disabled],
    );

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onRemove();
      },
      [onRemove, disabled],
    );

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative group bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all
        ${isDragging ? 'ring-2 ring-blue-500 shadow-lg border-blue-300' : 'border-gray-200'}
        ${disabled ? 'opacity-50' : ''}`}
      >
        <div className="relative">
          <img
            src={image.url}
            alt={image.alt}
            className="w-full h-48 object-cover"
            loading="lazy"
          />

          {image.isMain && (
            <Badge className="absolute top-2 left-2 bg-blue-500 text-white">Main Image</Badge>
          )}

          {!disabled && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={handleRemove}
                type="button"
                className="bg-red-500/80 hover:bg-red-600/90 text-white rounded-full p-1.5 
                       opacity-0 group-hover:opacity-100 transition-all duration-200
                       hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
              <div
                {...attributes}
                {...listeners}
                className="bg-black/50 hover:bg-black/70 p-1.5 rounded cursor-move 
                       opacity-0 group-hover:opacity-100 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                role="button"
                tabIndex={0}
                aria-label="Drag to reorder"
              >
                <GripVertical className="text-white" size={14} />
              </div>
            </div>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 truncate flex-1">
              {image.label || 'Untitled'}
            </span>
            {!disabled && (
              <button
                onClick={handleLabelEdit}
                type="button"
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Edit label"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

SortableImage.displayName = 'SortableImage';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = DEFAULT_MAX_IMAGES,
  disabled = false,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [editingImage, setEditingImage] = useState<ChaletImage | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({ online: true });
  const [failedUploads, setFailedUploads] = useState<FailedUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus({
        online: navigator.onLine,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      });
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Initial check
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  const validateFiles = useCallback((files: FileList): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];
    const fileArray = Array.from(files);

    // Validate total upload size first
    if (!validateTotalUploadSize(fileArray)) {
      errors.push('Total upload size exceeds 250MB limit');
      return { valid, errors };
    }

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        valid.push(file);
      }
    });

    return { valid, errors };
  }, []);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const uploadWithRetry = async (formData: FormData, retryCount: number = 0): Promise<Response> => {
    try {
      const controller = new AbortController();

      // Increase timeout significantly for production
      const timeout = 300000; // 5 minutes total timeout
      const timeoutId = setTimeout(() => {
        console.log(`Upload timeout after ${timeout}ms, attempt ${retryCount + 1}`);
        controller.abort();
      }, timeout);

      // Add progress tracking for better UX
      const startTime = Date.now();

      const response = await fetch(`${API_URL}/v1/images/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // Add headers for better handling
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      clearTimeout(timeoutId);
      const requestTime = Date.now() - startTime;
      console.log(`Upload request completed in ${requestTime}ms, status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`HTTP Error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      return response;
    } catch (error) {
      const isTimeout =
        error instanceof Error &&
        (error.name === 'AbortError' || error.message.includes('timeout'));

      const isNetworkError =
        error instanceof Error &&
        (error.message.includes('fetch') || error.message.includes('network'));

      console.log(`Upload attempt ${retryCount + 1} failed:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        isTimeout,
        isNetworkError,
        retryCount,
      });

      // Only retry on specific errors and if we haven't exceeded max attempts
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        const shouldRetry =
          isTimeout ||
          isNetworkError ||
          (error instanceof Error && error.message.includes('HTTP 5'));

        if (shouldRetry) {
          // Exponential backoff with jitter
          const baseDelay = RETRY_DELAY * Math.pow(2, retryCount);
          const jitter = Math.random() * 1000; // Add up to 1 second of jitter
          const delay = baseDelay + jitter;

          console.log(
            `Retrying upload in ${delay}ms (attempt ${retryCount + 2}/${MAX_RETRY_ATTEMPTS + 1})`,
          );

          await sleep(delay);
          return uploadWithRetry(formData, retryCount + 1);
        }
      }

      // Don't retry on client errors (4xx) or after max attempts
      throw error;
    }
  };

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setValidationErrors([]);
      setFailedUploads([]);

      // Check network status
      if (!networkStatus.online) {
        toast({
          variant: 'destructive',
          title: 'No internet connection',
          description: 'Please check your connection and try again.',
        });
        return;
      }

      // Check total image limit
      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        toast({
          variant: 'destructive',
          title: 'Maximum image limit reached',
          description: `You can upload a maximum of ${maxImages} images.`,
        });
        return;
      }

      // Validate files
      const { valid: validFiles, errors } = validateFiles(files);

      if (errors.length > 0) {
        setValidationErrors(errors);
        toast({
          variant: 'destructive',
          title: 'File validation failed',
          description: `${errors.length} file(s) failed validation. Check the errors below.`,
        });
        return;
      }

      const filesToUpload = validFiles.slice(0, remainingSlots);

      if (filesToUpload.length < validFiles.length) {
        toast({
          title: 'Some files skipped',
          description: `Only ${filesToUpload.length} files uploaded due to image limit.`,
        });
      }

      setIsUploading(true);
      const totalBytes = filesToUpload.reduce((sum, file) => sum + file.size, 0);

      setUploadProgress({
        total: filesToUpload.length,
        uploaded: 0,
        currentFile: filesToUpload[0]?.name,
        percentage: 0,
        transferredBytes: 0,
        totalBytes,
      });

      const uploadStartTime = Date.now();

      try {
        // Pre-upload validation
        console.log('Starting upload process:', {
          fileCount: filesToUpload.length,
          totalSize: `${(totalBytes / 1024 / 1024).toFixed(2)}MB`,
          files: filesToUpload.map((f) => ({
            name: f.name,
            size: `${(f.size / 1024 / 1024).toFixed(2)}MB`,
            type: f.type,
          })),
        });

        const formData = new FormData();
        filesToUpload.forEach((file, index) => {
          console.log(`Adding file ${index + 1}: ${file.name} (${file.size} bytes)`);
          formData.append('images', file);
        });

        // Update progress during upload
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (!prev) return null;
            // const elapsed = Date.now() - uploadStartTime;
            // const estimatedTotal = (elapsed / Math.max(prev.percentage || 1, 1)) * 100;
            // Note: 'remaining' calculation is for future enhancement potential
            // const remaining = Math.max(0, estimatedTotal - elapsed);

            return {
              ...prev,
              percentage: Math.min(95, (prev.percentage || 0) + 1), // Slowly increment
            };
          });
        }, 2000);

        const response = await uploadWithRetry(formData);

        clearInterval(progressInterval);

        // Complete progress
        setUploadProgress((prev) => (prev ? { ...prev, percentage: 100 } : null));

        const result = await response.json();
        const uploadTime = Date.now() - uploadStartTime;

        console.log('Upload completed successfully:', {
          uploadTime: `${uploadTime}ms`,
          result: result.data?.stats,
        });
        const uploadedImages = result.data.images;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newImages: ChaletImage[] = uploadedImages.map((img: any, index: number) => ({
          url: img.publicUrl,
          alt: filesToUpload[index]?.name || `Image ${images.length + index + 1}`,
          key: img.key,
          label: `Image ${images.length + index + 1}`,
          isMain: images.length === 0 && index === 0,
        }));

        const updatedImages = [...images, ...newImages];
        onImagesChange(updatedImages);

        // Show success with compression stats
        const stats = result.data.stats;
        toast({
          title: 'Images uploaded successfully',
          description: `${newImages.length} image(s) uploaded. ${
            stats?.spaceSaved ? `Space saved: ${stats.spaceSaved}` : ''
          }`,
        });

        // Clear failed uploads on success
        setFailedUploads([]);
      } catch (error) {
        const uploadTime = Date.now() - uploadStartTime;

        console.log('Upload failed:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          uploadTime,
          fileCount: filesToUpload.length,
          totalSize: `${(totalBytes / 1024 / 1024).toFixed(2)}MB`,
        });

        // Enhanced error handling
        let errorMessage = 'There was an error uploading your images.';
        let errorTitle = 'Upload failed';

        if (error instanceof Error) {
          if (error.message.includes('timeout') || error.name === 'AbortError') {
            errorTitle = 'Upload timeout';
            errorMessage =
              'The upload timed out. This may happen with large files or slow connections. Please try again with smaller files or check your internet connection.';
          } else if (error.message.includes('HTTP 413')) {
            errorTitle = 'File too large';
            errorMessage =
              'One or more files exceed the server upload limit. Please try with smaller files.';
          } else if (error.message.includes('HTTP 415')) {
            errorTitle = 'Unsupported file type';
            errorMessage =
              'One or more files have an unsupported format. Please use JPEG, PNG, WebP, or GIF files.';
          } else if (error.message.includes('HTTP 5')) {
            errorTitle = 'Server error';
            errorMessage = 'There was a server error. Please try again in a few moments.';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorTitle = 'Network error';
            errorMessage =
              'Network connection failed. Please check your internet connection and try again.';
          } else {
            errorMessage = error.message;
          }
        }

        toast({
          variant: 'destructive',
          title: errorTitle,
          description: errorMessage,
        });

        // Add to failed uploads for retry
        const failed: FailedUpload[] = filesToUpload.map((file) => ({
          file,
          error: error instanceof Error ? error.message : 'Unknown error',
          retryCount: 0,
        }));
        setFailedUploads(failed);

        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description:
            error instanceof Error ? error.message : 'There was an error uploading your images.',
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [images, maxImages, onImagesChange, toast, validateFiles, networkStatus.online],
  );

  const retryFailedUploads = useCallback(async () => {
    if (failedUploads.length === 0) return;

    const filesToRetry = failedUploads.filter((f) => f.retryCount < MAX_RETRY_ATTEMPTS);
    if (filesToRetry.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Maximum retry attempts reached',
        description: 'Unable to upload some files after multiple attempts.',
      });
      return;
    }

    // Create fake event to reuse upload logic
    const fakeEvent = {
      target: { files: filesToRetry.map((f) => f.file) },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // Update retry count
    setFailedUploads((prev) => prev.map((f) => ({ ...f, retryCount: f.retryCount + 1 })));

    await handleImageUpload(fakeEvent);
  }, [failedUploads, handleImageUpload, toast]);

  const removeImage = useCallback(
    async (indexToRemove: number) => {
      if (disabled) return;

      const imageToRemove = images[indexToRemove];

      if (imageToRemove.key) {
        try {
          const response = await fetch(
            `${API_URL}/v1/images/${encodeURIComponent(imageToRemove.key)}`,
            { method: 'DELETE' },
          );

          if (!response.ok) {
            throw new Error('Failed to delete image from server');
          }

          const updatedImages = images
            .filter((_, index) => index !== indexToRemove)
            .map((img, idx) => ({
              ...img,
              isMain: idx === 0,
            }));

          onImagesChange(updatedImages);

          toast({
            title: 'Image removed',
            description: 'The image has been successfully removed.',
          });
        } catch (error) {
          console.error('Image deletion error:', error);
          toast({
            variant: 'destructive',
            title: 'Deletion failed',
            description: 'Could not remove the image. Please try again.',
          });
        }
      }
    },
    [images, onImagesChange, toast, disabled],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (disabled) return;

      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = images.findIndex(
          (img) => img.key === active.id || `img-${images.indexOf(img)}` === active.id,
        );
        const newIndex = images.findIndex(
          (img) => img.key === over.id || `img-${images.indexOf(img)}` === over.id,
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const newImages = arrayMove(images, oldIndex, newIndex).map((img, idx) => ({
            ...img,
            isMain: idx === 0,
          }));

          onImagesChange(newImages);
        }
      }
    },
    [images, onImagesChange, disabled],
  );

  const updateImageLabel = useCallback(
    (newLabel: string) => {
      if (!editingImage || !newLabel.trim()) return;

      const updatedImages = images.map((img) =>
        img === editingImage ? { ...img, label: newLabel.trim() } : img,
      );

      onImagesChange(updatedImages);
      setEditingImage(null);
      setCustomLabel('');
    },
    [editingImage, images, onImagesChange],
  );

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current && !isUploading && !disabled && images.length < maxImages) {
      fileInputRef.current.click();
    }
  }, [isUploading, disabled, images.length, maxImages]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the main container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        // Create a fake event to reuse the upload logic
        const fakeEvent = {
          target: { files },
        } as React.ChangeEvent<HTMLInputElement>;

        handleImageUpload(fakeEvent);
      }
    },
    [disabled, isUploading, handleImageUpload],
  );

  const remainingSlots = maxImages - images.length;

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleImageUpload}
        className="hidden"
        disabled={isUploading || disabled || remainingSlots <= 0}
      />

      {/* Network Status Indicator */}
      {!networkStatus.online && (
        <Alert className="border-red-200 bg-red-50">
          <WifiOff className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            No internet connection. Please check your connection to upload images.
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-1">Some files could not be uploaded:</div>
            <ul className="text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Failed Uploads */}
      {failedUploads.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium mb-1">
                  {failedUploads.length} file(s) failed to upload
                </div>
                <ul className="text-sm space-y-1">
                  {failedUploads.slice(0, 3).map((failed, index) => (
                    <li key={index}>
                      {failed.file.name}: {failed.error}
                    </li>
                  ))}
                  {failedUploads.length > 3 && <li>... and {failedUploads.length - 3} more</li>}
                </ul>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={retryFailedUploads}
                disabled={isUploading}
                className="ml-4"
              >
                <RefreshCw size={14} className="mr-1" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="text-blue-600" size={16} />
            <span className="text-sm font-medium text-blue-800">
              Uploading {uploadProgress.uploaded + 1} of {uploadProgress.total}
            </span>
            <div className="flex items-center gap-1 ml-auto">
              {networkStatus.online ? (
                <Wifi className="text-green-600" size={14} />
              ) : (
                <WifiOff className="text-red-600" size={14} />
              )}
              <span className="text-xs text-gray-600">{networkStatus.connectionType}</span>
            </div>
          </div>
          <Progress
            value={(uploadProgress.uploaded / uploadProgress.total) * 100}
            className="mb-2"
          />
          {uploadProgress.currentFile && (
            <p className="text-xs text-blue-600">Processing: {uploadProgress.currentFile}</p>
          )}
          {uploadProgress.transferredBytes && uploadProgress.totalBytes && (
            <p className="text-xs text-blue-600">
              {formatFileSize(uploadProgress.transferredBytes)} of{' '}
              {formatFileSize(uploadProgress.totalBytes)}
            </p>
          )}
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-200 ${
            isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <SortableContext
            items={images.map((img, idx) => img.key || `img-${idx}`)}
            strategy={horizontalListSortingStrategy}
          >
            {images.map((img, idx) => (
              <SortableImage
                key={img.key || `img-${idx}`}
                image={img}
                index={idx}
                onRemove={() => removeImage(idx)}
                onLabelEdit={() => {
                  setEditingImage(img);
                  setCustomLabel(img.label);
                }}
                disabled={disabled}
              />
            ))}
          </SortableContext>

          {/* Upload Button */}
          {remainingSlots > 0 && (
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading || disabled || !networkStatus.online}
              className={`h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center 
                       transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
                       ${
                         disabled || !networkStatus.online
                           ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                           : isUploading
                             ? 'border-blue-300 bg-blue-50 cursor-wait'
                             : isDragOver
                               ? 'border-blue-500 bg-blue-100'
                               : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                       }`}
              aria-label="Upload images"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                  <span className="text-sm text-blue-600 mt-2">Processing...</span>
                </>
              ) : !networkStatus.online ? (
                <>
                  <WifiOff className="text-gray-400" size={32} />
                  <span className="text-sm text-gray-500 mt-2">No Connection</span>
                </>
              ) : (
                <>
                  <ImagePlus className="text-gray-400" size={32} />
                  <span className="text-sm text-gray-500 mt-2">
                    Add Photo{remainingSlots > 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">or drag & drop here</span>
                </>
              )}
            </button>
          )}
        </div>
      </DndContext>

      {/* Label editing modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Edit Image Label</h3>
            <div className="flex items-center gap-2">
              <Input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Enter image label"
                className="flex-1"
                autoFocus
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateImageLabel(customLabel);
                  } else if (e.key === 'Escape') {
                    setEditingImage(null);
                    setCustomLabel('');
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => updateImageLabel(customLabel)}
                disabled={!customLabel.trim()}
              >
                <Check size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingImage(null);
                  setCustomLabel('');
                }}
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">{customLabel.length}/50 characters</p>
          </div>
        </div>
      )}

      {/* Enhanced Helper Text */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {images.length === 0
            ? `Upload up to ${maxImages} images to showcase your chalet`
            : remainingSlots > 0
              ? `${remainingSlots} more image${remainingSlots !== 1 ? 's' : ''} can be added`
              : `Maximum ${maxImages} images reached`}
        </span>
        <div className="flex items-center gap-4">
          <span>Max size: {MAX_FILE_SIZE / (1024 * 1024)}MB per image</span>
          <span>Total limit: 200MB</span>
          <div className="flex items-center gap-1">
            {networkStatus.online ? (
              <Wifi className="text-green-500" size={12} />
            ) : (
              <WifiOff className="text-red-500" size={12} />
            )}
            <span className={networkStatus.online ? 'text-green-600' : 'text-red-600'}>
              {networkStatus.online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
