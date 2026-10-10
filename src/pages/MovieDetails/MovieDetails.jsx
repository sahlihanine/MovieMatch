import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

const Home = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>MovieDetails</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">MovieDetails works</IonContent>
  </IonPage>
);

export default Home;