// pages/login-test.tsx
import { redirect } from 'next/navigation';

// Trang test cũ không cần thiết nữa vì đã có AuthModal + Google login chính thức
// Redirect thẳng về home để tránh lỗi prerender + làm sạch project

export default function LoginTest() {
  redirect('/');
}

// Nếu anh muốn giữ lại để test nhanh sau này thì dùng cách này (cũng OK):
// export { default } from '@/components/AuthPanel'; // nhưng cách trên sạch hơn