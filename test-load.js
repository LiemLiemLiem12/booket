import http from "k6/http";
import { check, sleep } from "k6";

// Nạp danh sách 500 vé và 10 người mua mẫu từ các file JSON vừa tạo
const ticketIds = JSON.parse(open("./tickets.json"));
const buyerIds = JSON.parse(open("./buyers.json"));

export const options = {
  stages: [
    { duration: "2s", target: 150 }, // Bơm 150 user trong 2 giây đầu
    { duration: "8s", target: 1000 }, // Đẩy lên 300 user và giữ tải
  ],
};

export default function () {
  const url = "http://localhost:4000/orders";

  // Lấy ngẫu nhiên 1 người mua và 1 vé trong kho 500 vé
  const randomBuyerId = buyerIds[Math.floor(Math.random() * buyerIds.length)];
  const randomTicketId =
    ticketIds[Math.floor(Math.random() * ticketIds.length)];

  const payload = JSON.stringify({
    buyerId: randomBuyerId,
    campaignId: "db9ca5b1-093a-4c3e-8e71-ca350765da4b",
    sessionId: "db694ed5-e154-4a3b-8547-7e5fcfd7b421",
    totalPrice: 200000, // Giá mặc định ước lượng cho Standard, hoặc 500000 tùy thuộc loại vé
    paymentGateway: "VNPAY",
    ticketIds: [randomTicketId], // Đặt mua 1 vé ngẫu nhiên
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(url, payload, params);

  // Kiểm tra mã phản hồi:
  // - 201: Đặt thành công (khi vé còn AVAILABLE)
  // - 400: Không đặt được (khi vé đã có người khác đặt trước đó hoặc hết hạn)
  check(res, {
    "phản hồi hợp lệ (201 hoặc 400)": (r) =>
      r.status === 201 || r.status === 400,
    "lỗi máy chủ (500+)": (r) => r.status >= 500,
  });

  // Tạm dừng ngẫu nhiên từ 50ms đến 150ms giữa các request để giả lập hành vi người dùng thật bấm
  sleep(Math.random() * 0.1 + 0.05);
}
