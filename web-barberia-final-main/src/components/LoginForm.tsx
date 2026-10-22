import { useState } from "react";
import type { FormEventHandler } from "react";
import type { LoginCredentials } from "../types/auth";
import './LoginForm.css';


interface LoginFormProps {
  error?: string;
  onSubmit: (credentials: LoginCredentials) => void;
}


function LoginForm({ error, onSubmit }: LoginFormProps) {
  const [carnet, setCarnet] = useState("");
  const [password, setPassword] = useState("");


  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();


    const normalizedCarnet = carnet.trim();


    if (!normalizedCarnet || !password) {
      return;
    }


    onSubmit({
      carnet: normalizedCarnet,
      password,
    });
  };


  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h1>Acceso del personal</h1>


      <div className="field">
        <label htmlFor="carnet">CI del personal</label>


        <input
          id="carnet"
          name="carnet"
          type="text"
          inputMode="numeric"
          value={carnet}
          onChange={(event) => setCarnet(event.target.value)}
          placeholder="Ingrese su carnet"
          autoComplete="username"
          required
        />
      </div>


      <div className="field">
        <label htmlFor="password">Contraseña</label>


        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Ingrese su contraseña"
          autoComplete="current-password"
          required
        />
      </div>


      {error && (
        <p role="alert" aria-live="polite">
          {error}
        </p>
      )}


      <button className="btn" type="submit">Ingresar</button>
    </form>
  );
}


export default LoginForm;
