# 燃費記録アプリ - MVP Summary

## Tổng quan

Ứng dụng ghi nhận và tính toán **燃費 (nenpi - fuel efficiency)** cho xe máy/ô tô sử dụng **満タン法 (Mantan-hou - phương pháp đổ đầy bình)**.

## Màn hình

### 1. Dashboard (Màn hình chính)

- Hiển thị **当月** (燃費 tháng này)
- Hiển thị **平均** (燃費 trung bình)
- **Chart** biểu đồ燃費 theo thời gian
- **History cards** - danh sách các lần đổ xăng (click để edit)
- **Filter** theo thời gian: 1ヶ月, 3ヶ月, 6ヶ月, 1年
- Drill-down vào từng tháng để xem chi tiết

### 2. Record Screen (Màn hình nhập/sửa)

- Nhập **日付・時刻** (datetime picker)
- Nhập **ODO** (với validation theo time position)
- Nhập **給油量** (số lít xăng đổ)
- Toggle **満タン給油** (đổ đầy bình hay không)
- Toggle **記録忘れがある** (có lần quên ghi trước đó không)

---

## Công thức tính - logic

Ở trong lần này , có 3 phương án tính được đưa ra để hiển thị trực quan biểu đồ.

Vui lòng tham khảo ở đây:
https://fuel-eff-demo.nguyen-vh-nhan.workers.dev/

Tài liệu là để giải thích phương án 3.

### Logic 満タン法

### Nguyên lý

- Chỉ tính燃費 khi đổ **đầy bình** (満タン)
- 燃費 = (ODO hiện tại - ODO lần満タン trước) / (Tổng fuel đã đổ từ lần満タン trước)

### Công thức

```
燃費 = ΔODO / Σfuel
```

---

## Chứng minh bằng toán học

Công thức này này được áp dụng trong case như sau

### Pattern: 満タン → 部分 → 部分 → ... → 満タン (không có 忘れ ở giữa)

Với mỗi thời điểm ta có giá trị lượng xăng như sau

```
時点0: 満タン (ODO = O₀, タンク = FULL)
時点1: 部分給油 f₁ L (ODO = O₁ hay gọi là O_1)
時点2: 部分給油 f₂ L (ODO = O₂)
...
時点n: 部分給油 fₙ L (ODO = Oₙ)
時点N: 満タン給油 fₙ₊₁ L (ODO = Oₙ₊₁)
```

### Tracking tank level

Giả sử gọi c_i và lượng xăng đổ ở lần thứ i và f_i là lượng xăng tiêu thụ lần đó.
Ta có công thức như sau

```
時点0後: FULL
時点1後: FULL - c₁ + f₁
時点2後: FULL - (c₁+c₂) + (f₁+f₂)
...
時点N後: FULL - Σc + Σf = FULL (vì đổ đầy lại)
```

### Kết luận

```
FULL - Σc + Σf = FULL
→ Σc = Σf
→ Tổng tiêu thụ = Tổng đổ
```

**∴ Do vậy ta có công thức燃費 = ΔODO / Σfuel**
\*\* Lưu ý rằng nếu có record 忘れ ở giữa thì bởi vì ở UI không cho phép người dùng nhập giá trị mà vừa 忘れ lẫn không 満タン vậy nên nếu có giá trị 忘れ thì record đó sẽ coi như là record reset lại ODO (tức là dùng cho lần tính tới khi người dùng đổ 満タン)

---

## Các loại Record

| Type       | isFullTank | skipCalculation | Ý nghĩa                                             |
| ---------- | ---------- | --------------- | --------------------------------------------------- |
| **満タン** | ✅ true    | ❌ false        | Đổ đầy bình → tính燃費                              |
| **部分**   | ❌ false   | ❌ false        | Đổ một phần → tích lũy fuel cho lần sau             |
| **忘れ**   | ✅ true    | ✅ true         | Đổ đầy nhưng trước đó có lần quên ghi → skip, reset |

> ⚠️ **Note về trường hợp không hợp lệ: 部分 + 忘れ**
>
> Trường hợp người dùng chọn **"Đổ một phần" (部分)** và đồng thời bật **"Có lần quên ghi" (記録忘れ)** là **không hợp lệ** và không được cho phép trong ứng dụng.
>
> **Lý do:** Dữ liệu nhập vào trong trường hợp này là **VÔ NGHĨA** và không thể sử dụng:
>
> 1. **Không thể làm điểm reset:** Chỉ có 満タン mới có thể làm điểm reset cho việc tính toán. 部分 không thể reset được.
> 2. **Không thể tích lũy fuel an toàn:** Vì đã có lần quên ghi trước đó, dữ liệu fuel không đầy đủ, nên tích lũy sẽ dẫn đến kết quả sai.
> 3. **Kết luận:** Cho dù người dùng có nhập số lít xăng vào, dữ liệu đó cũng không được dùng để tính toán gì cả.
>    **Xử lý trong UI:** Khi người dùng tắt toggle "満タン給油", toggle "記録忘れがある" sẽ tự động bị vô hiệu hóa và reset về OFF.

