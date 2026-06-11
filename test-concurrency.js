import http from "k6/http";
import { check } from "k6";

// Nạp danh sách vé và người mua từ file JSON
const ticketIds = JSON.parse(open("./tickets.json"));
const buyerIds = JSON.parse(open("./buyers.json"));

// Chọn 1 vé duy nhất để 10 người dùng tranh chấp đồng thời
const targetTicketId = ticketIds[0];

export const options = {
  scenarios: {
    concurrency_test: {
      executor: "per-vu-iterations",
      vus: 10,          // 10 người dùng ảo
      iterations: 1,    // Mỗi người dùng chỉ thực hiện đặt vé đúng 1 lần duy nhất
      maxDuration: "10s",
    },
  },
};

export default function () {
  const url = "http://localhost:4000/orders";

  // Mỗi virtual user (__VU) lấy 1 buyerId khác nhau từ danh sách (index từ 0 đến 9)
  const buyerId = buyerIds[__VU - 1];

  const payload = JSON.stringify({
    buyerId: buyerId,
    campaignId: "db9ca5b1-093a-4c3e-8e71-ca350765da4b",
    sessionId: "db694ed5-e154-4a3b-8547-7e5fcfd7b421",
    totalPrice: 200000,
    paymentGateway: "VNPAY",
    ticketIds: [targetTicketId], // Tất cả 10 người cùng đặt mua chung 1 vé này
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(url, payload, params);

  // Log ra console để bạn dễ theo dõi kết quả thực tế
  console.log(`VU ${__VU} (Buyer ${buyerId.substring(0, 8)}...) đặt vé: Status = ${res.status} | Response: ${res.body}`);

  check(res, {
    "phản hồi thành công (201) hoặc lỗi bị tranh chấp (400)": (r) =>
      r.status === 201 || r.status === 400,
    "không bị lỗi máy chủ (500)": (r) => r.status !== 500,
  });
}
