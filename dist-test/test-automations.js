var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var sendMasterclassWelcomeEmail = require('./lib/email').sendMasterclassWelcomeEmail;
var axios = require('axios');
var path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
function testEmailAndTelegram() {
    return __awaiter(this, void 0, void 0, function () {
        var testEmail, userName, emailResult, e_1, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, msg, e_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("🚀 Bắt đầu test luồng Automations...");
                    testEmail = "phamanhtung.jp@gmail.com";
                    userName = "Anh Tùng (Test)";
                    // 1. Test Welcome Email
                    console.log("1. Đang gửi thử Email Welcome tới:", testEmail);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, sendMasterclassWelcomeEmail(testEmail, userName)];
                case 2:
                    emailResult = _b.sent();
                    if (emailResult) {
                        console.log("✅ Email Welcome đã được gửi THÀNH CÔNG từ cấu hình Namecheap!");
                    }
                    else {
                        console.log("❌ Gửi Email THẤT BẠI. Anh hãy check lại Mật khẩu App/Cấu hình Vercel.");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    console.error("Lỗi kịch bản Email:", e_1);
                    return [3 /*break*/, 4];
                case 4:
                    console.log("-----------------------------------------");
                    // 2. Test Telegram Notification
                    console.log("2. Đang gửi thử Telegram Notification...");
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 9, , 10]);
                    TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
                    TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
                    if (!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID)) return [3 /*break*/, 7];
                    msg = "\u2705 [TEST H\u1EC6 TH\u1ED0NG] THANH TO\u00C1N TH\u00C0NH C\u00D4NG!\n------------------------------------\n- Kh\u00E1ch: ".concat(testEmail, "\n- S\u1ED1 ti\u1EC1n: 849,000 \u0111\n- G\u00F3i: MASTERCLASS\n- M\u00E3 \u0111\u01A1n: TEST_").concat(Date.now(), "\n------------------------------------\n\uD83D\uDC49 H\u1EC7 th\u1ED1ng g\u1EEDi Email \u0111\u00E3 \u0111\u01B0\u1EE3c k\u00EDch ho\u1EA1t! \uD83C\uDF89");
                    return [4 /*yield*/, axios.post("https://api.telegram.org/bot".concat(TELEGRAM_BOT_TOKEN, "/sendMessage"), {
                            chat_id: TELEGRAM_CHAT_ID,
                            text: msg,
                            parse_mode: 'HTML',
                        })];
                case 6:
                    _b.sent();
                    console.log("✅ Telegram Notification đã bắn THÀNH CÔNG vào Bot của anh!");
                    return [3 /*break*/, 8];
                case 7:
                    console.log("❌ Lỗi: Chưa tìm thấy Token Telegram trong file .env");
                    _b.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    e_2 = _b.sent();
                    console.error("Lỗi gửi Telegram:", ((_a = e_2.response) === null || _a === void 0 ? void 0 : _a.data) || e_2.message);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
testEmailAndTelegram();
