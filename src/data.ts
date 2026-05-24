/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Question, ExamConfig } from './types';

export const DEFAULT_USERS: User[] = [
  { u: 'admin', p: 'admin', role: 'admin' },
  { u: 'user', p: 'user', role: 'user' },
  { u: 'thi_sinh_1', p: '123456', role: 'user' },
  { u: 'thi_sinh_2', p: '123456', role: 'user' }
];

export const DEFAULT_QUESTIONS: Question[] = [
  {
    t: "Mạng Máy Tính",
    q: "Giao thức nào dưới đây hoạt động ở tầng Truyền tải (Transport Layer) trong mô hình OSI và cung cấp dịch vụ truyền dữ liệu tin cậy?",
    o: [
      "UDP (User Datagram Protocol)",
      "TCP (Transmission Control Protocol)",
      "IP (Internet Protocol)",
      "HTTP (Hypertext Transfer Protocol)"
    ],
    a: 1,
    e: "TCP (Transmission Control Protocol) là giao thức hướng kết nối, đảm bảo dữ liệu được truyền tải đầy đủ, đúng thứ tự và không bị lỗi thông qua các cơ chế bắt tay 3 bước và truyền lại dữ liệu.",
    c: "telnet www.google.com 80"
  },
  {
    t: "Hệ Điều Hành",
    q: "Để hiển thị các tiến trình đang chạy theo thời gian thực trong Linux, lệnh nào sau đây thường được sử dụng nhiều nhất?",
    o: [
      "ls -la",
      "df -h",
      "top",
      "ps -ef"
    ],
    a: 2,
    e: "Lệnh 'top' hiển thị danh sách các tiến trình hệ thống cập nhật liên tục thời gian thực, tài nguyên CPU, RAM mà chúng đang sử dụng.",
    c: "top -o %CPU"
  },
  {
    t: "Lập trình Web",
    q: "Trong React 18 & 19, Hook nào được sử dụng để tối ưu hóa hiệu năng bằng cách ghi nhớ (memoize) kết quả tính toán đắt đỏ giữa các lần render?",
    o: [
      "useEffect",
      "useMemo",
      "useCallback",
      "useReducer"
    ],
    a: 1,
    e: "useMemo được sử dụng để ghi nhớ một giá trị được tính toán phức tạp, giúp tránh việc tính toán lại không cần thiết ở mỗi lần component component re-render trừ khi dependencies thay đổi.",
    c: "const cachedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);"
  },
  {
    t: "Cơ Sở Dữ Liệu",
    q: "Chỉ mục (Index) trong cơ sở dữ liệu quan hệ (RDBMS) có tác dụng chính nào sau đây?",
    o: [
      "Tăng tốc độ truy vấn SELECT dữ liệu",
      "Tăng tốc độ ghi dữ liệu (INSERT, UPDATE)",
      "Tự động sao lưu dự phòng cơ sở dữ liệu",
      "Mã hoá dữ liệu nhạy cảm của người dùng"
    ],
    a: 0,
    e: "Index giúp hệ quản trị cơ sở dữ liệu tìm kiếm các hàng nhanh chóng hơn mà không cần quét toàn bộ bảng (Full Table Scan). Tuy nhiên, nó có thể làm chậm một chút thao tác ghi (INSERT/UPDATE/DELETE) do phải cập nhật cây chỉ mục.",
    c: "CREATE INDEX idx_user_email ON users(email);"
  },
  {
    t: "An Toàn Thông Tin",
    q: "Kỹ thuật tấn công mạng chèn mã độc JavaScript vào các trang web hợp lệ nhằm thực thi trên trình duyệt của nạn nhân được gọi là gì?",
    o: [
      "SQL Injection",
      "XSS (Cross-Site Scripting)",
      "DDOS (Distributed Denial of Service)",
      "Phishing"
    ],
    a: 1,
    e: "XSS (Cross-Site Scripting) xảy ra khi ứng dụng nhúng dữ liệu đầu vào không an toàn của người dùng vào trang web được gửi tới trình duyệt, cho phép kẻ tấn công thực thi mã Script độc hại.",
    c: "<script>alert(document.cookie)</script>"
  },
  {
    t: "Hệ Thống Điện Toán",
    q: "Điện toán đám mây (Cloud Computing) cung cấp dịch vụ hạ tầng mạng, máy chủ ảo, và ổ đĩa lưu trữ được phân loại vào mô hình định nghĩa nào?",
    o: [
      "SaaS (Software as a Service)",
      "PaaS (Platform as a Service)",
      "IaaS (Infrastructure as a Service)",
      "FaaS (Function as a Service)"
    ],
    a: 2,
    e: "IaaS (Infrastructure as a Service) cung cấp các tài nguyên điện toán cơ bản như máy chủ vật lý hoặc ảo, lưu trữ, mạng dưới dạng dịch vụ cho người dùng thuê.",
    c: "gcloud compute instances create exam-vm --machine-type=e2-medium"
  },
  {
    t: "Git & Version Control",
    q: "Lệnh nào dùng để gộp các commit nhánh hiện tại lên máy chủ từ xa đồng thời thiết đặt nhánh theo dõi mặc định?",
    o: [
      "git push -u origin main",
      "git checkout -b main",
      "git pull origin main",
      "git commit -m 'initial commit'"
    ],
    a: 0,
    e: "Lệnh 'git push -u origin main' đẩy mã nguồn lên nhánh 'main' của remote 'origin' và thiết đặt cờ '-u' (upstream) để liên kết nhánh gốc.",
    c: "git push -u origin main"
  },
  {
    t: "Thiết Kế Phần Mềm",
    q: "Mô hình kiến trúc MVC viết tắt của ba thành phần cơ bản nào?",
    o: [
      "Manager - View - Controller",
      "Model - View - Controller",
      "Model - Visual - Core",
      "Module - View - Central"
    ],
    a: 1,
    e: "MVC là chữ viết tắt của Model (Xử lý dữ liệu), View (Hiển thị giao diện) và Controller (Bộ điều khiển liên kết giữa Model và View).",
    c: "class UserController extends Controller {}"
  },
  {
    t: "Mạng Máy Tính",
    q: "Cổng mặc định (Port) của giao thức HTTPS bảo mật là bao nhiêu?",
    o: [
      "80",
      "22",
      "443",
      "8080"
    ],
    a: 2,
    e: "HTTPS (bảo mật) chạy mặc định trên cổng 443, trong khi HTTP thường chạy trên cổng 80, SSH chạy trên cổng 22.",
    c: "curl -I https://google.com"
  },
  {
    t: "Lập trình Web",
    q: "Trong CSS Grid, thuộc tính nào được sử dụng để chỉ định khoảng cách giữa các hàng và các cột của lưới?",
    o: [
      "gap",
      "spacing",
      "padding",
      "margin"
    ],
    a: 0,
    e: "Thuộc tính 'gap' (hoặc grid-gap) đặt khoảng trống giữa các hàng và các cột trong bố cục lưới (lưới CSS) hoặc hộp linh hoạt (Flexbox).",
    c: "display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;"
  }
];

export const DEFAULT_CONFIG: ExamConfig = {
  qty: 5,
  time: 10
};
