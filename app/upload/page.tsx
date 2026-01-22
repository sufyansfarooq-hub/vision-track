'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Upload, ArrowLeft, Image as ImageIcon, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to upload');
        setUploading(false);
        return;
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `vision-boards/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vision-boards')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vision-boards')
        .getPublicUrl(filePath);

      // Create vision board record
      const { data: visionBoardData, error: boardError } = await supabase
        .from('vision_boards')
        .insert([{
          user_id: user.id,
          image_url: publicUrl,
          title: `Vision Board ${new Date().toLocaleDateString()}`
        }])
        .select()
        .single();

      if (boardError) throw boardError;

      // Simulate AI analysis (you can replace this with actual AI call)
      setAnalyzing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to goals page
      router.push('/goals');

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-2 border-purple-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/goals"
              className="w-10 h-10 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-purple-400 hover:shadow-md transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Upload Vision Board
              </h1>
              <p className="text-sm text-gray-600 font-medium">Transform your vision into trackable goals</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* How It Works */}
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Upload Image</div>
                <div className="text-sm text-gray-600">Choose a photo of your vision board</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">AI Analysis</div>
                <div className="text-sm text-gray-600">We identify distinct goals</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Start Tracking</div>
                <div className="text-sm text-gray-600">Set milestones and track progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white p-8 rounded-2xl border-2 border-purple-200 shadow-lg">
          
          {!preview ? (
            // Upload Zone
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading || analyzing}
              />
              <div className="border-4 border-dashed border-purple-300 rounded-2xl p-12 text-center hover:border-purple-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Choose your vision board</h3>
                <p className="text-gray-600 mb-4">Click to browse or drag and drop</p>
                <p className="text-sm text-gray-500">PNG, JPG, or JPEG (Max 10MB)</p>
              </div>
            </label>
          ) : (
            // Preview & Upload
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={preview}
                  alt="Vision board preview"
                  className="w-full rounded-xl border-2 border-gray-200 shadow-md"
                />
                {!uploading && !analyzing && (
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setError(null);
                    }}
                    className="absolute top-4 right-4 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-gray-400 hover:shadow-md transition font-medium text-sm"
                  >
                    Change Image
                  </button>
                )}
              </div>

              {error && (
                <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-300 rounded-xl">
                  <p className="text-rose-700 font-medium">{error}</p>
                </div>
              )}

              {(uploading || analyzing) && (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-300 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    <div>
                      <div className="font-bold text-gray-900 mb-1">
                        {uploading && !analyzing && 'Uploading your vision board...'}
                        {analyzing && 'Analyzing with AI...'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {uploading && !analyzing && 'Please wait while we upload your image'}
                        {analyzing && 'Identifying your goals and creating trackable regions'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!uploading && !analyzing && (
                <button
                  onClick={handleUpload}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Analyze with AI
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-emerald-200 shadow-lg">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Tips for Best Results
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Use good lighting and clear images</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Make sure all goals are visible and distinct</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Physical boards work best when photographed straight-on</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Digital collages should have clear sections for each goal</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
