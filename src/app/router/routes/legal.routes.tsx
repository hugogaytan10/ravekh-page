import { PrivacyPolicyAgendaPage, PrivacyPolicyPosPage } from "../../../features/legal";

export const legalRoutes = [
  {
    path: "/politica-privacidad",
    element: <PrivacyPolicyPosPage />,
  },
  {
    path: "/politica-privacidad-agenda",
    element: <PrivacyPolicyAgendaPage />,
  },
];
