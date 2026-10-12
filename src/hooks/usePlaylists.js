import { useCallback, useState } from "react";
import { useIonViewWillEnter } from "@ionic/react";
import { getUserPlaylists } from "../services/playlistService";
import { useAuth } from "./useAuth";

export const usePlaylists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setPlaylists(await getUserPlaylists(user.uid));
    } catch {
      setError("Unable to load your playlists.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useIonViewWillEnter(() => { reload(); }, [reload]);

  return { playlists, loading, error, reload };
};