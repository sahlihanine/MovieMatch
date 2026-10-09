import { useState } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonIcon, IonPage, useIonAlert, useIonLoading } from "@ionic/react";
import { cameraOutline } from "ionicons/icons";
import PrimaryButton from "../../components/PrimaryButton";
import { takePhoto, CameraSource } from "../../services/cameraService";
import { updateUserPhoto } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";

const ProfilePhoto = () => {
  const history = useHistory();
  const { user } = useAuth();
  const [presentAlert] = useIonAlert();
  const [presentLoading, dismissLoading] = useIonLoading();
  const [preview, setPreview] = useState(null);

  const pick = async (source) => {
    try {
      setPreview(await takePhoto(source));
    } catch {
      /* l'utilisateur a annulé : on ne fait rien */
    }
  };

  const save = async () => {
    if (!preview) return;
    await presentLoading({ message: "Saving..." });
    try {
      await updateUserPhoto(user.uid, preview);
      history.replace("/app/home");
    } catch {
      presentAlert({ header: "Error", message: "Could not save your photo.", buttons: ["OK"] });
    } finally {
      dismissLoading();
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="page-center" style={{ textAlign: "center" }}>
          <h2 className="auth-title">Add your photo</h2>
          <p className="auth-subtitle">Take a picture with your camera or choose from your gallery</p>

          <div style={{
            width: 160, height: 160, borderRadius: "50%", margin: "0 auto 32px",
            background: "rgba(249,115,22,0.12)", display: "grid", placeItems: "center",
            overflow: "hidden",
          }}>
            {preview ? (
              <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <IonIcon icon={cameraOutline} color="tertiary" style={{ fontSize: 56 }} />
            )}
          </div>

          <PrimaryButton onClick={() => pick(CameraSource.Camera)}>Take Photo</PrimaryButton>
          <PrimaryButton fill="outline" onClick={() => pick(CameraSource.Photos)}>
            Choose from gallery
          </PrimaryButton>

          {preview && (
            <PrimaryButton color="success" onClick={save}>Save and continue</PrimaryButton>
          )}

          <p className="caption link-text" style={{ marginTop: 16 }}
             onClick={() => history.replace("/app/home")}>
            Skip for now
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePhoto;