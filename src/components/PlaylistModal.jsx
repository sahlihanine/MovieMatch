import { useEffect, useState } from "react";
import {
  IonButton, IonContent, IonIcon, IonInput, IonItem,
  IonList, IonModal, IonRadio, IonRadioGroup, useIonToast,
} from "@ionic/react";
import { checkmark } from "ionicons/icons";
import { addMovieToPlaylist, createPlaylist } from "../services/playlistService";
import { useAuth } from "../hooks/useAuth";

const PlaylistModal = ({ isOpen, movieId, playlists, onClose, onDone }) => {
  const { user } = useAuth();
  const [presentToast] = useIonToast();
  const [selectedId, setSelectedId] = useState(null);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  // à l'ouverture : on repart d'un état propre, Favorites présélectionnée
  useEffect(() => {
    if (isOpen) {
      setSelectedId(playlists[0]?.id ?? null);
      setNewName("");
    }
  }, [isOpen, playlists]);

  const handleAdd = async () => {
    setSaving(true);
    try {
      let target = playlists.find((p) => p.id === selectedId);

      // un nom saisi = nouvelle playlist, prioritaire sur la sélection
      if (newName.trim()) target = await createPlaylist(user.uid, newName);
      if (!target) {
        presentToast({ message: "Select a playlist first", duration: 1500, position: "top" });
        return;
      }

      await addMovieToPlaylist(user.uid, target, String(movieId));
      presentToast({ message: `Added to ${target.name}`, duration: 1500, color: "success", position: "top" });
      onDone?.();
      onClose();
    } catch {
      presentToast({ message: "Could not add the movie", duration: 1800, color: "danger", position: "top" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={0.85} breakpoints={[0, 0.85]}>
      <IonContent className="ion-padding">
        <h2 style={{ marginTop: 0 }}>Add to your playlist</h2>
        <p className="caption">Select a playlist</p>

        <IonRadioGroup value={selectedId} onIonChange={(e) => setSelectedId(e.detail.value)}>
          <IonList lines="full">
            {playlists.map((p) => {
              const already = p.movieIds.includes(String(movieId));
              return (
                <IonItem key={p.id}>
                  <IonRadio value={p.id} color="tertiary">{p.name}</IonRadio>
                  {already && <IonIcon slot="end" icon={checkmark} color="success" />}
                </IonItem>
              );
            })}
          </IonList>
        </IonRadioGroup>

        <p className="caption" style={{ marginTop: 20 }}>Create new playlist</p>
        <IonInput
          fill="outline" placeholder="New playlist"
          value={newName} onIonInput={(e) => setNewName(e.detail.value ?? "")}
        />

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <IonButton expand="block" fill="outline" color="tertiary" shape="round" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </IonButton>
          <IonButton expand="block" color="tertiary" shape="round" style={{ flex: 1 }} disabled={saving} onClick={handleAdd}>
            Add
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default PlaylistModal;