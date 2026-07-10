// =================== FIREBASE CLIENT CONFIG ===================

const firebaseConfig = {
  apiKey: "AIzaSyCwTmUEXunDrQNckm8pKb-EiI4nCkp3iTk",
  authDomain: "exam-scores-2a86c.firebaseapp.com",
  projectId: "exam-scores-2a86c",
  storageBucket: "exam-scores-2a86c.firebasestorage.app",
  messagingSenderId: "144161897073",
  appId: "1:144161897073:web:da49bb905d67955c8679d0",
  measurementId: "G-FYD7VC23MX"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Biến lưu trữ đối tượng Auth và Firestore để dùng chung toàn hệ thống
const auth = firebase.auth();
const db = firebase.firestore();
