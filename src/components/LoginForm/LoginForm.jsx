import { useState } from "react";
import * as usersService from "../../utilities/users-service";

import "./LoginForm.css";
export default function LoginForm({ setUser }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  function handleChange(evt) {
    setCredentials({ ...credentials, [evt.target.name]: evt.target.value });
    setError("");
  }

  async function handleSubmit(evt) {
    // Prevent form from being submitted to the server
    evt.preventDefault();
    try {
      // The promise returned by the signUp service method
      // will resolve to the user object included in the
      // payload of the JSON Web Token (JWT)
      const user = await usersService.login(credentials);
      setUser(user);
    } catch {
      setError("Log In Failed - Try Again");
    }
  }

  return (
    <div className="form-container">
      <div className="blur-box"></div>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <div className="form-item-container">
          <label id="email-id">Email</label>
          <input
            className="input-field"
            type="text"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
            placeholder="Email"
          />
          <label id="password-id">Password</label>
          <input
            className="input-field"
            id="password-input"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            placeholder="Password"
          />
          <button type="submit" className="submit-button">
            LOG IN
          </button>
        </div>
      </form>
      <p className="error-message">&nbsp;{error}</p>
    </div>
  );
}
