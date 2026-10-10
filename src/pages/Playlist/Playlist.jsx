import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

const Home = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Playlist</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">Playlist works</IonContent>
  </IonPage>
);

export default Home;