// =================== API CLIENT ===================

async function loadDataFromBackend() {
  if (!currentUser) return null;
  try {
    const token = await currentUser.getIdToken();
    const res = await fetch("/api/grades/load", {
      headers: { Authorization: "Bearer " + token }
    });
    if (!res.ok) throw new Error("Load failed");
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu từ Backend:", err);
    return null;
  }
}

let saveTimeout = null;

async function saveDataToBackend(subjectsData, gradesData, weightsData) {
  if (!currentUser) return; // Nếu chưa đăng nhập thì không lưu backend
  
  if (saveTimeout) clearTimeout(saveTimeout);
  
  if (typeof setSyncStatus === "function") {
    setSyncStatus("saving");
  }
  
  return new Promise((resolve) => {
    saveTimeout = setTimeout(async () => {
      try {
    const token = await currentUser.getIdToken();
    const payload = {
      subjects: subjectsData,
      scale: gradesData,
      weights: weightsData
    };
    
    const res = await fetch("/api/grades/save", {
      method: "POST",
      headers: { 
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Lỗi Server");
    }
    
        console.log("Đã đồng bộ dữ liệu lên đám mây");
        if (typeof setSyncStatus === "function") {
          setSyncStatus("success");
        }
        resolve(true);
      } catch (err) {
        console.error("Lỗi khi lưu dữ liệu lên Backend:", err);
        if (typeof setSyncStatus === "function") {
          setSyncStatus("error");
        }
        if (typeof showToast === "function") {
          showToast("Lỗi đồng bộ: " + err.message, "error");
        }
        resolve(false);
      }
    }, 2000); // Debounce 2 giây
  });
}
