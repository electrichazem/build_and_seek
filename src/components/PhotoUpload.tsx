import React, { useState, useRef } from 'react';
import { useToastHelpers } from '../contexts/ToastContext';
import { apiService } from '../api';

interface PhotoUploadProps {
  questionId: number;
  onSuccess: (response: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  questionId, 
  onSuccess, 
  onError, 
  disabled = false 
}) => {
  const { showError } = useToastHelpers();
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    setCapturing(true);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPhoto(result);
        };
        reader.readAsDataURL(file);
      }
      setCapturing(false);
    };
    
    input.click();
  };

  const selectFromGallery = () => {
    fileInputRef.current?.click();
  };

  const submitPhoto = async () => {
    if (!photo) return;
    
    setUploading(true);
    try {
      const response = await apiService.submitPhoto(questionId, photo);
      if (response.success) {
        onSuccess(response);
        setPhoto(null);
      } else {
        const errorMessage = response.error || 'Failed to submit photo';
        onError(errorMessage);
        showError('Photo Submission Failed', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError(errorMessage);
      showError('Photo Submission Failed', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const clearPhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Photo Preview */}
      {photo && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Photo Preview</h3>
            <button
              onClick={clearPhoto}
              className="text-white/60 hover:text-white transition-colors"
              disabled={uploading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="relative">
            <img 
              src={photo} 
              alt="Captured photo" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium">Click to view full size</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!photo && (
          <>
            <button
              onClick={capturePhoto}
              disabled={disabled || capturing}
              className="flex-1 bg-blue-500/20 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0d47a1] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {capturing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Opening Camera...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Take Photo
                </div>
              )}
            </button>

            <button
              onClick={selectFromGallery}
              disabled={disabled}
              className="flex-1 bg-white/20 text-white px-4 py-3 rounded-lg font-semibold hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0d47a1] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Choose from Gallery
              </div>
            </button>
          </>
        )}

        {photo && (
          <button
            onClick={submitPhoto}
            disabled={uploading || disabled}
            className="w-full bg-white text-[#0d47a1] py-3 px-4 rounded-lg font-semibold hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0d47a1] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0d47a1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading Photo...
              </div>
            ) : (
              'Submit Photo'
            )}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Instructions */}
      {!photo && (
        <div className="text-white/70 text-sm">
          <p className="mb-2">📱 <strong>Mobile:</strong> Use "Take Photo" to capture with your camera</p>
          <p>💻 <strong>Desktop:</strong> Use "Choose from Gallery" to select an image file</p>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