---

## Cases chi tiết

### Case 1: Toàn bộ満タン (cơ bản)

```
#1: ODO=1000, 3L, 満タン → 燃費=100/3=33.3 km/L
#2: ODO=1100, 4L, 満タン → 燃費=100/4=25.0 km/L
#3: ODO=1250, 3L, 満タン → 燃費=150/3=50.0 km/L
```

### Case 2: Có 部分給油 (đổ một phần)

```
#1: ODO=1000, 3L, 満タン  → 燃費=33.3 km/L
#2: ODO=1050, 1L, 部分    → — (tích lũy: 1L)
#3: ODO=1100, 0.5L, 部分  → — (tích lũy: 1.5L)
#4: ODO=1150, 1L, 部分    → — (tích lũy: 2.5L)
#5: ODO=1250, 3L, 満タン  → 燃費=(1250-1000)/(1+0.5+1+3)=250/5.5=45.5 km/L
```

### Case 3: Có 記録忘れ (quên ghi)

```
#1: ODO=1000, 3L, 満タン  → 燃費=33.3 km/L
#2: (quên ghi - không có record)
#3: ODO=1300, 5L, 満タン + 記録忘れ  → SKIP (reset point)
#4: ODO=1450, 4L, 満タン  → 燃費=150/4=37.5 km/L (từ #3)
```

---

## Edit/Delete Logic

### Thiết kế: Đơn giản hóa

```
Data thay đổi (thêm/sửa/xóa)
    ↓
Sort theo thời gian
    ↓
Recalculate toàn bộ 燃費 (không remark)
    ↓
Done!
```

### Tại sao không dùng "Remark" (auto-flag)?

| #   | Lý do                                                             |
| --- | ----------------------------------------------------------------- |
| 1   | **Giảm phức tạp**: Không cần logic phát hiện異常, so sánh catalog |
| 2   | **満タン法 tự hoàn chỉnh**: Chỉ cần data hiện tại để tính         |
| 3   | **Tôn trọng user**: Nếu燃費 sai → user tự sửa data                |
| 4   | **Trade-off**: MVP ưu tiên đơn giản hơn chính xác tuyệt đối       |

### Delete confirmation

| Xóa record | Modal confirm?                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| **Latest** | ❌ Không cần                                                                                                   |
| **Khác**   | ✅ Cần (vì ảnh hưởng records sau), tuy nhiên sẽ hiện checkbox không hiện lần sau nếu người dùng muốn xoá nhanh |

---

## ODO Validation theo Time

Khi chọn datetime → tính ODO range hợp lệ:

```
Existing:
#1: 2026/01/01 10:00, ODO=1000
#2: 2026/01/02 10:00, ODO=1150
#3: 2026/01/03 10:00, ODO=1300

Nhập mới (time = 2026/01/02 15:00):
Vị trí: giữa #2 và #3
ODO range: 1150 < ODO < 1300
```

UI hiển thị: **"ODO入力可能範囲: 1151 ~ 1299 km"**

---

## UI Rules

### Chart

- Trục X: ngày (MM/DD)
- Trục X dưới: ký hiệu ○ (部分) hoặc ✕ (忘れ)
- Legend: ● 満タン, ○ 部分給油, ✕ 記録忘れ
- Line chỉ connect các điểm 満タン có燃費

### History Card

- Click → mở Edit screen
- Hiển thị: datetime, ΔODO, fuel, 燃費
- Badge "部分" / "記録忘れ"
- Nút ✕ để xóa (tất cả records)

### Toggle Rules

- **満タン = ON**: 記録忘れ toggle enabled
- **満タン = OFF**: 記録忘れ toggle disabled + auto reset về OFF

## Flow người dùng

### Thêm mới

```
[Dashboard] → Click "＋ 給油を記録する"
[Record Screen] → Nhập data → "保存する"
[Dashboard] (với data mới, recalculated)
```

### Edit

```
[Dashboard] → Click vào History card
[Record Screen "記録を編集"] → Sửa data → "更新する"
[Dashboard] (recalculated)
```

### Delete

```
[Dashboard] → Click ✕ trên card
(Latest) → Xóa ngay
(Khác) → Modal confirm → Xóa → Recalculate
```

---

## Demo Scenarios

| Scenario     | Mô tả                             |
| ------------ | --------------------------------- |
| mantan       | Toàn bộ満タン (lý tưởng)          |
| partial      | Có 2 lần 部分給油                 |
| many_partial | Nhiều 部分給油                    |
| long_term    | 6 tháng data với mix満タン + 部分 |

---
