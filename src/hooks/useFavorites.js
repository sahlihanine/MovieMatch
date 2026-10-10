import { useMemo } from "react";
import { useIonToast } from "@ionic/react";
import { useAuth } from "./useAuth";
import { setFavorite } from "../services/playlistService";

export const useFavorites = () => {
  const { user, profile } = useAuth();
  const [presentToast] = useIonToast();

  const favoriteIds = useMemo(() => new Set(profile?.favoriteMovieIds ?? []), [profile]);

  const isFavorite = (movieId) => favoriteIds.has(String(movieId));

  const toggleFavorite = async (movieId) => {
    if (!user) return;
    const next = !favoriteIds.has(String(movieId));
    try {
      await setFavorite(user.uid, String(movieId), next);
      presentToast({
        message: next ? "Added to favorites" : "Removed from favorites",
        duration: 1200, position: "top",
      });
    } catch {
      presentToast({ message: "Action failed, try again", duration: 1800, color: "danger", position: "top" });
    }
  };

  return { isFavorite, toggleFavorite };
};