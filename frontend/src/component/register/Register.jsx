import React, { useState } from "react";
import "./Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("");
  const navigate = useNavigate();
  const handleRegisterClear = () => {
    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterConfirmPassword("");
    setRegisterRole("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    const registerDetails = {
      name: registerName,
      email: registerEmail,
      password: registerPassword,
      role: registerRole.toLowerCase(),
    };
    // console.log(registerName,registerEmail,registerPassword,registerRole)
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        registerDetails
      );
      console.log("dff")
      console.log("Successfully registered:", response.data);
      handleRegisterClear();
      setTimeout(() => {
        alert("Successfully Registered");
      }, 2000);
      navigate("/");
      console.log("d")
    } catch (error) {
      console.log("object")
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="registerbody">
      <div className="register">
        <div className="reHedder">
        <p>Register</p>
        <button onClick={()=>{navigate("/home")}} className="homeBtn">Home</button>
        </div>
        <form onSubmit={handleRegister}>
          <label>Name</label>
          <input
            value={registerName}
            type="text"
            onChange={(e) => setRegisterName(e.target.value)}
          />

          <label>Email</label>
          <input
            value={registerEmail}
            type="text"
            onChange={(e) => setRegisterEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            value={registerPassword}
            type="password"
            onChange={(e) => setRegisterPassword(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            value={registerConfirmPassword}
            type="password"
            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
          />

          <label>Role</label>
          <select
            value={registerRole}
            onChange={(e) => setRegisterRole(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Customer">Customer</option>
            <option value="Seller">Seller</option>
          </select>

          <button className="regSubBtn" type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
