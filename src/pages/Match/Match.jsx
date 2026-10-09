import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

const Home = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Match</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">Match works</IonContent>
  </IonPage>
);

export default Home;