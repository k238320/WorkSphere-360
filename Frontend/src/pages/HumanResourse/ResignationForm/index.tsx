import React, { useState } from "react";
import axios from "axios";
import useAuth from "hooks/useAuth";

const ResignationForm = () => {
  const [reason, setReason] = useState("");
  const [resignationDate, setResignationDate] = useState("");

  const {user} = useAuth();


  const handleSubmit = async (e:any) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/resignations`, {
        user_id: user?.id, 
        reason,
        resignationDate,
      });
      alert("Resignation submitted successfully!");
      setReason("");
      setResignationDate("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit resignation.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Apply for Resignation</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <textarea
          placeholder="Reason for Resignation"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="date"
          value={resignationDate}
          onChange={(e) => setResignationDate(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{ padding: "10px", fontSize: "16px", borderRadius: "4px", border: "none", backgroundColor: "#4CAF50", color: "white", cursor: "pointer" }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ResignationForm;
