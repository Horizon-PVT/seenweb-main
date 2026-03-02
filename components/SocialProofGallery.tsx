import React, { useState, useEffect } from 'react';
import { Play, X, Star, Maximize2 } from 'lucide-react';

export type MediaType = 'image' | 'short' | 'video';

export interface ProofItem {
    id: string;
    type: MediaType;
    url: string; // The image source OR the youtube ID
    title?: string;
}

export const defaultSocialProofItems: ProofItem[] = [
    // The core YouTube Videos/Shorts
    { id: 's1', type: 'short', url: 'YJ201by49R4' },
    { id: 'v1', type: 'video', url: 'Zpkc7Rcprko' },
    { id: 's2', type: 'short', url: 'u_oQKLGuH7c' },
    { id: 'v2', type: 'video', url: 'iUTmjL9Xd1A' },
    { id: 's3', type: 'short', url: 'o6unUmvFrS4' },
    { id: 'v3', type: 'video', url: 'SFlVXrmZ3yo' },
    { id: 'v4', type: 'video', url: 'h4G4CIJbNtI' },
    { id: 'v5', type: 'video', url: 'eA5OtaoI9bU' },
    { id: 'v6', type: 'video', url: 'Xx2EBnF5orc' },
    { id: 'v7', type: 'video', url: 'ZqEbWSCUEUw' },
    { id: 'v8', type: 'video', url: 'SGaTl6EG00o' },
];

interface Props {
    items: ProofItem[];
    title?: string;
    subtitle?: string;
}

export default function SocialProofGallery({
    items,
    title = 'Bằng Chứng Thực Tế',
    subtitle = 'Kết quả nói thay mọi lời quảng cáo. Đây là những kênh thực tế đã áp dụng thành công bộ công cụ và chiến lược của SeenYT.'
}: Props) {
    const [dynamicItems, setDynamicItems] = useState<ProofItem[]>(items);
    // Show 24 items initially instead of 8 to fill out the grid
    const [visibleCount, setVisibleCount] = useState(24);
    const [selectedMedia, setSelectedMedia] = useState<ProofItem | null>(null);

    // Auto-fetch images from the backend directory
    useEffect(() => {
        fetch('/api/testimonials')
            .then(res => res.json())
            .then((imageUrls: string[]) => {
                if (imageUrls && imageUrls.length > 0) {
                    const fetchedImages: ProofItem[] = imageUrls.map((url, idx) => ({
                        id: `auto-img-${idx}`,
                        type: 'image',
                        url: url
                    }));

                    // Interleave fetched images with the provided items (YouTube links)
                    // so they mix together naturally in the masonry grid
                    const interleavedItems: ProofItem[] = [];
                    const maxLength = Math.max(items.length, fetchedImages.length);

                    for (let i = 0; i < maxLength; i++) {
                        if (items[i]) interleavedItems.push(items[i]);
                        if (fetchedImages[i]) interleavedItems.push(fetchedImages[i]);
                    }

                    setDynamicItems(interleavedItems);
                }
            })
            .catch(err => console.error("Could not fetch testimonial images automatically", err));
    }, [items]);

    // Load 12 more items each click instead of 8
    const showMore = () => setVisibleCount(prev => Math.min(prev + 12, dynamicItems.length));

    // Thumbnail Generators
    const getThumbnail = (item: ProofItem) => {
        if (item.type === 'image') return item.url;
        if (item.type === 'short') return `https://i.ytimg.com/vi/${item.url}/hqdefault.jpg`;
        // Standard video thumbnail
        return `https://i.ytimg.com/vi/${item.url}/mqdefault.jpg`;
    };

    return (
        <div className="w-full">
            {/* Gallery Grid (CSS Columns for Masonry effect) */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {dynamicItems.slice(0, visibleCount).map((item, idx) => (
                    <div
                        key={`${item.id}-${idx}`}
                        className="relative group break-inside-avoid overflow-hidden rounded-xl border border-white/10 bg-white/5 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                        onClick={() => setSelectedMedia(item)}
                    >
                        {/* The visible media thumbnail */}
                        <img
                            src={getThumbnail(item)}
                            alt={item.title || "Proof"}
                            loading="lazy"
                            className="w-full h-auto object-cover block"
                        />

                        {/* Overlay based on type */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            {item.type === 'video' && (
                                <div className="w-14 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                                </div>
                            )}
                            {item.type === 'short' && (
                                <div className="w-12 h-16 bg-red-600 rounded-xl flex items-center justify-center shadow-lg flex-col gap-1">
                                    <Play className="w-5 h-5 text-white ml-1" fill="currentColor" />
                                </div>
                            )}
                            {item.type === 'image' && (
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/50 backdrop-blur-md">
                                    <Maximize2 className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {visibleCount < dynamicItems.length && (
                <div className="mt-12 text-center">
                    <button
                        onClick={showMore}
                        className="px-8 py-3 rounded-full border border-gray-600 bg-gray-900/50 text-gray-300 font-semibold hover:bg-white/10 hover:text-white transition-colors inline-flex items-center gap-2 shadow-lg backdrop-blur-sm"
                    >
                        Xem Thêm {dynamicItems.length - visibleCount} Kết Quả Nữa
                    </button>
                </div>
            )}

            {/* Universal Modal */}
            {selectedMedia && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedMedia(null)}
                >
                    <button
                        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-[110]"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div
                        className={`relative w-full shadow-2xl ${selectedMedia.type === 'short' ? 'max-w-md aspect-[9/16]' :
                            selectedMedia.type === 'video' ? 'max-w-5xl aspect-video' :
                                'max-w-5xl' // For images
                            }`}
                        onClick={e => e.stopPropagation()}
                    >
                        {(selectedMedia.type === 'short' || selectedMedia.type === 'video') ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedMedia.url}?autoplay=1&modestbranding=1&rel=0`}
                                className="w-full h-full rounded-2xl border border-white/10 bg-black"
                                allow="autoplay; encrypted-media; fullscreen"
                                allowFullScreen
                            />
                        ) : (
                            <div className="flex justify-center items-center w-full h-full max-h-[90vh]">
                                <img
                                    src={selectedMedia.url}
                                    alt="Enlarged feedback"
                                    className="max-w-full max-h-[90vh] object-contain rounded-xl"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
