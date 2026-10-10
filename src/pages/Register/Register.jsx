import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonBackButton, IonButtons, IonContent, IonHeader, IonInput,
  IonPage, IonToolbar, useIonAlert, useIonLoading,
} from "@ionic/react";
import PrimaryButton from "../../components/PrimaryButton";
import { registerUser, getAuthErrorMessage } from "../../services/authService";
import {
  isAgeValid, isEmail, isNameValid, isPasswordValid,
} from "../../utils/validators";

const Register = () => {
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [presentLoading, dismissLoading] = useIonLoading();
  const [form, setForm] = useState({
    firstName: "", lastName: "", age: "", email: "", password: "",
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.detail.value ?? "" });

  const validate = () => {
    if (!isNameValid(form.firstName) || !isNameValid(form.lastName))
      return "First name and last name must have at least 2 characters.";
    if (!isAgeValid(form.age)) return "Please enter a valid age.";
    if (!isEmail(form.email)) return "Please enter a valid email.";
    if (!isPasswordValid(form.password)) return "Password must contain at least 6 characters.";
    return null;
  };

  const handleRegister = async () => {
    const error = validate();
    if (error) return presentAlert({ header: "Invalid form", message: error, buttons: ["OK"] });

    await presentLoading({ message: "Creating account..." });
    try {
      await registerUser(form);
      history.replace("/profile-photo"); // étape suivante : photo
    } catch (e) {
      presentAlert({
        header: "Registration failed",
        message: getAuthErrorMessage(e.code),
        buttons: ["OK"],
      });
    } finally {
      dismissLoading();
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join MovieMatch and start your journey</p>

        <IonInput className="form-field" label="First name" labelPlacement="floating" fill="outline"
          placeholder="e.g. Sarah" value={form.firstName} onIonInput={set("firstName")} />
        <IonInput className="form-field" label="Last name" labelPlacement="floating" fill="outline"
          placeholder="e.g. Connor" value={form.lastName} onIonInput={set("lastName")} />
        <IonInput className="form-field" label="Age" labelPlacement="floating" fill="outline"
          type="number" inputmode="numeric" value={form.age} onIonInput={set("age")} />
        <IonInput className="form-field" label="Email" labelPlacement="floating" fill="outline"
          type="email" placeholder="you@example.com" value={form.email} onIonInput={set("email")} />
        <IonInput className="form-field" label="Password" labelPlacement="floating" fill="outline"
          type="password" value={form.password} onIonInput={set("password")} />

        <PrimaryButton onClick={handleRegister} style={{ marginTop: 16 }}>Sign Up</PrimaryButton>

        <p className="caption" style={{ textAlign: "center", marginTop: 20 }}>
          Already have an account?{" "}
          <span className="link-text" onClick={() => history.replace("/login")}>Login</span>
        </p>
      </IonContent>
    </IonPage>
  );
};

export default Register;