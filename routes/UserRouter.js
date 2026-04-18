const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

// API: /api/user/list - Trả về danh sách rút gọn cho sidebar
router.get("/list", async (request, response) => {
  try {
    // Chỉ lấy các trường _id, first_name, last_name bằng hàm .select()
    const users = await User.find({}).select("_id first_name last_name");
    response.status(200).send(users);
  } catch (err) {
    response.status(500).send({ message: "Lỗi hệ thống", error: err });
  }
});

// API: /api/user/:id - Trả về chi tiết 1 người dùng
router.get("/:id", async (request, response) => {
  const id = request.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return response.status(400).send({ message: "Không tìm thấy người dùng với ID: " + id });
    }
    response.status(200).send(user);
  } catch (err) {
    // Nếu ID không đúng định dạng MongoDB cũng sẽ rơi vào đây
    response.status(400).send({ message: "ID người dùng không hợp lệ hoặc lỗi truy vấn", error: err });
  }
});

module.exports = router;