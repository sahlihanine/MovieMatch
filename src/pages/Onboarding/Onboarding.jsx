import { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { filmOutline, listOutline, heartOutline } from "ionicons/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Preferences } from "@capacitor/preferences";
import "swiper/css";
import "swiper/css/pagination";
import "@ionic/react/css/ionic-swiper.css";
import PrimaryButton from "../../components/PrimaryButton";
import { STORAGE_KEYS } from "../../utils/constants";

const slides = [
  {
    icon: filmOutline,
    title: "Discover Amazing Movies",
    text: "Explore thousands of movies, from classics to the latest releases.",
  },
  {
    icon: listOutline,
    title: "Create Your Favorite Playlist",
    text: "Save the movies you love and build your own collection.",
  },
  {
    icon: heartOutline,
    title: "Find Your Movie Match",
    text: "Discover users with similar movie tastes and make new friends.",
  },
];

const Onboarding = () => {
  const history = useHistory();
  const swiperRef = useRef(null);
  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;

  const finish = async () => {
    await Preferences.set({ key: STORAGE_KEYS.ONBOARDING_SEEN, value: "true" });
    history.replace("/login");
  };

  const next = () => (isLast ? finish() : swiperRef.current?.slideNext());

  return (
    <IonPage>
      <IonContent scrollY={false}>
        {/* position absolute : le conteneur occupe tout l'écran, les hauteurs en % fonctionnent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, minHeight: 0 }}>
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              onSwiper={(s) => (swiperRef.current = s)}
              onSlideChange={(s) => setIndex(s.activeIndex)}
              style={{ height: "100%" }}
            >
              {slides.map((s) => (
                <SwiperSlide key={s.title}>
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 32px 24px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 160,
                        height: 160,
                        borderRadius: "50%",
                        margin: "0 auto 32px",
                        background: "rgba(249,115,22,0.12)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <IonIcon icon={s.icon} style={{ fontSize: 72 }} color="tertiary" />
                    </div>
                    <h2>{s.title}</h2>
                    <p className="caption">{s.text}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div style={{ padding: "0 24px 32px" }}>
            <PrimaryButton onClick={next}>{isLast ? "Get Started" : "Next"}</PrimaryButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Onboarding;