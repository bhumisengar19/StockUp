import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Camera, User, Mail, Shield, CheckCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function AdminSettings() {
  const { user, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profileImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const submitData = new FormData();
      submitData.append('username', formData.username);
      submitData.append('email', formData.email);
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      await api.put('/users/profile', submitData);
      await checkAuth(); // Refresh global user state
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">Admin Profile Settings</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1 font-medium">Manage your administrator account and visual identity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Visuals */}
        <div className="space-y-6">
          <Card className="text-center p-8 border-none shadow-soft overflow-hidden relative">
             <div className="relative inline-block group">
               <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-primary/20 bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center">
                 {previewUrl ? (
                   <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <User className="w-12 h-12 text-secondary-400" />
                 )}
               </div>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-primary text-white shadow-lg hover:scale-110 transition-all"
               >
                 <Camera className="w-5 h-5" />
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={handleImageChange}
               />
             </div>

             <div className="mt-6">
               <h2 className="text-xl font-bold text-secondary-900 dark:text-white">{user?.username}</h2>
               <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1">Enterprise Admin</p>
             </div>

             <div className="mt-8 pt-6 border-t border-secondary-50 dark:border-secondary-800 flex items-center justify-center gap-2 text-secondary-400">
               <Shield className="w-4 h-4" />
               <span className="text-xs font-bold uppercase">Security Tier: Highest</span>
             </div>
          </Card>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2">
          <Card className="p-8 border-none shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                   <User className="absolute left-3 top-[38px] w-4 h-4 text-secondary-400" />
                   <Input 
                     label="Full Username" 
                     placeholder="Enter your professional name"
                     className="pl-10"
                     value={formData.username}
                     onChange={e => setFormData({...formData, username: e.target.value})}
                     required
                   />
                </div>

                <div className="relative">
                   <Mail className="absolute left-3 top-[38px] w-4 h-4 text-secondary-400" />
                   <Input 
                     label="Work Email Address" 
                     type="email"
                     placeholder="admin@company.com"
                     className="pl-10"
                     value={formData.email}
                     onChange={e => setFormData({...formData, email: e.target.value})}
                     required
                   />
                </div>
              </div>

              {success && (
                <div className="p-4 rounded-2xl bg-status-success/10 border border-status-success/20 text-status-success flex items-center gap-3 animate-slide-in">
                  <CheckCircle className="w-5 h-5" />
                  <p className="text-sm font-bold">Profile updated successfully!</p>
                </div>
              )}

              <div className="pt-4 flex items-center gap-4">
                <Button 
                  type="submit" 
                  className="px-8" 
                  isLoading={loading}
                >
                  Save Profile Details
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setFormData({ username: user?.username || '', email: user?.email || '' });
                    setPreviewUrl(user?.profileImage || null);
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
