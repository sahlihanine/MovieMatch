import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

const Home = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>MatchResults</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">MatchResults works</IonContent>
  </IonPage>
);

export default Home;