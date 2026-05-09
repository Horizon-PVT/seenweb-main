import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Zap, ShieldCheck, Crown, Video, BookOpen, Send, X, ChevronDown, Users, MessageSquare, Layers, Sparkles, Building2 } from "lucide-react";
import CheckoutModal from './dashboard/CheckoutModal';

// ============== PRICING DATA ==============
const PLANS = {
  starter: {
    id: 'STARTER',
    name: 'Starter',
    tagline: 'Dành cho người mới bắt đầu',
    monthly: 199000,
    sixMonths: 149000,
    yearly: 99000,
    color: 'blue',
    bgGradient: 'from-blue-600/20 to-blue-900/10',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500/60',
    badge: null,
    features: [
      { icon: '🔍', name: 'Niche Radar', desc: 'Tìm ngách tiềm năng' },
      { icon: '✍️', name: 'Script Studio', desc: 'Viết kịch bản viral' },
      { icon: '🎬', name: 'Video Pipeline', desc: 'Tạo video cơ bản' },
      { icon: '📊', name: 'Channel Analytics', desc: 'Theo dõi thống kê' },
    ],
    tools: ['Niche Radar', 'Script Studio', 'Video Pipeline', 'SEO Tool', 'Thumbnail AI'],
    aiCoach: 5,
    channels: 1,
    support: 'Email',
  },
  creator: {
    id: 'CREATOR',
    name: 'Creator',
    tagline: 'Phổ biến nhất - Tối ưu nhất',
    monthly: 399000,
    sixMonths: 299000,
    yearly: 249000,
    color: 'purple',
    bgGradient: 'from-purple-600/20 to-purple-900/10',
    borderColor: 'border-purple-500/40',
    hoverBorder: 'hover:border-purple-500/70',
    badge: 'MOST POPULAR',
    features: [
      { icon: '🔍', name: 'Niche Radar', desc: 'Tìm ngách tiềm năng' },
      { icon: '✍️', name: 'Script Studio', desc: 'Viết kịch bản viral' },
      { icon: '🎬', name: 'Video Pipeline', desc: 'Tạo video nâng cao' },
      { icon: '📊', name: 'Channel Analytics', desc: 'Theo dõi thống kê' },
      { icon: '🖥️', name: 'Koda Studio', desc: 'Desktop App (Veo3)' },
      { icon: '🧠', name: 'Intelligence Hub', desc: 'Phân tích xu hướng' },
      { icon: '🌐', name: 'Multilingual Studio', desc: 'Đa ngôn ngữ' },
    ],
    tools: ['Tất cả Starter', 'Koda Studio', 'Intelligence Hub', 'Multilingual Studio', 'Rival Scanner', 'Auto Upload'],
    aiCoach: 20,
    channels: 2,
    support: 'Priority Email',
  },
  factory: {
    id: 'FACTORY',
    name: 'Factory',
    tagline: 'Cho content creator chuyên nghiệp',
    monthly: 699000,
    sixMonths: 549000,
    yearly: 399000,
    color: 'amber',
    bgGradient: 'from-amber-600/20 to-amber-900/10',
    borderColor: 'border-amber-500/40',
    hoverBorder: 'hover:border-amber-500/70',
    badge: null,
    features: [
      { icon: '🔍', name: 'Niche Radar', desc: 'Tìm ngách tiềm năng' },
      { icon: '✍️', name: 'Script Studio', desc: 'Viết kịch bản viral' },
      { icon: '🎬', name: 'Video Pipeline', desc: 'Tạo video không giới hạn' },
      { icon: '📊', name: 'Channel Analytics', desc: 'Theo dõi thống kê' },
      { icon: '🖥️', name: 'Koda Studio', desc: 'Desktop App (Veo3)' },
      { icon: '🧠', name: 'Intelligence Hub', desc: 'Phân tích xu hướng' },
      { icon: '🌐', name: 'Multilingual Studio', desc: 'Đa ngôn ngữ' },
      { icon: '📚', name: 'Koda Novel', desc: 'Chuyển truyện thành phim' },
      { icon: '🏭', name: 'Koda Factory', desc: 'Multi-workers desktop' },
    ],
    tools: ['Tất cả Creator', 'Koda Novel', 'Koda Factory', 'Bulk Processing'],
    aiCoach: 50,
    channels: 2,
    support: 'Live Chat',
  },
  agency: {
    id: 'AGENCY',
    name: 'Agency',
    tagline: 'Cho team và agency',
    monthly: 1990000,
    sixMonths: 1590000,
    yearly: 1290000,
    color: 'cyan',
    bgGradient: 'from-cyan-600/20 to-cyan-900/10',
    borderColor: 'border-cyan-500/40',
    hoverBorder: 'hover:border-cyan-500/70',
    badge: null,
    features: [
      { icon: '🔍', name: 'Niche Radar', desc: 'Tìm ngách tiềm năng' },
      { icon: '✍️', name: 'Script Studio', desc: 'Viết kịch bản viral' },
      { icon: '🎬', name: 'Video Pipeline', desc: 'Tạo video không giới hạn' },
      { icon: '📊', name: 'Channel Analytics', desc: 'Theo dõi thống kê' },
      { icon: '🖥️', name: 'Koda Studio', desc: 'Desktop App (Veo3)' },
      { icon: '🧠', name: 'Intelligence Hub', desc: 'Phân tích xu hướng' },
      { icon: '🌐', name: 'Multilingual Studio', desc: 'Đa ngôn ngữ' },
      { icon: '📚', name: 'Koda Novel', desc: 'Chuyển truyện thành phim' },
      { icon: '🏭', name: 'Koda Factory', desc: 'Multi-workers desktop' },
      { icon: '👥', name: 'Team Seats', desc: '5 người dùng' },
      { icon: '📺', name: 'Kênh YouTube', desc: '5 kênh' },
    ],
    tools: ['Tất cả Factory', 'Multi-user (5 seats)', 'Team Dashboard', 'Bulk License'],
    aiCoach: 100,
    channels: 5,
    support: 'Priority 24/7',
  },
  enterprise: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    tagline: 'Giải pháp doanh nghiệp toàn diện',
    monthly: 4990000,
    sixMonths: 3990000,
    yearly: 2990000,
    color: 'rose',
    bgGradient: 'from-rose-600/20 to-rose-900/10',
    borderColor: 'border-rose-500/40',
    hoverBorder: 'hover:border-rose-500/70',
    badge: null,
    features: [
      { icon: '🔍', name: 'Niche Radar', desc: 'Tìm ngách tiềm năng' },
      { icon: '✍️', name: 'Script Studio', desc: 'Viết kịch bản viral' },
      { icon: '🎬', name: 'Video Pipeline', desc: 'Tạo video không giới hạn' },
      { icon: '📊', name: 'Channel Analytics', desc: 'Theo dõi thống kê' },
      { icon: '🖥️', name: 'Koda Studio', desc: 'Desktop App (Veo3)' },
      { icon: '🧠', name: 'Intelligence Hub', desc: 'Phân tích xu hướng' },
      { icon: '🌐', name: 'Multilingual Studio', desc: 'Đa ngôn ngữ' },
      { icon: '📚', name: 'Koda Novel', desc: 'Chuyển truyện thành phim' },
      { icon: '🏭', name: 'Koda Factory', desc: 'Multi-workers desktop' },
      { icon: '👥', name: 'Team Seats', desc: '15 người dùng' },
      { icon: '📺', name: 'Kênh YouTube', desc: '10 kênh' },
      { icon: '🎨', name: 'White-label', desc: 'Domain riêng' },
      { icon: '🛠️', name: 'Custom Workflow', desc: 'Quy trình tùy chỉnh' },
    ],
    tools: ['Tất cả Agency', 'White-label', 'API Access', 'Dedicated Manager'],
    aiCoach: 500,
    channels: 10,
    support: 'Dedicated Manager',
  },
};

