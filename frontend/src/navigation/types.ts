import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Discover: undefined;
  Favorites: undefined;
  Studio: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Profile: { providerId: string };
  Details: { providerId: string; projectId: string };
  LeadForm: { providerId: string; projectId?: string };
  Login: undefined;
  SignUp: undefined;
  EditProfile: undefined;
  NewService: undefined;
  LeadsManagement: undefined;
  AnalyticsDashboard: undefined;
  PremiumUpgrade: undefined;
};
