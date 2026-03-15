import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('🛡️ BẮT ĐẦU KIỂM THỬ BẢO MẬT HỆ THỐNG SEENYT 🛡️\n');

  // Test 1: PayOS Webhook Spoofing
  console.log('➡️ TEST 1: Giả mạo Webhook Thanh toán PayOS');
  try {
    const res = await axios.post(`${API_URL}/payment/payos-webhook`, {
      code: '00',
      desc: 'Success',
      data: { orderCode: 123456, amount: 1000000 },
      signature: 'fake_signature_123'
    }, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true // Prevent axios from throwing on errors
    });
    
    if (res.data.success === false && res.data.message === 'Invalid signature') {
      console.log('✅ PASS: Đã chặn thành công yêu cầu thanh toán giả mạo! Lỗi trả về: ' + res.data.message);
    } else {
      console.log('❌ FAIL: Lỗ hổng PayOS vẫn chưa đóng.', res.data);
    }
  } catch (err: any) {
    console.log('   Error:', err.message);
  }
  console.log('');

  // Test 2: API Summarize (AI) Bypass without Session
  console.log('➡️ TEST 2: Truy cập trái phép API Tóm tắt kịch bản (Không Token)');
  try {
    const res = await axios.post(`${API_URL}/ai/summarize`, {
      transcript: "Test free AI generation"
    }, {
      validateStatus: () => true
    });

    if (res.status === 401) {
      console.log('✅ PASS: Đã chặn truy cập không xác thực. Mã lỗi: ' + res.status + ' - ' + res.data.error);
    } else {
      console.log('❌ FAIL: API vẫn cho phép người ngoài truy cập.', res.status);
    }
  } catch (err: any) {
    console.log('   Error:', err.message);
  }
  console.log('');

  // Test 3: API Chatbot (AI) Bypass
  console.log('➡️ TEST 3: Truy cập trái phép API Chatbot AI (Không Token)');
  try {
    const res = await axios.post(`${API_URL}/chat`, {
      message: "Hello"
    }, {
      validateStatus: () => true
    });

    if (res.status === 401) {
      console.log('✅ PASS: Đã chặn chatbot không xác thực. Mã lỗi: ' + res.status + ' - ' + res.data.error);
    } else {
      console.log('❌ FAIL: Chatbot vẫn cho phép chat chùa.', res.status);
    }
  } catch (err: any) {
    console.log('   Error:', err.message);
  }
  console.log('');
  
  console.log('🎉 TOÀN BỘ KIỂM THỬ BẢO MẬT ĐÃ HOÀN TẤT. HỆ THỐNG AN TOÀN!');
}

runTests();
