// components/dashboard/ContentCalendar.tsx
// Phase 2: Content Calendar - Schedule & track video publishing

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Video, Trash2, Edit2, Check, X } from 'lucide-react';

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    type: 'video' | 'short' | 'livestream' | 'community';
    status: 'planned' | 'scheduled' | 'published';
    notes?: string;
    channelId?: string;
}

export default function ContentCalendar() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '12:00',
        type: 'video' as const,
        notes: ''
    });

    // Load events from API
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/calendar/events');
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.date) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/calendar/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    status: 'planned'
                })
            });

            if (res.ok) {
                await fetchEvents();
                setShowForm(false);
                setFormData({ title: '', date: '', time: '12:00', type: 'video', notes: '' });
            }
        } catch (error) {
            console.error('Failed to create event:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa sự kiện này?')) return;

        try {
            const res = await fetch(`/api/calendar/events?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setEvents(events.filter(e => e.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return '🎬';
            case 'short': return '📱';
            case 'livestream': return '🔴';
            case 'community': return '💬';
            default: return '📅';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    // Group events by month
    const groupedEvents = events.reduce((acc, event) => {
        const month = event.date.substring(0, 7);
        if (!acc[month]) acc[month] = [];
        acc[month].push(event);
        return acc;
    }, {} as Record<string, CalendarEvent[]>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Lịch Đăng Video</h3>
                        <p className="text-sm text-gray-500">Lên lịch & theo dõi nội dung</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-sm font-bold transition-colors"
                >
                    <Plus size={16} />
                    Thêm sự kiện
                </button>
            </div>

            {/* Add Event Form */}
            {showForm && (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tiêu đề video</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="VD: Review sản phẩm X"
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Loại nội dung</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="video">🎬 Video dài</option>
                                    <option value="short">📱 YouTube Short</option>
                                    <option value="livestream">🔴 Livestream</option>
                                    <option value="community">💬 Community Post</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ngày đăng</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Giờ đăng</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ghi chú</label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Ghi chú thêm..."
                                rows={2}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Đang lưu...' : 'Lưu sự kiện'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg font-bold text-sm transition-colors"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Events List */}
            {isLoading && events.length === 0 ? (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải lịch...</p>
                </div>
            ) : events.length === 0 ? (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Chưa có sự kiện nào</p>
                    <p className="text-gray-600 text-sm">Nhấn "Thêm sự kiện" để lên lịch video đầu tiên</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedEvents)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([month, monthEvents]) => (
                            <div key={month}>
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">
                                    {new Date(month + '-01').toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                                </h4>
                                <div className="space-y-3">
                                    {monthEvents
                                        .sort((a, b) => a.date.localeCompare(b.date))
                                        .map(event => (
                                            <div
                                                key={event.id}
                                                className="bg-[#111] border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-white/20 transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-2xl">
                                                    {getTypeIcon(event.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h5 className="font-bold text-white">{event.title}</h5>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(event.status)}`}>
                                                            {event.status === 'planned' ? '📋 Lên kế hoạch' : 
                                                             event.status === 'scheduled' ? '📅 Đã lên lịch' : '✅ Đã đăng'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {formatDate(event.date)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {event.time}
                                                        </span>
                                                    </div>
                                                    {event.notes && (
                                                        <p className="text-xs text-gray-600 mt-1">{event.notes}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDelete(event.id)}
                                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Stats */}
            {events.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#111] border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-indigo-400">{events.filter(e => e.status === 'planned').length}</div>
                        <div className="text-xs text-gray-500 uppercase">Lên kế hoạch</div>
                    </div>
                    <div className="bg-[#111] border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-blue-400">{events.filter(e => e.status === 'scheduled').length}</div>
                        <div className="text-xs text-gray-500 uppercase">Đã lên lịch</div>
                    </div>
                    <div className="bg-[#111] border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-green-400">{events.filter(e => e.status === 'published').length}</div>
                        <div className="text-xs text-gray-500 uppercase">Đã đăng</div>
                    </div>
                </div>
            )}
        </div>
    );
}
