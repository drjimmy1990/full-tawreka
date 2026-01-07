import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2, Upload, Loader2, GripVertical, Image as ImageIcon, Save } from 'lucide-react';
import { useI18n } from '../../i18n';

interface GalleryImage {
    id: number;
    image_url: string;
    alt_text: string;
    sort_order: number;
    is_active: boolean;
}

const GalleryManager: React.FC = () => {
    const { t, language } = useI18n();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            const data = await api.getAboutGallery();
            setImages(data || []);
        } catch (e) {
            console.error('Error loading gallery:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await api.uploadImage(file);
            if (url) {
                await api.addGalleryImage(url, '', images.length);
                await loadImages();
            }
        } catch (e) {
            console.error('Upload failed:', e);
            alert(language === 'ar' ? 'فشل رفع الصورة' : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(language === 'ar' ? 'حذف هذه الصورة؟' : 'Delete this image?')) return;
        try {
            await api.deleteGalleryImage(id);
            setImages(images.filter(img => img.id !== id));
        } catch (e) {
            console.error('Delete failed:', e);
        }
    };

    const handleToggleActive = async (id: number, isActive: boolean) => {
        try {
            await api.updateGalleryImage(id, { is_active: !isActive });
            setImages(images.map(img => img.id === id ? { ...img, is_active: !isActive } : img));
        } catch (e) {
            console.error('Update failed:', e);
        }
    };

    const handleUpdateAltText = (id: number, altText: string) => {
        setImages(images.map(img => img.id === id ? { ...img, alt_text: altText } : img));
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            for (const img of images) {
                await api.updateGalleryImage(img.id, { alt_text: img.alt_text, sort_order: img.sort_order });
            }
            alert(language === 'ar' ? 'تم الحفظ!' : 'Saved!');
        } catch (e) {
            console.error('Save failed:', e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {language === 'ar' ? 'معرض الصور' : 'Gallery Manager'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {language === 'ar' ? 'صور صفحة من نحن' : 'About page product images'}
                    </p>
                </div>

                <div className="flex gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-colors">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        {language === 'ar' ? 'إضافة صورة' : 'Add Image'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                    </label>

                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {language === 'ar' ? 'حفظ' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Gallery Grid */}
            {images.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                    <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">
                        {language === 'ar' ? 'لا توجد صور - اضغط "إضافة صورة" للبدء' : 'No images yet - click "Add Image" to start'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div
                            key={img.id}
                            className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${!img.is_active ? 'opacity-50' : ''}`}
                        >
                            {/* Image */}
                            <div className="relative aspect-square bg-gray-100">
                                <img
                                    src={img.image_url}
                                    alt={img.alt_text || 'Gallery image'}
                                    className="w-full h-full object-cover"
                                />

                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDelete(img.id)}
                                    className="absolute top-2 ltr:right-2 rtl:left-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                {/* Sort Order Badge */}
                                <div className="absolute top-2 ltr:left-2 rtl:right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    #{index + 1}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="p-3 space-y-2">
                                <input
                                    type="text"
                                    value={img.alt_text || ''}
                                    onChange={(e) => handleUpdateAltText(img.id, e.target.value)}
                                    placeholder={language === 'ar' ? 'وصف الصورة' : 'Image description'}
                                    className="w-full text-sm border rounded px-2 py-1.5"
                                />

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={img.is_active}
                                        onChange={() => handleToggleActive(img.id, img.is_active)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-xs text-gray-600">
                                        {language === 'ar' ? 'مفعل' : 'Active'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GalleryManager;
