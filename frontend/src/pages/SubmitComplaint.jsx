import { useState } from "react";
import axiosInstance from "../api/axiosinstance";

export default function SubmitComplaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (photo) formData.append("photo", photo);

    await axiosInstance.post("/complaints", formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("Complaint submitted!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Description" onChange={(e) => setDescription(e.target.value)} />
      <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
      <button type="submit">Submit</button>
    </form>
  );
}
