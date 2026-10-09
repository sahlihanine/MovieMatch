import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonContent, IonIcon, IonInput, IonPage, IonText,
  useIonAlert, useIonLoading,
} from "@ionic/react";
import { filmOutline, logoGoogle } from "ionicons/icons";
import PrimaryButton from "../../components/PrimaryButton";
import {
  loginUser, loginWithGoogle, resetPassword, getAuthErrorMessage,
} from "../../services/authService";
import { isEmail } from "../../utils/validators";

const Login = () => {
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [presentLoading, dismissLoading] = useIonLoading();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const showError = (message) =>
    presentAlert({ header: "Login failed", message, buttons: ["OK"] });

  const handleLogin = async () => {
    if (!isEmail(email) || !password) {
      return showError("Please enter a valid email and your password.");
    }
    await presentLoading({ message: "Signing in..." });
    try {
      await loginUser(email, password);
      history.replace("/app/home");
    } catch (e) {
      showError(getAuthErrorMessage(e.code));
    } finally {
      dismissLoading();
    }
  };

  const handleGoogle = async () => {
    await presentLoading({ message: "Signing in..." });
    try {
      await loginWithGoogle();
      history.replace("/app/home");
    } catch (e) {
      showError(getAuthErrorMessage(e.code));
    } finally {
      dismissLoading();
    }
  };

  const handleForgot = () =>
    presentAlert({
      header: "Reset password",
      message: "Enter your email to receive a reset link.",
      inputs: [{ name: "email", type: "email", placeholder: "you@example.com", value: email }],
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Send",
          handler: async (data) => {
            try {
              await resetPassword(data.email);
              presentAlert({ header: "Email sent", message: "Check your inbox.", buttons: ["OK"] });
            } catch (e) {
              showError(getAuthErrorMessage(e.code));
            }
          },
        },
      ],
    });

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="page-center">
          <div style={{ textAlign: "center" }}>
            <IonIcon icon={filmOutline} color="tertiary" style={{ fontSize: 48 }} />
            <h2 style={{ margin: 0 }}>MovieMatch</h2>
          </div>

          <h2 className="auth-title">Welcome Back!</h2>
          <p className="auth-subtitle">Sign in to continue</p>

          <IonInput
            className="form-field"
            label="Email" labelPlacement="floating" fill="outline"
            type="email" placeholder="you@example.com"
            value={email} onIonInput={(e) => setEmail(e.detail.value ?? "")}
          />
          <IonInput
            className="form-field"
            label="Password" labelPlacement="floating" fill="outline"
            type="password"
            value={password} onIonInput={(e) => setPassword(e.detail.value ?? "")}
          />

          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <span className="link-text caption" onClick={handleForgot}>Forgot password?</span>
          </div>

          <PrimaryButton onClick={handleLogin}>Login</PrimaryButton>

          <p className="caption" style={{ textAlign: "center", margin: "20px 0 8px" }}>
            or continue with
          </p>
          <PrimaryButton fill="outline" color="medium" onClick={handleGoogle}>
            <IonIcon slot="start" icon={logoGoogle} /> Google
          </PrimaryButton>

          <IonText>
            <p className="caption" style={{ textAlign: "center", marginTop: 24 }}>
              Don't have an account?{" "}
              <span className="link-text" onClick={() => history.push("/register")}>Sign Up</span>
            </p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;