import { useState } from "react";
import SignUpForm from "../../components/SignUpForm/SignUpForm";
import LoginForm from "../../components/LoginForm/LoginForm";

import "./AuthPage.css";
export default function AuthPage({ setUser }) {
  const [showSignUp, setShowSignUp] = useState(false);
  return (
    <main>
      <h1>AuthPage</h1>
      {showSignUp ? (
        <SignUpForm setUser={setUser} />
      ) : (
        <LoginForm setUser={setUser} />
      )}
      <div className="switch-form">
        {showSignUp ? "already have an account? " : "New User? "}
        <button
          className="signup-login-button"
          onClick={() => setShowSignUp(!showSignUp)}
        >
          {showSignUp ? " Log In" : "Sign Up"}
        </button>
      </div>
    </main>
  );
}