const ADDONS = [
  {
    id: 'CHANNEL_SLOT',
    name: '+1 Kênh YouTube',
    desc: 'Thêm 1 slot kênh YouTube',
    price: 169000,
    icon: '📺',
  },
  {
    id: 'AI_COACH_50',
    name: '+50 AI Coach Lượt',
    desc: 'Thêm 50 lượt chat AI Coach',
    price: 29000,
    icon: '💬',
  },
  {
    id: 'AI_COACH_100',
    name: '+100 AI Coach Lượt',
    desc: 'Thêm 100 lượt chat AI Coach',
    price: 49000,
    icon: '💬',
  },
  {
    id: 'MASTERCLASS',
    name: 'Creator Masterclass',
    desc: 'Khóa học online trọn đời',
    price: 849000,
    icon: '🎓',
    badge: 'TRỌN ĐỜI',
  },
  {
    id: 'USER_SEAT',
    name: '+1 Team Seat',
    desc: 'Thêm 1 người dùng team',
    price: 99000,
    icon: '👤',
  },
];

// ============== HELPER FUNCTIONS ==============
const formatPrice = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const getPrice = (plan: any, billing: 'monthly' | 'sixMonths' | 'yearly') => {
  return plan[billing];
};

const getSaving = (plan: any) => {
  const monthlyTotal = plan.monthly * 12;
  const yearlyTotal = plan.yearly * 12;
  const saving = monthlyTotal - yearlyTotal;
  return formatPrice(saving);
};

