const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();

// API: /api/photo/photosOfUser/:id - Lấy ảnh và comment của 1 user
router.get("/photosOfUser/:id", async (request, response) => {
  const userId = request.params.id;

  try {
    // Tìm tất cả ảnh của user_id này
    const photos = await Photo.find({ user_id: userId });

    if (photos.length === 0) {
      // Kiểm tra xem user có tồn tại không để trả về thông báo đúng
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return response.status(400).send({ message: "Người dùng không tồn tại" });
      }
      return response.status(200).send([]);
    }

    // Vì yêu cầu cần trả về thông tin user trong comment (_id, first_name, last_name)
    // Chúng ta sẽ dùng Promise.all để xử lý bất đồng bộ cho từng bức ảnh
    const processedPhotos = await Promise.all(
      photos.map(async (photo) => {
        // Với mỗi comment, lấy thêm thông tin user từ collection Users
        const processedComments = await Promise.all(
          photo.comments.map(async (comment) => {
            const author = await User.findById(comment.user_id).select("_id first_name last_name");
            return {
              _id: comment._id,
              comment: comment.comment,
              date_time: comment.date_time,
              user: author // Trả về object user thay vì chỉ ID
            };
          })
        );

        return {
          _id: photo._id,
          user_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments: processedComments
        };
      })
    );

    response.status(200).send(processedPhotos);

  } catch (err) {
    response.status(400).send({ message: "Lỗi khi lấy ảnh hoặc ID không hợp lệ", error: err });
  }
});

module.exports = router;