import { useState } from "react";
import {
  IonButton, IonContent, IonIcon, IonInput, IonPage, IonSelect,
  IonSelectOption, IonTextarea, useIonToast,
} from "@ionic/react";
import { cameraOutline, closeCircle, imageOutline } from "ionicons/icons";
import AdminHeader from "../../components/AdminHeader";
import { useAuth } from "../../hooks/useAuth";
import { addMovie } from "../../services/adminService";
import { takePhoto, CameraSource } from "../../services/cameraService";
import { GENRES } from "../../utils/constants";
import { minLength } from "../../utils/validators";

const INITIAL = { title: "", description: "", releaseDate: "", genre: "", posterURL: "" };
const GENRE_LIST = Object.values(GENRES);

const AdminAddMovie = () => {
  const { user } = useAuth();
  const [presentToast] = useIonToast();
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.detail.value ?? "" });
  const toast = (message, color) =>
    presentToast({ message, duration: 2000, color, position: "top" });

  const pickImage = async (source) => {
    try {
      const dataUrl = await takePhoto(source, 600);
      setForm((f) => ({ ...f, posterURL: dataUrl }));
    } catch {
      /* l'admin a annulé : on ne fait rien */
    }
  };

  const validate = () => {
    if (!minLength(form.title, 2)) return "Title is required (2 characters minimum).";
    if (!minLength(form.description, 10)) return "Description must contain at least 10 characters.";
    if (!form.releaseDate) return "Please choose a release date.";
    if (!form.genre) return "Please choose a genre.";
    if (!form.posterURL.startsWith("data:image/")) return "Please add a poster image.";
    return null;
  };

  const submit = async () => {
    const error = validate();
    if (error) return toast(error, "danger");

    setSaving(true);
    try {
      await addMovie(user.uid, form);
      toast("Movie added to the catalog", "success");
      setForm(INITIAL);
    } catch {
      toast("Could not add the movie", "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <AdminHeader active="add-movie" />

      <IonContent className="ion-padding">
        <IonInput className="form-field" label="Title" labelPlacement="floating" fill="outline"
          placeholder="e.g. Inception" value={form.title} onIonInput={set("title")} />

        <IonTextarea className="form-field" label="Description" labelPlacement="floating" fill="outline"
          autoGrow rows={3} placeholder="Movie description..."
          value={form.description} onIonInput={set("description")} />

        <IonInput className="form-field" label="Release date" labelPlacement="floating" fill="outline"
          type="date" value={form.releaseDate} onIonInput={set("releaseDate")} />

        {/* interface "alert" : la liste s'ouvre au centre de la colonne, sans calcul de position */}
        <IonSelect className="form-field" label="Genre" labelPlacement="floating" fill="outline"
          interface="alert" interfaceOptions={{ header: "Genre" }} placeholder="Select a genre"
          value={form.genre} onIonChange={(e) => setForm({ ...form, genre: e.detail.value })}>
          {GENRE_LIST.map((g) => (
            <IonSelectOption key={g} value={g}>{g}</IonSelectOption>
          ))}
        </IonSelect>

        {/* Poster : image choisie dans la galerie ou prise avec la caméra */}
        <p className="caption" style={{ margin: "4px 0 8px" }}>Poster image</p>

        {form.posterURL ? (
          <div style={{ position: "relative", width: 134, margin: "0 auto 12px" }}>
            <img
              src={form.posterURL}
              alt="Poster preview"
              style={{ width: 134, height: 200, objectFit: "cover", borderRadius: 8, display: "block" }}
            />
            <IonButton
              fill="clear" size="small" color="light" aria-label="Remove image"
              style={{ position: "absolute", top: -6, right: -10, "--padding-start": 0, "--padding-end": 0 }}
              onClick={() => setForm({ ...form, posterURL: "" })}
            >
              <IonIcon slot="icon-only" icon={closeCircle} style={{ color: "#ef4444", fontSize: 26 }} />
            </IonButton>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <IonButton expand="block" fill="outline" color="tertiary" shape="round" style={{ flex: 1 }}
              onClick={() => pickImage(CameraSource.Photos)}>
              <IonIcon slot="start" icon={imageOutline} /> Gallery
            </IonButton>
            <IonButton expand="block" fill="outline" color="tertiary" shape="round" style={{ flex: 1 }}
              onClick={() => pickImage(CameraSource.Camera)}>
              <IonIcon slot="start" icon={cameraOutline} /> Camera
            </IonButton>
          </div>
        )}

        <IonButton expand="block" shape="round" color="tertiary" disabled={saving} onClick={submit}>
          Add Movie
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AdminAddMovie;