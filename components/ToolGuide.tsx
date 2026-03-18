import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, X, Lightbulb, PlayCircle, ShieldAlert } from 'lucide-react';

interface ToolGuideProps {
  toolId: string;
}

const getToolInstructions = (toolId: string) => {
  const instructions: Record<string, { title: string; steps: string[]; tips: string[] }> = {
    'thay-youtube': {
      title: 'Lộ trình 30 Ngày Masterclass',
      steps: [
        'Nhìn vào "Lộ trình 30 Ngày Master" ở cột bên trái để theo dõi tiến độ học tập.',
        'Bấm vào Ngày (Day) đang mở khóa để xem nội dung bài giảng chi tiết ở màn hình giữa.',
        'Sau khi học xong, bấm "Đã Hoàn Thành" (hoặc "Bỏ qua") để hệ thống mở khóa ngày tiếp theo.',
        'Theo dõi vòng tròn tiến độ góc trên bên trái để biết bạn đã đi được bao xa.'
      ],
      tips: ['Bạn không thể nhảy cóc bài học. Hãy hoàn thành từng ngày một để hệ thống mở khóa bài tiếp theo.']
    },
    'micro-niche-miner': {
      title: 'Digital Gold Mine - Khai thác ngách',
      steps: [
        'Chọn thị trường mục tiêu góc trên cùng (VN hoặc Quốc tế/US).',
        'Nhập từ khóa chủ đề lớn (VD: Tài chính, AI, Storytelling) vào thanh tìm kiếm.',
        'Nhấn "KHAI THÁC" và chờ hệ thống Sonar quét qua các tầng sâu dữ liệu.',
        'Đọc các thông số (Volume, Cạnh tranh, CPM) để đưa ra quyết định chọn ngách.'
      ],
      tips: ['Điểm Override >= 8.0 là "vàng ròng", hãy ưu tiên làm video về ngách đó.']
    },
    'hidden-channel-finder': {
      title: 'Thám hiểm Đại dương Sâu - Tìm Kênh Ẩn',
      steps: [
        'Nhập từ khóa hoặc thể loại kênh bạn muốn phân tích.',
        'Hệ thống sẽ quét các kênh "Underdog" (đang lên nhanh chóng nhưng ít người biết).',
        'Đồng thời phát hiện các video đang Viral và cấu trúc Viral của chúng.',
        'Phân tích bí quyết cốt lõi của họ để áp dụng vào kênh của bạn.'
      ],
      tips: ['Hãy chú ý đến phần "Cấu trúc Viral" để thiết kế video tiếp theo của bạn.']
    },
    'niche-engine': {
      title: 'Niche Engine - Động cơ ý tưởng',
      steps: [
        'Chạm vào một Ngách (Niche) mục tiêu từ Thư viện (Lưu ý: Một số ngách yêu cầu bản PRO).',
        'Bấm "PHÂN TÍCH NGÁCH" ở cột bên trái và chờ AI quét dữ liệu.',
        'Khi có kết quả phân tích, tiếp tục bấm "SINH KỊCH BẢN" để AI viết kịch bản chi tiết.',
        'Đọc kịch bản ở màn hình bên phải, bạn đã có trọn bộ tài liệu cho video tiếp theo.'
      ],
      tips: ['Có thể chuyển kịch bản này trực tiếp sang công cụ AI Voice Studio để lồng tiếng.']
    },
    'narrative-studio': {
      title: 'Story Studio - Xưởng Truyện KDP',
      steps: [
        'Cấu hình cơ bản (Setup): Nhập thông tin sách, Tác giả, Kích thước, số trang, và Cốt truyện (Core Idea).',
        'Bấm "Initialize Manuscript" để AI phân tích và thiết lập cấu trúc sách.',
        'Chờ hệ thống tự động sinh hình ảnh (Illustrating) cho từng phân cảnh.',
        'Tải file PDF bản thảo hoặc thiết kế ảnh Bìa ở mục "KDP Checklist".'
      ],
      tips: ['Bạn có thể chỉnh sửa thủ công text từng trang ở mục Preview và bấm Regenerate Art nếu ảnh chưa ưng ý.']
    },
    'image-forge': {
      title: 'Lò rèn Ảnh & Thumbnail',
      steps: [
        'Nhập ý tưởng hình ảnh vào thanh công cụ bên dưới (hoặc bấm nút "✨ Magic" để AI viết prompt tối ưu).',
        'Điều chỉnh Tỷ lệ khung hình (16:9, 1:1, 9:16) và Số lượng ảnh.',
        '(Tùy chọn) Tải lên ảnh gốc ở phần Style hoặc Character Reference bên phải để AI vẽ theo khuôn mẫu.',
        'Bấm "GENERATE IMAGE" và chờ siêu máy tính kết xuất hình ảnh.'
      ],
      tips: ['Để ảnh sinh ra luôn giữ đúng một khuôn mặt nhân vật, hãy bật tính năng "Auto Face Lock" ở cột bên phải.']
    },
    'text-to-speech': {
      title: 'AI Voice Studio - Thu âm',
      steps: [
        'Chuyển đổi giữa 2 Tab: "Nhập Văn Bản" hoặc "Tải File" (File .txt, .srt) ở cột giữa.',
        'Bấm vào Dropdown Giọng Đọc ở cột bên phải để chọn các giọng AI chuẩn phòng thu.',
        '(Tùy chọn) Bật chế độ "Dialogue" để làm video hội thoại 2 người, hoặc bấm "Clone New Voice" để sao chép giọng nói.',
        'Bấm "GENERATE" và tải xuống file Audio (.wav) khi hoàn tất.'
      ],
      tips: ['Ở chế độ hội thoại (Dialogue), AI sẽ tự động chia câu luân phiên giữa 2 giọng đọc được chọn.']
    },
    'scriptwriter': {
      title: 'Scriptwriter - Viết kịch bản',
      steps: [
        'Nhập ý tưởng cốt lõi (Core Concept) vào cột công cụ bên trái.',
        'Thiết lập Mục tiêu, Giọng điệu (Tone), Thể loại (Style) và Định dạng kịch bản mong muốn.',
        'Bấm "GENERATE SCRIPT" và chờ AI viết một kịch bản hoàn chỉnh ở màn hình bên phải.',
        'Dùng thanh Chat AI bên dưới để yêu cầu làm ngắn lại, đổi giọng văn, hoặc tự động dịch sang ngôn ngữ khác.'
      ],
      tips: ['Bấm nút "Save Project" góc trên để lưu kịch bản vào thư viện cá nhân của bạn để dùng sau.']
    },
    'rival-scanner': {
      title: 'Rival Scanner - Quét đối thủ',
      steps: [
        'Nhập link kênh YouTube hoặc tên đối thủ.',
        'Hệ thống sẽ phân tích các chỉ số ẩn như tần suất đăng bài, khung giờ vàng, hashtag.',
        'Học lỏm tư duy làm content hoặc tìm lỗ hổng của họ để vượt lên.'
      ],
      tips: ['Không copy y hệt, hãy dùng "Chiến lược làm tốt hơn 10%" để thắng họ.']
    },
    'seo-tool': {
      title: 'SEO Master - Leo Top YouTube',
      steps: [
        'Dán kịch bản thô hoặc ý tưởng video vào ô INPUT_DATA_STREAM.',
        'Nhấn "RUN_ANALYSIS" để siêu máy tính giả lập thuật toán tìm kiếm.',
        'Đọc 3 Tab Kết quả: STRATEGY (Phân tích sức hút), CONTENT (Tiêu đề, Mô tả, Tags) và CHECKLIST (Chấm điểm SEO).',
        'Nhấn nút COPY nhỏ ở góc mỗi nội dung để dán thẳng lên YouTube.'
      ],
      tips: ['Bạn nên tự quay lại tối ưu những chỉ báo màu Vàng/Đỏ trong tab CHECKLIST để video dễ được đề xuất hơn.']
    },
    'keyword-research': {
      title: 'Keyword Research - Nghiên cứu Từ khoá',
      steps: [
        'Nhập một từ khóa cốt lõi (ví dụ: "cách làm youtube") vào thanh tìm kiếm và bấm "ANALYZE".',
        'Chờ quá trình Deep Analysis giả lập hoàn tất.',
        'Đọc chỉ số Tổng quan (Potential), Khối lượng tìm kiếm (Volume) và Cạnh tranh (Competition) ở các thẻ bên trên.',
        'Kéo xuống bảng để xem các từ khóa ngách liên quan và điểm số tương ứng.'
      ],
      tips: ['Hãy ưu tiên chọn các từ khóa có Trend mũi tên xanh đi lên và Competition ở mức Low/Very Low.']
    },
    'veocity': {
      title: 'Veocity - Giao thức Hình ảnh',
      steps: [
        'Dán toàn bộ kịch bản chi tiết vào màn hình Teleprompter ở bước SETUP.',
        'Chọn Tỷ lệ khung hình và Phong cách hình ảnh (VD: Cinematic, 3D Render). Bấm "ANALYZE SCRIPT".',
        'Ở bước RUNDOWN, AI sẽ tách kịch bản thành từng cảnh (Scene) và tự động viết Prompt tiếng Anh tương ứng.',
        'Bấm "EXPORT PROMPTS" để tải file txt. Định dạng này được tối ưu riêng cho Extension Auto Flow của Veo3.'
      ],
      tips: ['Bạn có thể thao tác chọn lại "Emotion" (Cảm xúc) cho từng phân cảnh ở bước RUNDOWN nếu muốn thay đổi nhịp độ.']
    },
    'script-refiner': {
      title: 'Script Refiner - Chuốt Kịch Bản',
      steps: [
        'Dán kịch bản gốc vào ô "Original Draft" bên trái (hoặc bấm Import File).',
        'Chọn Mức độ xào bài (Rewrite Level), Mục tiêu tối ưu (Goal) và Ngôn ngữ đích.',
        'Bấm "REFINE" (biểu tượng tia sét) và xem kết quả, kèm theo các chỉ số đạo văn ở bên phải.',
        'Dùng thanh Chat bên dưới để AI sửa lại các phân đoạn chưa ưng ý (Ví dụ: "Hãy làm đoạn mở đầu hài hước hơn").'
      ],
      tips: ['Bấm vào nút "Diff" ở góc trên bên phải của bản thảo mới để so sánh trực quan những từ nào AI đã thay đổi.']
    }
  };

  const normalizedId = toolId.toLowerCase();
  
  if (instructions[normalizedId]) {
    return instructions[normalizedId];
  }

  // Fallback default
  return {
    title: 'Hệ thống Công cụ KODAA',
    steps: [
      'Giao diện đã được tối giản hóa để sử dụng dễ dàng.',
      'Thông thường bạn chỉ cần nhập từ khóa hoặc Prompt mong muốn.',
      'Nhấn nút Hành động (Xử lý / Khai thác) và chờ hệ thống chạy.',
      'Kết quả sẽ được trả về trực quan trên màn hình lưới.'
    ],
    tips: ['Các công cụ được thiết kế để kết nối với nhau. Kịch bản -> Giọng đọc -> SEO.']
  };
};

export default function ToolGuide({ toolId }: ToolGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const data = getToolInstructions(toolId);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9998] bg-[#0A0A0B]/80 backdrop-blur-md border border-indigo-500/40 text-indigo-300 rounded-full p-2 md:px-4 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-105 flex items-center gap-2 group hover:text-indigo-100 hover:bg-indigo-900/40"
      >
        <BookOpen size={16} className="group-hover:animate-pulse" />
        <span className="hidden md:inline font-bold text-xs tracking-wider uppercase">Hướng Dẫn</span>
      </button>

      {/* Guide Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0f111a] border border-indigo-500/30 rounded-2xl p-6 xl:p-8 w-full max-w-lg relative z-10 shadow-2xl overflow-hidden"
            >
              {/* Decorative backgrounds */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-white/5 p-1 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="mb-6 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-400/30 text-indigo-400">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-indigo-400 tracking-widest uppercase"> 매뉴얼 - Manual</h3>
                </div>
                <h2 className="text-2xl font-black text-white">{data.title}</h2>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <PlayCircle size={16} className="text-purple-400" /> Các Bước Thao Tác:
                  </h4>
                  <ul className="space-y-3">
                    {data.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-300 items-start p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04] transition-colors">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/30">
                          {i + 1}
                        </span>
                        <span className="pt-0.5 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {data.tips.length > 0 && (
                  <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4">
                    <h4 className="text-indigo-300 font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Lightbulb size={16} /> Mẹo Pro-Tips
                    </h4>
                    <ul className="space-y-2">
                      {data.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-indigo-200/80 flex items-start gap-2">
                          <span className="text-indigo-400 mt-1">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/10"
              >
                Đã Rõ, Bắt đầu ngay!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
