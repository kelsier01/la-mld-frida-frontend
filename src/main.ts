import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { IonicVue } from "@ionic/vue";

// Importar todos los componentes que quieres usar globalmente
import {
  IonApp,
  IonMenuButton,
  IonButtons,
  IonCardContent,
  IonInput,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
  IonSplitPane,
  IonAccordion,
  IonAccordionGroup,
  IonLoading,
  IonButton,
  IonImg,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonModal,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonFab,
  IonFabButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonAlert,
  IonInputPasswordToggle,
  IonDatetime,
  IonDatetimeButton,
  IonBackButton,
  IonChip,
  IonText,
  IonToggle,
  IonFooter
} from "@ionic/vue";

import "@ionic/core/css/core.css";
import "@ionic/core/css/ionic.bundle.css";
import "@ionic/vue/css/core.css";
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";
import "@ionic/vue/css/palettes/dark.system.css"; // Dark mode optional

import "./theme/variables.css";

const pinia = createPinia();

const app = createApp(App).use(pinia).use(IonicVue).use(router);

// Registrar los componentes globalmente
app.component("IonApp", IonApp);
app.component("IonContent", IonContent);
app.component("IonIcon", IonIcon);
app.component("IonItem", IonItem);
app.component("IonLabel", IonLabel);
app.component("IonList", IonList);
app.component("IonListHeader", IonListHeader);
app.component("IonMenu", IonMenu);
app.component("IonMenuToggle", IonMenuToggle);
app.component("IonNote", IonNote);
app.component("IonRouterOutlet", IonRouterOutlet);
app.component("IonSplitPane", IonSplitPane);
app.component("IonAccordion", IonAccordion);
app.component("IonAccordionGroup", IonAccordionGroup);
app.component("IonLoading", IonLoading);
app.component("IonButton", IonButton);
app.component("IonImg", IonImg);
app.component("IonCard", IonCard);
app.component("IonCardHeader", IonCardHeader);
app.component("IonCardTitle", IonCardTitle);
app.component("IonGrid", IonGrid);
app.component("IonRow", IonRow);
app.component("IonCol", IonCol);
app.component("IonHeader", IonHeader);
app.component("IonToolbar", IonToolbar);
app.component("IonTitle", IonTitle);
app.component("IonModal", IonModal);
app.component("IonPage", IonPage);
app.component("IonSearchbar", IonSearchbar);
app.component("IonSelect", IonSelect);
app.component("IonSelectOption", IonSelectOption);
app.component("IonFab", IonFab);
app.component("IonFabButton", IonFabButton);
app.component("IonInfiniteScroll", IonInfiniteScroll);
app.component("IonInfiniteScrollContent", IonInfiniteScrollContent);
app.component("IonMenuButton", IonMenuButton);
app.component("IonCardContent", IonCardContent);
app.component("IonInput", IonInput);
app.component("IonButtons", IonButtons);
app.component("IonAlert", IonAlert);
app.component("IonInputPasswordToggle", IonInputPasswordToggle);
app.component("IonDatetime", IonDatetime);
app.component("IonDatetimeButton", IonDatetimeButton);
app.component("IonBackButton", IonBackButton);
app.component("IonChip", IonChip);
app.component("IonText", IonText);
app.component("IonToggle", IonToggle);
app.component("IonFooter", IonFooter);


router.isReady().then(() => {
  app.mount("#app");
});
