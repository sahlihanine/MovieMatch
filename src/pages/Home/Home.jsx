import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

const Home = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Home</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">Home works</IonContent>
  </IonPage>
);

export default Home;