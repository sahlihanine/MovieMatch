import { useState } from "react";
import {
  IonButton, IonContent, IonInput, IonPage, IonSelect, IonSelectOption,
  IonTextarea, useIonToast,
} from "@ionic/react";
import AdminHeader from "../../components/AdminHeader";
import { useAuth } from "../../hooks/useAuth";
import { addMovie } from "../../services/adminService";
import { GENRES } from "../../utils/constants";
import { isUrl, minLength } from "../../utils/validators";

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

  const validate = () => {
    if (!minLength(form.title, 2)) return "Title is required (2 characters minimum).";
    if (!minLength(form.description, 10)) return "Description must contain at least 10 characters.";
    if (!form.releaseDate) return "Please choose a release date.";
    if (!form.genre) return "Please choose a genre.";
    if (!isUrl(form.posterURL)) return "Poster URL must be a valid http(s) link.";
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

        <IonSelect className="form-field" label="Genre" labelPlacement="floating" fill="outline"
          interface="popover" placeholder="Select a genre"
          value={form.genre} onIonChange={(e) => setForm({ ...form, genre: e.detail.value })}>
          {GENRE_LIST.map((g) => (
            <IonSelectOption key={g} value={g}>{g}</IonSelectOption>
          ))}
        </IonSelect>

        <IonInput className="form-field" label="Poster URL" labelPlacement="floating" fill="outline"
          type="url" placeholder="https://..." value={form.posterURL} onIonInput={set("posterURL")} />

        {isUrl(form.posterURL) && (
          <img
            key={form.posterURL}
            src={form.posterURL}
            alt="Poster preview"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            style={{ display: "block", height: 160, borderRadius: 8, margin: "0 auto 16px", objectFit: "cover" }}
          />
        )}

        <IonButton expand="block" shape="round" color="tertiary" disabled={saving} onClick={submit}>
          Add Movie
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AdminAddMovie;