import type { ExtensionCopy } from "./en";

export const vi = {
  seo: {
    title: "Gallery Wall Layout Generator cho Chrome",
    h1: "Cách dùng Gallery Wall Layout Generator",
    description:
      "Cách dùng tiện ích Chrome Gallery Wall Layout Generator: lên kế hoạch cho bức tường trong bảng điều khiển bên hoặc thử áp phích của cửa hàng ở kích thước thật.",
  },
  crumbs: { home: "Trang chủ", hub: "Tường tranh", page: "Tiện ích Chrome" },
  answer:
    "Nhấp vào nút của tiện ích trên thanh công cụ Chrome để mở bảng điều khiển bên và lên kế hoạch cho tường tranh. Ở bất kỳ cửa hàng nào, hãy nhấp chuột phải vào một áp phích và chọn “Try on my wall” để treo nó lên tường của bạn ở kích thước thật.",
  store: "Tải từ Cửa hàng Chrome trực tuyến",
  noButton: "Không thấy nút?",
  showPin: "Xem cách ghim nút",
  pin: {
    title: "Ghim nút vào thanh công cụ",
    text: "Chrome để các tiện ích mới phía sau nút hình mảnh ghép. Nhấp vào mảnh ghép (1) ở góc trên bên phải Chrome, rồi nhấp vào ghim (2) bên cạnh Gallery Wall Layout Generator. Sau đó nút của tiện ích sẽ luôn nằm trên thanh công cụ.",
    picture:
      "Thanh công cụ Chrome: nút hình mảnh ghép, đánh số 1, mở trình đơn Tiện ích, và ghim bên cạnh Gallery Wall Layout Generator được đánh số 2",
    pinned: "Đã ghim rồi?",
    showUsage: "Xem cách sử dụng",
  },
  usage: "Bạn có thể làm gì trong bảng điều khiển bên",
  steps: [
    {
      title: "Lên kế hoạch cho tường tranh",
      figure: "Năm khung tranh phía trên ghế sofa trong căn phòng mẫu",
      text: "Chọn một trong năm mẫu, đặt khoảng cách và di chuyển các khung. Căn phòng mẫu dùng được ngay; ảnh bức tường của chính bạn chỉ mất một phút.",
    },
    {
      title: "Thử áp phích từ cửa hàng",
      figure: "Trình đơn chuột phải trên áp phích của một cửa hàng, đã chọn Try on my wall",
      text: "Nhấp chuột phải vào một áp phích, chọn “Try on my wall” và chọn kích thước mà cửa hàng ghi. Áp phích sẽ được treo trên tường của bạn ở kích thước thật.",
    },
    {
      title: "Nhận vị trí đóng đinh",
      figure: "Năm khung tranh, mỗi khung có một chiếc đinh được đánh số",
      text: "Nhập khoảng cách từ móc treo đến mép trên của khung. Mỗi chiếc đinh có một số và một vị trí, đo từ một góc.",
    },
  ],
  wall: {
    title: "Dùng bức tường của bạn",
    text: "Chụp ảnh bức tường thẳng từ phía trước, rồi đánh dấu một vật bạn biết kích thước. Bảng điều khiển sẽ tính tỉ lệ mọi thứ theo vật đó:",
    items: [
      "chiều rộng bức tường",
      "một cánh cửa (cao {door} ở Mỹ)",
      "ghế sofa hoặc giường bạn đã đo",
      "tờ giấy Letter hoặc A4 dán trên tường",
      "thẻ tín dụng",
    ],
  },
  perm: {
    title: "Tiện ích có thể thấy những gì",
    rows: [
      {
        dt: "Trình đơn chuột phải",
        dd: "Thêm “Try on my wall” khi bạn nhấp chuột phải vào một hình ảnh.",
      },
      {
        dt: "Thẻ mà bạn nhấp vào",
        dd: "Đọc trang đó một lần, khi bạn chọn “Try on my wall”: hình ảnh và mọi kích thước trong văn bản của trang. Không đọc gì khác trên trang web đó.",
      },
      {
        dt: "framesizes.app",
        dd: "Có thể hỏi tiện ích đã được cài đặt và ghim hay chưa. Không chia sẻ gì khác.",
      },
    ],
    tip: "Ảnh bức tường của bạn chỉ nằm trên máy tính này.",
  },
  faq: {
    title: "Câu hỏi",
    items: [
      {
        q: "Tiện ích có dùng được ở mọi cửa hàng không?",
        a: "Ở mọi trang có hình ảnh mà bạn nhấp chuột phải được. Nếu trang không ghi kích thước, hãy tự nhập chiều rộng và chiều cao.",
      },
      {
        q: "Tại sao nút không có trên thanh công cụ?",
        a: "Chrome để các tiện ích mới phía sau nút hình mảnh ghép. Ghim một lần và nút sẽ luôn nằm trên thanh công cụ.",
      },
      {
        q: "Tiện ích chạy trên trình duyệt nào?",
        a: "Chrome 116 trở lên, trên máy tính. Tiện ích mở trong bảng điều khiển bên của Chrome.",
      },
    ],
  },
  chrome: {
    extensions: "Tiện ích",
    noAccess: "Không có quyền truy cập cần thiết",
    noAccessLines: ["Các tiện ích này không cần xem và thay đổi", "thông tin trên trang web này."],
    manage: "Quản lý tiện ích",
    copyImage: "Sao chép hình ảnh",
    inspect: "Kiểm tra",
  },
} satisfies ExtensionCopy;
