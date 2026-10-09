import { IonButton } from "@ionic/react";

const PrimaryButton = ({ children, color = "tertiary", fill = "solid", ...props }) => (
  <IonButton expand="block" shape="round" color={color} fill={fill} {...props}>
    {children}
  </IonButton>
);

export default PrimaryButton;