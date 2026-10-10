import { useCallback, useState } from "react";
import { useIonViewWillEnter } from "@ionic/react";
import { getUserPlaylists } from "../services/playlistService";
import { useAuth } from "./useAuth";

export const usePlaylists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setPlaylists(await getUserPlaylists(user.uid));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useIonViewWillEnter(() => { reload(); }, [reload]);

  return { playlists, loading, reload };
};