const getColorClasses = (color: string) => {
  const colors: Record<string, any> = {
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      button: 'bg-blue-600 hover:bg-blue-500',
      check: 'text-blue-400',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/40',
      button: 'bg-purple-600 hover:bg-purple-500',
      check: 'text-purple-400',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
      button: 'bg-amber-600 hover:bg-amber-500',
      check: 'text-amber-400',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/40',
      button: 'bg-cyan-600 hover:bg-cyan-500',
      check: 'text-cyan-400',
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      button: 'bg-rose-600 hover:bg-rose-500',
      check: 'text-rose-400',
    },
  };
  return colors[color] || colors.blue;
};

export default function PricingTable() {
  const [billing, setBilling] = useState<'monthly' | 'sixMonths' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const billingOptions = [
    { id: 'monthly', label: 'Hàng tháng' },
    { id: 'sixMonths', label: '6 tháng', badge: 'Tiết kiệm 20%' },
    { id: 'yearly', label: '1 năm', badge: 'Tiết kiệm 40%' },
  ];

  const planOrder = ['starter', 'creator', 'factory'];

  return (
    <div className="w-full">
      {/* ============== BILLING TOGGLE ============== */}
      <div className="flex justify-center mb-12">
        <div className="bg-gray-900/80 backdrop-blur-md p-1.5 rounded-full border border-gray-700 flex items-center shadow-2xl">
          {billingOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setBilling(option.id as any)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                billing === option.id
                  ? 'bg-gradient-to-r from-[#CDAD5A] to-amber-600 text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {option.label}
              {option.badge && billing !== option.id && (
                <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                  {option.badge}
                </span>
              )}
              {billing === option.id && option.badge && (
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full">
                  {option.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ============== PRICING CARDS ============== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
        {planOrder.map((planKey) => {
          const plan = PLANS[planKey as keyof typeof PLANS];
          const colors = getColorClasses(plan.color);
          const currentPrice = getPrice(plan, billing);
          const isExpanded = expandedPlan === plan.id;
          const isYearly = billing === 'yearly';
          const isSixMonths = billing === 'sixMonths';

          return (
            <div
              key={plan.id}
              className={`relative bg-gradient-to-b ${plan.bgGradient} backdrop-blur-sm border ${plan.borderColor} ${plan.hoverBorder} rounded-2xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                plan.badge ? 'lg:-translate-y-4' : ''
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap animate-pulse">
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div className="mb-4">
                <h3 className={`text-xl font-bold ${colors.text} uppercase tracking-wider mb-1`}>
                  {plan.name}
                </h3>
                <p className="text-gray-400 text-xs">{plan.tagline}</p>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{formatPrice(currentPrice)}</span>
                  <span className="text-gray-500 text-sm">/tháng</span>
                </div>
                {billing !== 'monthly' && (
                  <div className="text-xs text-gray-500 mt-1">
                    {(currentPrice * (billing === 'yearly' ? 12 : 6)).toLocaleString('vi-VN')}đ {billing === 'yearly' ? '/năm' : '/6 tháng'}
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full py-2.5 px-4 ${colors.button} text-white text-center font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 mb-4 shadow-lg`}
              >
                <Zap size={14} /> Chọn {plan.name}
              </button>

              {/* Quick Features */}
              <div className="space-y-2 mb-4">
                {plan.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span>{feature.icon}</span>
                    <span className="text-gray-300">{feature.name}</span>
                  </div>
                ))}
                {plan.features.length > 4 && (
                  <button
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                    className="flex items-center gap-1 text-xs text-[#CDAD5A] hover:text-amber-400 transition-colors"
                  >
                    <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    {plan.features.length - 4} tính năng khác
                  </button>
                )}
              </div>

              {/* Expanded Features */}
              {isExpanded && (
                <div className="border-t border-gray-700/50 pt-4 space-y-2">
                  {plan.features.slice(4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span>{feature.icon}</span>
                      <div>
                        <span className="text-gray-300">{feature.name}</span>
                        <span className="text-gray-500 ml-1">- {feature.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats Row */}
              <div className="mt-auto pt-4 border-t border-gray-700/50 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">AI Coach</span>
                  <div className={`font-bold ${colors.text}`}>{plan.aiCoach}/ngày</div>
                </div>
                <div>
                  <span className="text-gray-500">Kênh</span>
                  <div className={`font-bold ${colors.text}`}>{plan.channels} kênh</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============== FULL COMPARISON TABLE ============== */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 mb-12">
        <h3 className="text-2xl font-bold text-white text-center mb-8">
          So Sánh Chi Tiết Tất Cả Gói
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Tính năng</th>
                {planOrder.map((planKey) => {
                  const plan = PLANS[planKey as keyof typeof PLANS];
                  const colors = getColorClasses(plan.color);
                  return (
                    <th key={plan.id} className={`text-center py-4 px-4 ${plan.badge ? 'relative' : ''}`}>
                      <span className={`font-bold ${colors.text} text-base`}>{plan.name}</span>
                      {plan.badge && (
                        <span className="block text-[10px] text-red-400 mt-1">{plan.badge}</span>
                      )}
                    </th>
                  );
                })}
              </tr>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-500 text-xs">Giá hàng tháng</th>
                {planOrder.map((planKey) => {
                  const plan = PLANS[planKey as keyof typeof PLANS];
                  return (
                    <th key={plan.id} className="text-center py-3 px-4 font-bold text-white">
                      {formatPrice(plan.monthly)}đ
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Core Tools */}
              <tr className="bg-gray-800/50">
                <td colSpan={4} className="py-3 px-4 font-bold text-gray-300 text-xs uppercase tracking-wider">
                  Công Cụ AI
                </td>
              </tr>
              {[
                { name: 'Niche Radar', desc: 'Tìm ngách tiềm năng' },
                { name: 'Script Studio', desc: 'Viết kịch bản viral' },
                { name: 'Video Pipeline', desc: 'Tạo video tự động' },
                { name: 'SEO Tool', desc: 'Tối ưu YouTube SEO' },
                { name: 'Thumbnail AI', desc: 'Tạo ảnh bìa' },
                { name: 'Rival Scanner', desc: 'Phân tích đối thủ' },
                { name: 'Intelligence Hub', desc: 'Phân tích xu hướng' },
                { name: 'Multilingual Studio', desc: 'Đa ngôn ngữ' },
              ].map((feature, idx) => (
                <tr key={idx} className="border-b border-gray-800/50">
                  <td className="py-3 px-4">
                    <span className="text-gray-300">{feature.name}</span>
                    <span className="text-gray-500 text-xs block">{feature.desc}</span>
                  </td>
                  {planOrder.map((planKey) => {
                    const plan = PLANS[planKey as keyof typeof PLANS];
                    const hasFeature = plan.features.some(f => f.name === feature.name);
                    return (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {hasFeature ? (
                          <CheckCircle2 size={20} className="mx-auto text-green-500" />
                        ) : (
                          <X size={20} className="mx-auto text-gray-600" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Desktop Apps */}
              <tr className="bg-gray-800/50">
                <td colSpan={4} className="py-3 px-4 font-bold text-gray-300 text-xs uppercase tracking-wider">
                  Desktop Applications (License Key)
                </td>
              </tr>
              {[
                { name: 'Koda Studio', desc: 'Tạo video Veo3 Desktop', icon: '🖥️' },
                { name: 'Koda Novel', desc: 'Chuyển truyện thành phim', icon: '📚' },
                { name: 'Koda Factory', desc: 'Multi-workers xử lý hàng loạt', icon: '🏭' },
              ].map((feature, idx) => (
                <tr key={idx} className="border-b border-gray-800/50">
                  <td className="py-3 px-4">
                    <span className="text-gray-300">{feature.icon} {feature.name}</span>
                    <span className="text-gray-500 text-xs block">{feature.desc}</span>
                  </td>
                  {planOrder.map((planKey) => {
                    const plan = PLANS[planKey as keyof typeof PLANS];
                    const hasFeature = plan.features.some(f => f.name === feature.name);
                    return (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {hasFeature ? (
                          <CheckCircle2 size={20} className="mx-auto text-green-500" />
                        ) : (
                          <X size={20} className="mx-auto text-gray-600" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Limits */}
              <tr className="bg-gray-800/50">
                <td colSpan={4} className="py-3 px-4 font-bold text-gray-300 text-xs uppercase tracking-wider">
                  Giới Hạn Sử Dụng
                </td>
              </tr>
              {[
                { name: 'AI Coach Messages', values: [5, 20, 50, 100, 500] },
                { name: 'Kênh YouTube', values: [1, 2, 2, 5, 10] },
                { name: 'Team Seats', values: ['-', '-', '-', '5', '15'] },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-gray-300">{row.name}</td>
                  {row.values.map((val, i) => (
                    <td key={i} className="text-center py-3 px-4 text-white font-medium">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Support */}
              <tr className="bg-gray-800/50">
                <td colSpan={4} className="py-3 px-4 font-bold text-gray-300 text-xs uppercase tracking-wider">
                  Hỗ Trợ
                </td>
              </tr>
              {[
                { name: 'Email Support', values: ['✓', '✓', '✓', '✓', '✓'] },
                { name: 'Priority Support', values: ['-', '✓', '✓', '✓', '✓'] },
                { name: 'Live Chat 24/7', values: ['-', '-', '✓', '✓', '✓'] },
                { name: 'Dedicated Manager', values: ['-', '-', '-', '-', '✓'] },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-gray-300">{row.name}</td>
                  {row.values.map((val, i) => (
                    <td key={i} className="text-center py-3 px-4">
                      {val === '✓' ? (
                        <CheckCircle2 size={18} className="mx-auto text-green-500" />
                      ) : val === '-' ? (
                        <span className="text-gray-600">-</span>
                      ) : (
                        <span className="text-amber-400 font-medium">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Enterprise Features */}
              <tr className="bg-gray-800/50">
                <td colSpan={4} className="py-3 px-4 font-bold text-gray-300 text-xs uppercase tracking-wider">
                  Tính Năng Doanh Nghiệp
                </td>
              </tr>
              {[
                { name: 'White-label Domain', values: ['-', '-', '-', '-', '✓'] },
                { name: 'API Access', values: ['-', '-', '-', '-', '✓'] },
                { name: 'Custom Workflow', values: ['-', '-', '-', '-', '✓'] },
                { name: 'Bulk License Management', values: ['-', '-', '-', '✓', '✓'] },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-gray-300">{row.name}</td>
                  {row.values.map((val, i) => (
                    <td key={i} className="text-center py-3 px-4">
                      {val === '✓' ? (
                        <CheckCircle2 size={18} className="mx-auto text-green-500" />
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============== ADD-ONS SECTION ============== */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white text-center mb-8">
          Add-ons & Mua Riêng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {ADDONS.map((addon) => (
            <div
              key={addon.id}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-[#CDAD5A]/50 transition-all"
            >
              <div className="text-3xl mb-3">{addon.icon}</div>
              <h4 className="text-white font-bold mb-1">{addon.name}</h4>
              <p className="text-gray-400 text-xs mb-3">{addon.desc}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-[#CDAD5A]">{formatPrice(addon.price)}</span>
                {addon.id.includes('MONTH') && <span className="text-gray-500 text-xs">/tháng</span>}
              </div>
              {addon.badge && (
                <span className="inline-block mt-2 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  {addon.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ============== FAQ ============== */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-white text-center mb-8">
          Câu Hỏi Thường Gặp
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              q: 'Làm sao nhận được License Key cho Koda Studio/Novel/Factory?',
              a: 'Sau khi thanh toán thành công qua PayOS, License Key sẽ được tự động gửi qua email trong vòng 5 phút.',
            },
            {
              q: 'Tôi có thể nâng cấp gói dịch vụ không?',
              a: 'Có, bạn có thể nâng cấp lên gói cao hơn bất kỳ lúc nào. Phần chênh lệch sẽ được tính theo tỷ lệ.',
            },
            {
              q: ' Gói 6 tháng và 1 năm có khác gì không?',
              a: 'Cả hai đều có cùng tính năng. Gói 1 năm tiết kiệm được nhiều hơn (lên đến 50%).',
            },
            {
              q: 'Tôi có được hoàn tiền nếu không hài lòng?',
              a: 'Chúng tôi có chính sách hoàn tiền trong 7 ngày đầu tiên nếu bạn không hài lòng với dịch vụ.',
            },
            {
              q: 'AI Coach là gì?',
              a: 'AI Coach là trợ lý AI của SeenYT, giúp bạn tư vấn chiến lược YouTube, viết kịch bản, và trả lời mọi câu hỏi về nội dung.',
            },
            {
              q: 'Tôi cần thanh toán bằng cách nào?',
              a: 'Chúng tôi hỗ trợ thanh toán qua PayOS với QR Code, thẻ ATM, và thẻ tín dụng quốc tế.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="bg-gray-800/50 rounded-xl p-5">
              <h4 className="text-white font-bold mb-2 flex items-start gap-2">
                <span className="text-[#CDAD5A]">Q:</span> {faq.q}
              </h4>
              <p className="text-gray-400 text-sm pl-5">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ============== CHECKOUT MODAL ============== */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={true}
          onClose={() => setSelectedPlan(null)}
          requiredPlan={selectedPlan}
          forceYearly={billing === 'yearly'}
          forceSixMonths={billing === 'sixMonths'}
        />
      )}
    </div>
  );
}