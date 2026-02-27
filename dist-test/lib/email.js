"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMasterclassWelcomeEmail = void 0;
var nodemailer_1 = require("nodemailer");
var transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_PORT === '465',
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});
var sendMasterclassWelcomeEmail = function (toEmail, userName) { return __awaiter(void 0, void 0, void 0, function () {
    var nameToUse, htmlContent, mailOptions, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                nameToUse = userName || 'bạn';
                htmlContent = "\n    <div style=\"font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333; line-height: 1.6;\">\n      <div style=\"text-align: center; margin-bottom: 30px;\">\n        <img src=\"https://seenyt.net/images/academy_masterclass_checkout.png\" alt=\"SeenYT Academy\" style=\"width: 100%; max-width: 600px; border-radius: 12px; shadow: 0 4px 6px rgba(0,0,0,0.1);\" />\n      </div>\n      \n      <h2 style=\"color: #d32f2f; font-size: 24px; margin-bottom: 20px;\">Ch\u00E0o m\u1EEBng b\u1EA1n \u0111\u1EBFn v\u1EDBi h\u00E0nh tr\u00ECnh Tri\u1EC7u View c\u00F9ng SeenYT! \uD83D\uDE80</h2>\n      \n      <p>Ch\u00E0o ".concat(nameToUse, ", m\u00ECnh l\u00E0 Mr. Seen t\u1EEB SeenYT.</p>\n      \n      <p>Ch\u00FAc m\u1EEBng b\u1EA1n \u0111\u00E3 c\u00F3 quy\u1EBFt \u0111\u1ECBnh \u0111\u00FAng \u0111\u1EAFn nh\u1EA5t h\u00F4m nay: B\u1EAFt \u0111\u1EA7u h\u00E0nh tr\u00ECnh x\u00E2y d\u1EF1ng k\u00EAnh YouTube b\u00E0i b\u1EA3n thay v\u00EC m\u00F2 m\u1EABm trong b\u00F3ng t\u1ED1i.</p>\n      \n      <p>H\u1EC7 th\u1ED1ng \u0111\u00E3 m\u1EDF kh\u00F3a <strong>Ch\u01B0\u01A1ng 1: T\u01B0 duy YouTube 2026</strong> d\u00E0nh ri\u00EAng cho b\u1EA1n. \u0110\u1EC3 h\u00E0nh tr\u00ECnh n\u00E0y hi\u1EC7u qu\u1EA3 nh\u1EA5t, b\u1EA1n h\u00E3y th\u1EF1c hi\u1EC7n 2 b\u01B0\u1EDBc sau:</p>\n      \n      <div style=\"background-color: #f9f9f9; padding: 20px; border-left: 4px solid #d32f2f; margin: 25px 0;\">\n        <p style=\"margin-top: 0;\"><strong>B\u01B0\u1EDBc 1: H\u1ECDc ngay b\u00E0i \u0111\u1EA7u ti\u00EAn</strong></p>\n        <p>Ki\u1EBFn th\u1EE9c n\u1EC1n t\u1EA3ng l\u00E0 b\u01B0\u1EDBc \u0111\u1EC7m quan tr\u1ECDng nh\u1EA5t.</p>\n        <a href=\"https://seenyt.net/academy\" style=\"display: inline-block; background-color: #d32f2f; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; margin-top: 10px;\">Truy c\u1EADp Academy Ngay</a>\n      </div>\n      \n      <div style=\"background-color: #f9f9f9; padding: 20px; border-left: 4px solid #0056b3; margin: 25px 0;\">\n        <p style=\"margin-top: 0;\"><strong>B\u01B0\u1EDBc 2: Tham gia c\u1ED9ng \u0111\u1ED3ng Zalo K\u00EDn</strong></p>\n        <p>\u0110\u00E2y l\u00E0 n\u01A1i m\u00ECnh tr\u1EF1c ti\u1EBFp h\u1ED7 tr\u1EE3, gi\u1EA3i \u0111\u00E1p th\u1EAFc m\u1EAFc v\u00E0 chia s\u1EBB c\u00E1c \"ng\u00E1ch xanh\" m\u1EDBi nh\u1EA5t h\u00E0ng tu\u1EA7n d\u00E0nh ri\u00EAng cho h\u1ECDc vi\u00EAn.</p>\n        <a href=\"https://zalo.me/g/lhxazc331\" style=\"display: inline-block; background-color: #0056b3; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; margin-top: 10px;\">Tham gia Zalo K\u00EDn</a>\n      </div>\n      \n      <p>H\u1EB9n g\u1EB7p b\u1EA1n \u1EDF \u0111\u1EC9nh cao c\u1EE7a s\u1EF1 s\u00E1ng t\u1EA1o!</p>\n      \n      <p style=\"margin-top: 40px; font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 20px;\">\n        Tr\u00E2n tr\u1ECDng,<br/>\n        <strong>Mr. Seen & \u0110\u1ED9i ng\u0169 SeenYT</strong><br/>\n        <a href=\"https://seenyt.net\" style=\"color: #666; text-decoration: none;\">seenyt.net</a>\n      </p>\n    </div>\n  ");
                mailOptions = {
                    from: process.env.EMAIL_FROM || '"SeenYT Academy" <noreply@seenyt.net>',
                    to: toEmail,
                    subject: 'Chào mừng bạn đến với hành trình Triệu View cùng SeenYT! 🚀',
                    html: htmlContent,
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, transporter.sendMail(mailOptions)];
            case 2:
                _a.sent();
                console.log("Welcome email sent successfully to ".concat(toEmail));
                return [2 /*return*/, true];
            case 3:
                error_1 = _a.sent();
                console.error("Error sending email to ".concat(toEmail, ":"), error_1);
                return [2 /*return*/, false];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.sendMasterclassWelcomeEmail = sendMasterclassWelcomeEmail;
