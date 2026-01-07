
import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminAuth } from '@/lib/admin/auth';
import Head from 'next/head';

// Simple types
interface Stats {
    kpi: {
        sessions: number;
        signups: number;
        logins: number;
        toolStarts: number;
        conversionRate: string;
    };
    breakdown: Array<{
        campaign: string;
        signups: number;
    }>;
}

export default function AdminAttribution({ session }: any) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [source, setSource] = useState('google');
    const [campaignFilter, setCampaignFilter] = useState('');


    const fetchStats = async () => {
        setLoading(true);
        try {
            const params: any = {
                from: dateRange.from,
                to: dateRange.to,
                source: source
            };
            if (campaignFilter) params.campaign = campaignFilter;

            const q = new URLSearchParams(params).toString();
            const url = `/api/admin/attribution/summary?${q}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [dateRange, source, campaignFilter]);

    return (
        <AdminLayout session={session}>
            <Head><title>Attribution Tracking | Admin</title></Head>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white">Attribution Tracking</h2>

                    {/* Controls */}
                    <div className="flex gap-2">
                        <select
                            value={source}
                            onChange={e => setSource(e.target.value)}
                            className="bg-gray-800 text-white rounded p-2 border border-gray-700"
                        >
                            <option value="">All Sources</option>
                            <option value="google">Google</option>
                            <option value="facebook">Facebook</option>
                            <option value="tiktok">Tiktok</option>
                        </select>
                        <input
                            type="text"
                            value={campaignFilter}
                            onChange={e => setCampaignFilter(e.target.value)}
                            placeholder="Search Campaign..."
                            className="bg-gray-800 text-white rounded p-2 border border-gray-700 w-48"
                        />
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
                            className="bg-gray-800 text-white rounded p-2 border border-gray-700"
                        />
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
                            className="bg-gray-800 text-white rounded p-2 border border-gray-700"
                        />
                    </div>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card title="Traffic (Sessions)" value={stats?.kpi.sessions} loading={loading} />
                    <Card title="Signups" value={stats?.kpi.signups} loading={loading} />
                    <Card title="Logins" value={stats?.kpi.logins} loading={loading} />
                    <Card title="Tool Starts" value={stats?.kpi.toolStarts} loading={loading} />
                    <Card title="CR (Tools/Traffic)" value={loading ? '-' : (stats?.kpi.conversionRate + '%')} loading={loading} />
                </div>

                {/* Table */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">Campaign Performance (Top 10)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="p-3">Campaign</th>
                                    <th className="p-3">Signups</th>
                                    {/* Future: Add more columns */}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr>
                                ) : stats?.breakdown?.length === 0 ? (
                                    <tr><td colSpan={3} className="p-4 text-center">No data found</td></tr>
                                ) : (
                                    stats?.breakdown.map((row, i) => (
                                        <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
                                            <td className="p-3 font-medium text-white">{row.campaign}</td>
                                            <td className="p-3">{row.signups}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Builder Tool */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-6">
                    <h3 className="text-xl font-bold text-white mb-4">UTM Builder Helper</h3>
                    <UtmBuilder />
                </div>

            </div>
        </AdminLayout>
    );
}

const Card = ({ title, value, loading }: any) => (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <h4 className="text-gray-400 text-xs uppercase mb-1">{title}</h4>
        <div className="text-2xl font-bold text-white">
            {loading ? '...' : value ?? 0}
        </div>
    </div>
);

const UtmBuilder = () => {
    const [baseUrl, setBaseUrl] = useState('https://seenyt.net/new-youtuber');
    const [source, setSource] = useState('google');
    const [campaign, setCampaign] = useState('');

    const result = `${baseUrl}?utm_source=${source}&utm_medium=cpc&utm_campaign=${encodeURIComponent(campaign)}&utm_term={keyword}&utm_content={creative}`;

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <input className="bg-gray-900 border border-gray-600 rounded p-2 text-white flex-1" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
                <input className="bg-gray-900 border border-gray-600 rounded p-2 text-white w-32" value={source} onChange={e => setSource(e.target.value)} placeholder="source" />
                <input className="bg-gray-900 border border-gray-600 rounded p-2 text-white w-48" value={campaign} onChange={e => setCampaign(e.target.value)} placeholder="Campaign Name" />
            </div>
            <div className="bg-black p-4 rounded font-mono text-sm text-green-400 break-all">
                {result}
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => requireAdminAuth(context);
