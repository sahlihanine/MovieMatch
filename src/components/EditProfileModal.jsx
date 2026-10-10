import { useEffect, useState } from "react";
import {
  IonButton, IonButtons, IonContent, IonHeader, IonInput, IonModal,
  IonTitle, IonToolbar, useIonToast,
} from "@ionic/react";
import UserAvatar from "./UserAvatar";
import { takePhoto, CameraSource } from "../services/cameraService";
import { updateUserProfile } from "../services/userService";
import { isAgeValid, isNameValid } from "../utils/validators";

const EditProfileModal = ({ isOpen, onClose, uid, profile }) => {
  const [presentToast] = useIonToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", age: "" });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  // à l'ouverture, on pré-remplit avec le profil actuel
  useEffect(() => {
    if (isOpen && profile) {
      setForm({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        age: profile.age ? String(profile.age) : "",
      });
      setPhoto(null);
    }
  }, [isOpen, profile]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.detail.value ?? "" });

  const pick = async (source) => {
    try { setPhoto(await takePhoto(source)); } catch { /* annulé */ }
  };

  const save = async () => {
    if (!isNameValid(form.firstName) || !isNameValid(form.lastName) || !isAgeValid(form.age)) {
      return presentToast({ message: "Please check your name and age", duration: 1800, color: "danger", position: "top" });
    }
    setSaving(true);
    try {
      const data = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        age: Number(form.age),
      };
      if (photo) data.photoURL = photo;
      await updateUserProfile(uid, data);
      presentToast({ message: "Profile updated", duration: 1500, color: "success", position: "top" });
      onClose();
    } catch {
      presentToast({ message: "Update failed", duration: 1800, color: "danger", position: "top" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonButton onClick={onClose}>Cancel</IonButton></IonButtons>
          <IonTitle>Edit profile</IonTitle>
          <IonButtons slot="end"><IonButton strong disabled={saving} onClick={save}>Save</IonButton></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <UserAvatar src={photo || profile?.photoURL} name={`${form.firstName} ${form.lastName}`} size={96} />
          <div style={{ marginTop: 8 }}>
            <IonButton size="small" fill="outline" color="tertiary" onClick={() => pick(CameraSource.Camera)}>
              Take photo
            </IonButton>
            <IonButton size="small" fill="outline" color="medium" onClick={() => pick(CameraSource.Photos)}>
              Gallery
            </IonButton>
          </div>
        </div>

        <IonInput className="form-field" label="First name" labelPlacement="floating" fill="outline"
          value={form.firstName} onIonInput={set("firstName")} />
        <IonInput className="form-field" label="Last name" labelPlacement="floating" fill="outline"
          value={form.lastName} onIonInput={set("lastName")} />
        <IonInput className="form-field" label="Age" labelPlacement="floating" fill="outline"
          type="number" inputmode="numeric" value={form.age} onIonInput={set("age")} />
      </IonContent>
    </IonModal>
  );
};

export default EditProfileModal;