import React from 'react';

const projectData = [
    { name: 'Kênh Tech Review', niche: 'Công Nghệ', growth: '450% View' },
    { name: 'Góc Bếp Online', niche: 'Ẩm Thực', growth: '300% Subscribers' },
    { name: 'Fitness Daily', niche: 'Thể Thao', growth: '500% Watch Time' },
    { name: 'Du Lịch Bụi', niche: 'Du Lịch', growth: '250% Engagement' },
    { name: 'Kinh Doanh 4.0', niche: 'Tài Chính', growth: '600% Revenue' },
    { name: 'Art Studio', niche: 'Nghệ Thuật', growth: '320% View' },
    { name: 'Game thủ Pro', niche: 'Gaming', growth: '480% Subscribers' },
    { name: 'Làm Đẹp Cùng GenZ', niche: 'Sắc Đẹp', growth: '370% Watch Time' },
    { name: 'DIY Sáng Tạo', niche: 'Thủ Công', growth: '280% Engagement' },
    { name: 'Podcast Tri Thức', niche: 'Giáo Dục', growth: '550% View' },
    { name: 'Kênh Tech Review 2', niche: 'Công Nghệ', growth: '450% View' },
    { name: 'Góc Bếp Online 2', niche: 'Ẩm Thực', growth: '300% Subscribers' },
    { name: 'Fitness Daily 2', niche: 'Thể Thao', growth: '500% Watch Time' },
    { name: 'Du Lịch Bụi 2', niche: 'Du Lịch', growth: '250% Engagement' },
    { name: 'Kinh Doanh 4.0 2', niche: 'Tài Chính', growth: '600% Revenue' },
    { name: 'Art Studio 2', niche: 'Nghệ Thuật', growth: '320% View' },
    { name: 'Game thủ Pro 2', niche: 'Gaming', growth: '480% Subscribers' },
    { name: 'Làm Đẹp Cùng GenZ 2', niche: 'Sắc Đẹp', growth: '370% Watch Time' },
    { name: 'DIY Sáng Tạo 2', niche: 'Thủ Công', growth: '280% Engagement' },
    { name: 'Podcast Tri Thức 2', niche: 'Giáo Dục', growth: '550% View' },
];

const allProjects = [...projectData, ...projectData];

const Projects: React.FC = () => {
    return (
        <section id="projects" className="py-20 bg-black/50 border-y border-gray-800/50 overflow-hidden">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-playfair text-[#CDAD5A] mb-4">Biên Niên Sử Obsidian</h2>
                <p className="text-xl text-gray-400 mb-12">Nơi những thành tựu được khắc ghi.</p>
                <div className="relative w-full overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-24 before:bg-gradient-to-r before:from-black/50 before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-24 after:bg-gradient-to-l after:from-black/50 after:to-transparent after:z-10">
                    <div className="flex animate-scroll-left">
                        {allProjects.map((project, index) => (
                            <div key={index} className="group flex-shrink-0 w-80 mx-4">
                                <div className="h-full p-6 bg-black/30 border border-gray-800/50 transition-colors duration-300 hover:border-[#CDAD5A]/50">
                                    <p className="text-sm text-[#008080] font-semibold">{project.niche}</p>
                                    <h3 className="text-xl font-semibold text-white my-2">{project.name}</h3>
                                    <p className="text-3xl font-bold text-[#CDAD5A] melt-on-hover transition-all duration-300">{project.growth}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;
