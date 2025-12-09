// frontend/src/components/instructor/AddInstructorPanel.jsx
import { useState, useEffect } from "react";
import { createInstructor, searchNewInstructors, updateInstructor } from "../../api/instructorApi";

export default function AddInstructorPanel({
  onGlobalMessage,
  onRefreshAll,
  refreshToken,
}) {
  // Form state
  const [editingId, setEditingId] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [level, setLevel] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [bio, setBio] = useState("");
  const [note, setNote] = useState("");

  // List NEW instructors
  const [searchKeyword, setSearchKeyword] = useState("");
  const [newInstructors, setNewInstructors] = useState([]);
  const [localMessage, setLocalMessage] = useState("");

  // Reload list khi refreshToken thay đổi
  useEffect(() => {
    loadNewInstructors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const showMessage = (msg) => {
    setLocalMessage(msg);
    if (onGlobalMessage) onGlobalMessage(msg);
  };

  const resetForm = () => {
    setEditingId(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setSpecialization("");
    setLevel("");
    setExperienceYears("");
    setHourlyRate("");
    setBio("");
    setNote("");
  };

  const handleSubmit = async () => {
    setLocalMessage("");

    if (!fullName.trim() || !email.trim()) {
      showMessage("Họ tên và email là bắt buộc.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showMessage("Email không hợp lệ. Vui lòng nhập email đúng định dạng.");
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      email: email.trim(),
      specialization: specialization.trim() || null,
      level: level.trim() || null,
      experience_years: Number(experienceYears) || 0,
      hourly_rate: Number(hourlyRate) || 0,
      bio: bio.trim() || null,
      note: note.trim() || null,
      status: "NEW",
    };

    try {
      let data;
      if (editingId) {
        data = await updateInstructor(editingId, payload);
      } else {
        data = await createInstructor(payload);
      }

      if (!data || !data.success) {
        showMessage((data && data.message) || "Lỗi server khi lưu giảng viên.");
        return;
      }

      // Show account info
      if (data.username && data.tempPassword) {
        showMessage(
          `Đã lưu giảng viên. Tài khoản: ${data.username} / Mật khẩu tạm: ${data.tempPassword}${
            data.emailResult && data.emailResult.sent ? " (đã gửi email)" : ""
          }`
        );
      } else {
        showMessage(
          editingId ? "Đã cập nhật thông tin giảng viên." : "Đã lưu thông tin giảng viên."
        );
      }

      resetForm();
      await loadNewInstructors();

      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi lưu thông tin giảng viên.");
    }
  };

  const loadNewInstructors = async () => {
    try {
      const data = await searchNewInstructors(searchKeyword.trim());

      if (!data || !data.success) {
        setLocalMessage((data && data.message) || "Lỗi server khi tải giảng viên mới.");
        return;
      }

      setNewInstructors(data.instructors || []);
    } catch (err) {
      console.error(err);
      setLocalMessage("Lỗi kết nối khi tải giảng viên mới.");
    }
  };

  const handleSearch = async () => {
    await loadNewInstructors();
  };

  const handleEditFromList = (instructor) => {
    setEditingId(instructor.id);
    setFullName(instructor.full_name || "");
    setPhone(instructor.phone || "");
    setEmail(instructor.email || "");
    setSpecialization(instructor.specialization || "");
    setLevel(instructor.level || "");
    setExperienceYears(instructor.experience_years || 0);
    setHourlyRate(instructor.hourly_rate || 0);
    setBio(instructor.bio || "");
    setNote(instructor.note || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleActivate = async (instructor) => {
    if (!window.confirm(`Kích hoạt giảng viên "${instructor.full_name}"?`)) return;

    try {
      const data = await updateInstructor(instructor.id, { status: "ACTIVE" });
      if (!data || !data.success) {
        showMessage((data && data.message) || "Lỗi server khi kích hoạt giảng viên.");
        return;
      }

      showMessage(`Đã kích hoạt giảng viên "${instructor.full_name}".`);
      await loadNewInstructors();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error(err);
      showMessage("Lỗi kết nối khi kích hoạt giảng viên.");
    }
  };

  const handleNewForm = () => {
    resetForm();
    setLocalMessage("");
  };

  return (
    <div style={{ marginBottom: 40 }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
          👨‍🏫 Giảng viên mới (NEW)
        </h3>
        <button
          onClick={handleNewForm}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #5865f2",
            backgroundColor: "#fff",
            color: "#5865f2",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          + Thêm giảng viên mới
        </button>
      </div>

      {/* LOCAL MESSAGE */}
      {localMessage && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 8,
            backgroundColor: "#e6f4ff",
            borderLeft: "4px solid #1677ff",
            color: "#0050b3",
            fontSize: 14,
          }}
        >
          {localMessage}
        </div>
      )}

      {/* FORM */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: 20,
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Họ tên */}
          <div>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
              Họ và tên <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
              Email <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          {/* SĐT */}
          <div>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
              Số điện thoại
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0987654321"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          {/* Chuyên môn */}
          <div>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
              Chuyên môn
            </label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            >
              <option value="">-- Chọn --</option>
              <option value="IELTS">IELTS</option>
              <option value="TOEIC">TOEIC</option>
              <option value="Giao tiếp">Giao tiếp</option>
              <option value="Thiếu nhi">Thiếu nhi</option>
              <option value="Business English">Business English</option>
            </select>
          </div>

          {/* Trình độ */}
          <div>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
              Trình độ
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            >
              <option value="">-- Chọn --</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Kinh nghiệm */}
          <div>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
              Kinh nghiệm (năm)
            </label>
            <input
              type="number"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              min="0"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          {/* Lương theo giờ */}
          <div>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
              Lương theo giờ (VNĐ)
            </label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              min="0"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          {/* Bio */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
              Giới thiệu
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="3"
              placeholder="Mô tả ngắn về giảng viên..."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                resize: "vertical",
              }}
            />
          </div>

          {/* Ghi chú */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
              Ghi chú
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="2"
              placeholder="Ghi chú thêm..."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                resize: "vertical",
              }}
            />
          </div>
        </div>

        {/* BUTTONS */}
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#5865f2",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {editingId ? "Cập nhật" : "Lưu"}
          </button>
          {editingId && (
            <button
              onClick={resetForm}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                backgroundColor: "#fff",
                color: "#333",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Hủy
            </button>
          )}
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Tìm theo tên, SĐT, email..."
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#5865f2",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Tìm
        </button>
      </div>

      {/* LIST */}
      {newInstructors.length === 0 ? (
        <p style={{ color: "#999", fontStyle: "italic" }}>
          Chưa có giảng viên nào ở trạng thái NEW.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>ID</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Họ tên</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>SĐT</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Chuyên môn</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Trình độ</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Lương/giờ</th>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {newInstructors.map((ins) => (
                <tr key={ins.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px" }}>{ins.id}</td>
                  <td style={{ padding: "12px", fontWeight: 500 }}>{ins.full_name}</td>
                  <td style={{ padding: "12px" }}>{ins.email}</td>
                  <td style={{ padding: "12px" }}>{ins.phone || "N/A"}</td>
                  <td style={{ padding: "12px" }}>{ins.specialization || "N/A"}</td>
                  <td style={{ padding: "12px" }}>{ins.level || "N/A"}</td>
                  <td style={{ padding: "12px" }}>
                    {ins.hourly_rate ? `${Number(ins.hourly_rate).toLocaleString()} VNĐ` : "N/A"}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => handleEditFromList(ins)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #5865f2",
                        backgroundColor: "#fff",
                        color: "#5865f2",
                        cursor: "pointer",
                        marginRight: 8,
                        fontSize: 13,
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleActivate(ins)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "none",
                        backgroundColor: "#10b981",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      Kích hoạt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
