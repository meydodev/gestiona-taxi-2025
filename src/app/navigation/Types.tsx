export type RootStackParamList = {
    Login: undefined; // Si no pasas parámetros
    Register: undefined; 
    Home:undefined;
    Calendar:undefined;
    AgendaScreen: { date: string };
    PeriodicalSelect:undefined;
    MonthlySummary:undefined;
    ResumePeriodicalScreen: { startDate: string; endDate: string };
    Tabs:undefined;
    PrivacyPolicy:undefined;
    LegalNotice:undefined;
    TermsOfUse:undefined;
    ForgotPassword: {email:string};
  };